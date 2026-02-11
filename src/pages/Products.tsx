import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Product } from '../types';
import { Search, Plus, Package, DollarSign, Box, Tag, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Products: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await storageService.getProducts();

                if (response.success && response.data) {
                    setProducts(response.data);
                } else {
                    setError(response.error || 'Erro ao carregar produtos');
                }
            } catch (err) {
                console.error('Erro ao carregar produtos:', err);
                setError('Falha crítica ao conectar com o servidor.');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in text-text-primary pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Produtos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seu estoque e preços.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-surface/50 backdrop-blur border border-white/5 px-4 py-2 rounded-sm text-right hidden md:block">
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-0.5">TOTAL EM ESTOQUE</p>
                        <p className="text-primary font-bold text-lg leading-none">
                            {products.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0)}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/produtos/novo')}
                        className="bg-primary hover:bg-primary-hover text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    >
                        <Plus size={18} className="mr-2" /> Novo Produto
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-surface/30 p-4 rounded-sm border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Buscar por descrição, código de barras ou fornecedor..."
                        className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm flex items-center gap-2">
                    <span className="font-bold">Erro:</span> {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                /* Product List */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="bg-surface/40 border-white/5 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden"
                                onClick={() => navigate(`/produtos/${product.id}`)}
                            >
                                <CardContent className="p-0">
                                    {/* Image Area */}
                                    <div className="h-32 bg-slate-950 w-full relative border-b border-white/5">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.description}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-800">
                                                <Package size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-xs font-mono text-white border border-white/10">
                                            QTD: {product.stockQuantity}
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                                    <Tag size={10} /> {product.barcode || 'S/N'}
                                                </p>
                                                <h3 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                                                    {product.description}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400 flex items-center gap-1.5">
                                                    <Truck size={14} className="text-primary/70" /> Fornecedor
                                                </span>
                                                <span className="text-white truncate max-w-[120px]" title={product.supplier}>{product.supplier || '—'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400 flex items-center gap-1.5">
                                                    <DollarSign size={14} className="text-primary/70" /> Valor Venda
                                                </span>
                                                <span className="text-emerald-400 font-bold font-mono">
                                                    R$ {Number(product.resalePrice).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-muted-foreground bg-surface/20 rounded border border-white/5 border-dashed">
                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhum produto encontrado.</p>
                            {searchTerm && <p className="text-sm">Tente buscar por outro termo.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Products;
