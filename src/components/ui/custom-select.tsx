import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    disabled = false,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        if (disabled) return;
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200",
                    isOpen ? "ring-2 ring-emerald-500/50 border-emerald-500" : "",
                    disabled ? "opacity-50 cursor-not-allowed bg-slate-900 border-slate-800" : "bg-slate-950 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900",
                    "text-white shadow-sm"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={cn("block truncate font-medium", !selectedOption && "text-muted-foreground")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-950/95 backdrop-blur-sm text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 w-full mt-1 max-h-60 overflow-y-auto custom-scrollbar ring-1 ring-white/5">
                    <div className="p-1 space-y-0.5">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-9 pr-2 text-sm outline-none transition-colors",
                                    option.value === value
                                        ? "bg-blue-600 text-white font-medium shadow-sm"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.value === value && (
                                    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                                <span className="block truncate">{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
