import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Product } from '../types';
import { ArrowLeft, Save, Package, DollarSign, Tag, Truck, Image as ImageIcon, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (id === 'novo') {
            const newProduct = storageService.createProduct({});
            setProduct(newProduct);
            setLoading(false);
        } else if (id) {
            const data = storageService.getProductById(id);
            if (data) {
                setProduct(data);
            } else {
                alert('Produto não encontrado');
                navigate('/produtos');
            }
            setLoading(false);
        }
    }, [id, navigate]);

    const handleChange = (field: keyof Product, value: string | number) => {
        if (product) {
            setProduct({ ...product, [field]: value });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                handleChange('imageUrl', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (product) {
            if (!product.description || !product.barcode) {
                alert('Preencha a descrição e o código de barras.');
                return;
            }
            storageService.saveProduct(product);
            alert('Produto salvo com sucesso!');
            navigate('/produtos');
        }
    };

    const handleDelete = () => {
        if (product && window.confirm('Tem certeza que deseja excluir este produto?')) {
            storageService.deleteProduct(product.id);
            navigate('/produtos');
        }
    };

    if (loading || !product) return <div className="p-8 text-white">Carregando...</div>;

    return (
        <div className="space-y-6 animate-fade-in text-text-primary max-w-5xl mx-auto pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/produtos')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            {id === 'novo' ? 'Novo Produto' : product.description}
                        </h1>
                        {id !== 'novo' && <p className="text-xs text-muted-foreground">Cadastrado em {new Date(product.createdAt).toLocaleDateString()}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    {id !== 'novo' && (
                        <Button onClick={handleDelete} variant="destructive" className="bg-red-500 hover:bg-red-600">
                            Excluir
                        </Button>
                    )}
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
                        <Save size={18} className="mr-2" /> Salvar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* --- IMAGE PREVIEW --- */}
                <Card className="border-white/5 bg-surface/30 h-fit md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <ImageIcon size={16} /> Imagem do Produto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-square bg-slate-950 rounded-md border border-white/10 flex items-center justify-center overflow-hidden relative group">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Erro+na+Imagem';
                                    }}
                                />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                                    <span className="text-xs">Sem imagem</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Upload de Arquivo</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="bg-slate-950 border-slate-700 text-xs file:text-white file:bg-slate-800 file:border-0 file:rounded-sm file:px-2 file:py-1 file:mr-2 hover:file:bg-slate-700 cursor-pointer"
                            />
                            <p className="text-[10px] text-muted-foreground">* Max 5MB recomendado</p>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-2 text-xs text-muted-foreground">OU URL</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">URL da Imagem</label>
                            <Input
                                value={product.imageUrl || ''}
                                onChange={(e) => handleChange('imageUrl', e.target.value)}
                                className="bg-slate-950 border-slate-700 text-xs"
                                placeholder="https://..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* --- FORM FIELDS --- */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <Box size={16} /> Informações Básicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs text-muted-foreground">Descrição / Nome do Produto</label>
                                <Input
                                    value={product.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                    placeholder="Ex: Cabo HDMI 2.0 3m"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Tag size={12} /> Código de Barras (EAN/GTIN)
                                </label>
                                <Input
                                    value={product.barcode}
                                    onChange={(e) => handleChange('barcode', e.target.value)}
                                    className="bg-slate-950 border-slate-700 font-mono"
                                    placeholder="0000000000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Truck size={12} /> Fornecedor
                                </label>
                                <Input
                                    value={product.supplier}
                                    onChange={(e) => handleChange('supplier', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                    placeholder="Nome do Fornecedor"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <DollarSign size={16} /> Valores e Estoque
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Valor de Compra (Custo)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={product.purchasePrice}
                                        onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value))}
                                        className="bg-slate-950 border-slate-700 pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground text-emerald-400">Valor de Revenda</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">R$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={product.resalePrice}
                                        onChange={(e) => handleChange('resalePrice', parseFloat(e.target.value))}
                                        className="bg-slate-950 border-slate-700 pl-8 font-bold text-emerald-400"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Quantidade em Estoque</label>
                                <Input
                                    type="number"
                                    step="1"
                                    value={product.stockQuantity}
                                    onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value))}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profit Margin Calculation (Visual Aid) */}
                    <div className="bg-surface/20 p-4 rounded border border-white/5 flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Margem de Lucro Estimada:</span>
                        <span className={`font-bold font-mono ${(product.resalePrice - product.purchasePrice) > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            R$ {(product.resalePrice - product.purchasePrice).toFixed(2)}
                            <span className="text-xs ml-1 opacity-70">
                                ({product.purchasePrice > 0
                                    ? (((product.resalePrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)
                                    : '0'}%)
                            </span>
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
