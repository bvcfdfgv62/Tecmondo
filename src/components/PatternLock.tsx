import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils'; // Assuming cn exists or I'll implement a simple utility

interface PatternLockProps {
    onChange?: (pattern: string) => void;
    onEnd?: (pattern: string) => void;
    readOnly?: boolean;
    initialValue?: string; // Expect format "0-1-2-5-8"
    size?: number; // Size in pixels
}

export function PatternLock({ onChange, onEnd, readOnly = false, initialValue = '', size = 300 }: PatternLockProps) {
    const [pattern, setPattern] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    // Grid coordinates
    const DOT_RADIUS = 6; // Radius of the dots
    const ACTIVE_DOT_RADIUS = 8; // Radius when activated
    const HIT_RADIUS = 30; // Hit area radius around dots
    const GRID_SIZE = 3;
    const PADDING = 40;
    const CELL_SIZE = (size - PADDING * 2) / (GRID_SIZE - 1);

    const getDotCoords = (index: number) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        return {
            x: PADDING + col * CELL_SIZE,
            y: PADDING + row * CELL_SIZE
        };
    };

    useEffect(() => {
        if (initialValue) {
            const indices = initialValue.split('-').map(Number).filter(n => !isNaN(n));
            setPattern(indices);
        }
    }, [initialValue]);

    const getTouchPos = (e: React.TouchEvent | React.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();

        // Handle touch or mouse event
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (readOnly) return;
        e.preventDefault(); // Prevent scrolling on touch
        setIsDrawing(true);
        setPattern([]);
        checkHit(getTouchPos(e));
    };

    const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDrawing || readOnly) return;
        e.preventDefault(); // Prevent scrolling
        checkHit(getTouchPos(e));
    };

    const handleEnd = () => {
        if (!isDrawing || readOnly) return;
        setIsDrawing(false);
        if (onEnd) {
            onEnd(pattern.join('-'));
        }
        if (onChange) {
            onChange(pattern.join('-'));
        }
    };

    const checkHit = ({ x, y }: { x: number, y: number }) => {
        for (let i = 0; i < 9; i++) {
            const { x: dx, y: dy } = getDotCoords(i);
            const dist = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2);
            if (dist < HIT_RADIUS) {
                if (!pattern.includes(i)) {
                    // Logic to add intermediate dots if skipping
                    let newPattern = [...pattern];
                    if (pattern.length > 0) {
                        const last = pattern[pattern.length - 1];
                        // Check for intermediate point (e.g. 0 to 2 passes through 1)
                        const row1 = Math.floor(last / 3);
                        const col1 = last % 3;
                        const row2 = Math.floor(i / 3);
                        const col2 = i % 3;

                        if (Math.abs(row1 - row2) % 2 === 0 && Math.abs(col1 - col2) % 2 === 0) {
                            const midRow = (row1 + row2) / 2;
                            const midCol = (col1 + col2) / 2;
                            const midIndex = midRow * 3 + midCol;
                            if (!pattern.includes(midIndex)) {
                                newPattern.push(midIndex);
                            }
                        }
                    }
                    newPattern.push(i);
                    setPattern(newPattern);
                    if (onChange) onChange(newPattern.join('-'));
                }
            }
        }
    };

    return (
        <div
            className={cn("relative select-none touch-none", readOnly && "pointer-events-none opacity-80")}
            style={{ width: size, height: size }}
        >
            <svg
                ref={svgRef}
                width={size}
                height={size}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                className="absolute top-0 left-0 w-full h-full cursor-pointer bg-gray-50 rounded-lg border border-gray-200"
            >
                {/* Connection Lines */}
                {pattern.map((dotIndex, i) => {
                    if (i === 0) return null;
                    const prev = getDotCoords(pattern[i - 1]);
                    const curr = getDotCoords(dotIndex);
                    return (
                        <line
                            key={`line-${i}`}
                            x1={prev.x}
                            y1={prev.y}
                            x2={curr.x}
                            y2={curr.y}
                            stroke="#3b82f6"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className="transition-all duration-200"
                        />
                    );
                })}

                {/* Dots */}
                {Array.from({ length: 9 }).map((_, i) => {
                    const { x, y } = getDotCoords(i);
                    const isActive = pattern.includes(i);
                    return (
                        <g key={i}>
                            {/* Hit area (invisible) */}
                            <circle cx={x} cy={y} r={HIT_RADIUS} fill="transparent" />
                            {/* Visible Dot */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isActive ? ACTIVE_DOT_RADIUS : DOT_RADIUS}
                                fill={isActive ? "#3b82f6" : "#cbd5e1"}
                                className="transition-all duration-200"
                            />
                            {/* Ring effect for active dots */}
                            {isActive && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={ACTIVE_DOT_RADIUS + 4}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    opacity="0.5"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>
            {!readOnly && (
                <div className="absolute top-2 right-2 text-xs text-gray-400">
                    {isDrawing ? "Desenhando..." : "Desenhe o padrão"}
                </div>
            )}
        </div>
    );
}

// Simple fallback if 'cn' is not available in utils
// function cn(...classes: (string | undefined | null | false)[]) {
//     return classes.filter(Boolean).join(' ');
// }
