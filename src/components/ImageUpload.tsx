import React, { useState, useRef } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Camera, Upload, Trash2, CheckCircle, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageUploadProps {
    orderId: string;
    images: {
        frontBroken?: string;
        backBroken?: string;
        frontRepaired?: string;
        backRepaired?: string;
    };
    onImagesChange: (newImages: {
        frontBroken?: string;
        backBroken?: string;
        frontRepaired?: string;
        backRepaired?: string;
    }) => void;
    readOnly?: boolean;
}

export function ImageUpload({ orderId, images, onImagesChange, readOnly = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState<string | null>(null);

    const handleFile = async (file: File, key: keyof typeof images) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }

        setUploading(key);
        try {
            // Generate unique path: <orderId>/<key>-<timestamp>-<random>.<ext>
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const ext = file.name.split('.').pop();
            const path = `${orderId}/${key}-${timestamp}-${random}.${ext}`;

            const response = await supabaseService.uploadOSImage(file, path);

            if (response.success && response.data) {
                onImagesChange({
                    ...images,
                    [key]: response.data
                });
            } else {
                console.error('Upload failed:', response.error);
                alert('Erro ao enviar imagem. Tente novamente.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro inesperado ao enviar imagem.');
        } finally {
            setUploading(null);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, key: keyof typeof images) => {
        const file = event.target.files?.[0];
        if (file) handleFile(file, key);
    };

    const handleDrag = (e: React.DragEvent, key: keyof typeof images) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(key);
        } else if (e.type === 'dragleave') {
            setDragActive(null);
        }
    };

    const handleDrop = (e: React.DragEvent, key: keyof typeof images) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(null);
        if (readOnly) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0], key);
        }
    };

    const handleDelete = (key: keyof typeof images) => {
        if (confirm('Tem certeza que deseja remover esta imagem?')) {
            onImagesChange({
                ...images,
                [key]: undefined
            });
        }
    };

    const renderUploadSlot = (key: keyof typeof images, label: string, icon: React.ReactNode) => {
        const imageUrl = images[key];
        const isUploading = uploading === key;
        const isDragging = dragActive === key;

        return (
            <div
                className={cn(
                    "relative flex flex-col gap-2 group",
                    readOnly && "opacity-90"
                )}
                onDragEnter={(e) => handleDrag(e, key)}
                onDragLeave={(e) => handleDrag(e, key)}
                onDragOver={(e) => handleDrag(e, key)}
                onDrop={(e) => handleDrop(e, key)}
            >
                <Label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</Label>

                <div className={cn(
                    "relative w-full aspect-square rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden",
                    isDragging ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-slate-700 bg-slate-900/50 hover:bg-slate-900",
                    imageUrl ? "border-solid border-slate-600" : "hover:border-slate-500",
                    isUploading && "opacity-80 cursor-wait"
                )}>
                    {isUploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 z-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="text-xs font-medium text-slate-300">Enviando...</span>
                        </div>
                    ) : imageUrl ? (
                        <div className="relative w-full h-full group/image">
                            <img
                                src={imageUrl}
                                alt={label}
                                className="w-full h-full object-cover"
                            />
                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-all duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    title="Visualizar"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                </a>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleDelete(key)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400 rounded-full transition-colors"
                                        title="Remover"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 transition-colors group-hover:text-slate-400">
                            <div className={cn(
                                "p-3 rounded-full bg-slate-800 transition-transform duration-300 group-hover:scale-110",
                                isDragging && "bg-blue-500/20 text-blue-500"
                            )}>
                                {icon}
                            </div>
                            <div className="text-center px-4">
                                <span className="text-xs font-medium block">
                                    {isDragging ? "Solte aqui" : "Clique ou arraste"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* File Input */}
                    {!readOnly && !isUploading && (
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileChange(e, key)}
                            disabled={isUploading}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="p-6 bg-slate-950/50 border-white/5">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-500" />
                Imagens do Aparelho
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {renderUploadSlot('frontBroken', 'Frente (Entrada)', <Upload className="h-5 w-5" />)}
                {renderUploadSlot('backBroken', 'Trás (Entrada)', <Upload className="h-5 w-5" />)}
                {renderUploadSlot('frontRepaired', 'Frente (Saída)', <CheckCircle className="h-5 w-5 text-emerald-500" />)}
                {renderUploadSlot('backRepaired', 'Trás (Saída)', <CheckCircle className="h-5 w-5 text-emerald-500" />)}
            </div>
        </Card>
    );
}
