import React, { useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Camera, Upload, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils'; // Try import, might fail if utils doesn't export cn. Assuming present.

interface ImageUploadProps {
    orderId: string; // Used for file path
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

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, key: keyof typeof images) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(key);
        try {
            // Path: <orderId>/<key>-<timestamp>.<ext>
            const timestamp = Date.now();
            const ext = file.name.split('.').pop();
            const path = `${orderId}/${key}-${timestamp}.${ext}`;

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

    const handleDelete = (key: keyof typeof images) => {
        if (confirm('Tem certeza que deseja remover esta imagem?')) {
            onImagesChange({
                ...images,
                [key]: undefined // Or null, depending on backend update logic
            });
        }
    };

    const renderUploadSlot = (key: keyof typeof images, label: string, icon: React.ReactNode) => {
        const imageUrl = images[key];
        const isUploading = uploading === key;

        return (
            <Card className="p-4 flex flex-col items-center gap-3 relative overflow-hidden group hover:border-blue-300 transition-colors">
                <Label className="font-medium text-center text-sm text-gray-700">{label}</Label>

                <div className="relative w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-blue-500">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-xs">Enviando...</span>
                        </div>
                    ) : imageUrl ? (
                        <div className="relative w-full h-full group/image">
                            <img
                                src={imageUrl}
                                alt={label}
                                className="w-full h-full object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
                                    title="Visualizar"
                                >
                                    <Camera className="h-5 w-5" />
                                </a>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleDelete(key)}
                                        className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm"
                                        title="Remover"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            {icon}
                            <span className="block text-xs mt-1">Carregar Foto</span>
                        </div>
                    )}

                    {!readOnly && !imageUrl && !isUploading && (
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(e, key)}
                            disabled={isUploading}
                        />
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Imagens do Aparelho
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderUploadSlot('frontBroken', 'Frente (Quebrado)', <span className="text-2xl">📱</span>)}
                {renderUploadSlot('backBroken', 'Trás (Quebrado)', <span className="text-2xl">🔄</span>)}
                {renderUploadSlot('frontRepaired', 'Frente (Reparado)', <span className="text-2xl text-green-500">✨</span>)}
                {renderUploadSlot('backRepaired', 'Trás (Reparado)', <span className="text-2xl text-green-500">✅</span>)}
            </div>
        </div>
    );
}

// Need to ensure utils import is correct. if it fails I'll just remove `cn` usage in next step.
