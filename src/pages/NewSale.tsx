import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Product, Client } from '../types';
import { ArrowLeft, ShoppingCart, User, Search, Plus, Trash2, CreditCard, Banknote, QrCode, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const NewSale: React.FC = () => {
    const navigate = useNavigate();

    // Data Sources
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Selection States
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchClientQuery, setSearchClientQuery] = useState('');

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchProductQuery, setSearchProductQuery] = useState('');
    const [productQuantity, setProductQuantity] = useState(1);

    // Cart
    const [cartItems, setCartItems] = useState<{
        id: string;
        product: Product;
        quantity: number;
        total: number;
    }[]>([]);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'money' | 'pix'>('pix');

    useEffect(() => {
        const loadJava = async () => {
            setClients(await storageService.getClients());
            setProducts(await storageService.getProducts());
        };
        loadJava();
    }, []);

    // Filter Logic
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchClientQuery.toLowerCase()) ||
        c.cpfOrCnpj.includes(searchClientQuery)
    );

    const filteredProducts = products.filter(p =>
        (p.description.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
            p.barcode.includes(searchProductQuery)) &&
        p.stockQuantity > 0
    );

    // Handlers
    const addToCart = () => {
        if (!selectedProduct) return;

        const existingItemIndex = cartItems.findIndex(item => item.product.id === selectedProduct.id);

        if (existingItemIndex >= 0) {
            // Update quantity
            const updatedCart = [...cartItems];
            updatedCart[existingItemIndex].quantity += productQuantity;
            updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].quantity * selectedProduct.resalePrice;
            setCartItems(updatedCart);
        } else {
            // Add new
            setCartItems([...cartItems, {
                id: Date.now().toString(),
                product: selectedProduct,
                quantity: productQuantity,
                total: selectedProduct.resalePrice * productQuantity
            }]);
        }

        // Reset Selection
        setSelectedProduct(null);
        setProductQuantity(1);
        setSearchProductQuery('');
    };

    const removeFromCart = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleFinalizeSale = async () => {
        if (cartItems.length === 0) {
            alert('Adicione produtos ao carrinho.');
            return;
        }

        if (!selectedClient) {
            if (!confirm('Deseja finalizar a venda sem cliente identificado?')) return;
        }

        const saleData = {
            clientId: selectedClient?.id,
            customerName: selectedClient?.name || 'Cliente Balcão',
            items: cartItems.map(item => ({
                id: item.id,
                productId: item.product.id,
                description: item.product.description,
                unitPrice: item.product.resalePrice,
                quantity: item.quantity,
                total: item.total
            })),
            totalValue: totalCartValue, // Use updated total
            paymentMethod: paymentMethod,
            status: 'completed' as const
        };

        await storageService.createSale(saleData);
        alert('Venda realizada com sucesso!');
        navigate('/dashboard'); // Or maybe a sales history page? for now dashboard is fine
    };

    const totalCartValue = cartItems.reduce((acc, item) => acc + item.total, 0);

    return (
        <div className="space-y-6 animate-fade-in text-text-primary max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="text-emerald-500" /> Nova Venda
                        </h1>
                        <p className="text-xs text-muted-foreground">Venda direta de produtos</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: SELECTION */}
                <div className="lg:col-span-7 space-y-6">

                    {/* 1. Client Selection */}
                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <User size={16} /> Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {!selectedClient ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 text-muted-foreground" size={14} />
                                        <Input
                                            placeholder="Buscar cliente..."
                                            className="pl-8 bg-slate-950 border-slate-700"
                                            value={searchClientQuery}
                                            onChange={(e) => setSearchClientQuery(e.target.value)}
                                        />
                                    </div>
                                    {searchClientQuery && (
                                        <div className="max-h-[150px] overflow-y-auto bg-slate-900 border border-slate-700 rounded-md">
                                            {filteredClients.map(client => (
                                                <button
                                                    key={client.id}
                                                    onClick={() => { setSelectedClient(client); setSearchClientQuery(''); }}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                                                >
                                                    <div className="font-bold text-white">{client.name}</div>
                                                    <div className="text-xs text-muted-foreground">{client.cpfOrCnpj}</div>
                                                </button>
                                            ))}
                                            {filteredClients.length === 0 && (
                                                <div className="p-2 text-xs text-muted-foreground text-center">Nenhum cliente encontrado</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                                    <div>
                                        <div className="font-bold text-emerald-400">{selectedClient.name}</div>
                                        <div className="text-xs text-emerald-500/70">{selectedClient.cpfOrCnpj}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)} className="h-6 text-xs hover:bg-emerald-500/20 text-emerald-400">
                                        Alterar
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. Product Selection */}
                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-sm font-bold uppercase text-blue-400 tracking-wider flex items-center gap-2">
                                <Search size={16} /> Selecionar Produtos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 text-muted-foreground" size={14} />
                                    <Input
                                        placeholder="Buscar produto por nome ou código..."
                                        className="pl-8 bg-slate-950 border-slate-700"
                                        value={searchProductQuery}
                                        onChange={(e) => setSearchProductQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto p-2">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className={cn(
                                            "w-full text-left p-3 rounded-md text-xs transition-all flex items-center justify-between group border mb-2",
                                            selectedProduct?.id === product.id
                                                ? "bg-blue-500/20 border-blue-500/50 text-white"
                                                : "bg-white/5 border-transparent hover:bg-white/10 text-slate-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} className="w-8 h-8 rounded object-cover bg-black" alt="" />
                                            )}
                                            <div>
                                                <div className="font-medium text-sm">{product.description}</div>
                                                <div className="text-[10px] opacity-70">Estoque: {product.stockQuantity}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-blue-400">R$ {product.resalePrice.toFixed(2)}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Add Interface */}
                            {selectedProduct && (
                                <div className="p-4 bg-black/20 border-t border-white/10">
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs text-muted-foreground">Produto Selecionado</p>
                                            <div className="text-sm font-bold text-white">{selectedProduct.description}</div>
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <label className="text-[10px] text-muted-foreground">Qtd.</label>
                                            <Input
                                                type="number"
                                                className="h-8 bg-slate-900 border-slate-700"
                                                value={productQuantity}
                                                onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                min={1}
                                                max={selectedProduct.stockQuantity}
                                            />
                                        </div>
                                        <Button onClick={addToCart} className="bg-blue-600 hover:bg-blue-500 h-8">
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* RIGHT COLUMN: CART & PAYMENT */}
                <div className="lg:col-span-5 space-y-6">

                    <Card className="border-white/5 bg-surface/30 sticky top-24 h-fit">
                        <CardHeader className="bg-black/20 border-b border-white/5">
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex justify-between">
                                <span>Carrinho</span>
                                <span className="text-white">{cartItems.length} itens</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Items List */}
                            <div className="max-h-[300px] overflow-y-auto p-4 space-y-2 min-h-[200px]">
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-10">
                                        <ShoppingCart size={32} className="mb-2" />
                                        <span className="text-xs">Carrinho Vazio</span>
                                    </div>
                                ) : (
                                    cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5 group hover:border-white/10">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="text-sm font-medium text-white truncate">{item.product.description}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.quantity}x R$ {item.product.resalePrice.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-emerald-400">R$ {item.total.toFixed(2)}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="p-4 border-t border-white/10 space-y-3 bg-black/10">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Forma de Pagamento</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('credit')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-2 rounded border text-xs transition-all",
                                            paymentMethod === 'credit' ? "bg-purple-500/20 border-purple-500 text-purple-300" : "bg-slate-900 border-slate-700 hover:bg-white/5"
                                        )}
                                    >
                                        <CreditCard size={14} /> Crédito
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('debit')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-2 rounded border text-xs transition-all",
                                            paymentMethod === 'debit' ? "bg-blue-500/20 border-blue-500 text-blue-300" : "bg-slate-900 border-slate-700 hover:bg-white/5"
                                        )}
                                    >
                                        <CreditCard size={14} /> Débito
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('pix')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-2 rounded border text-xs transition-all",
                                            paymentMethod === 'pix' ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-slate-900 border-slate-700 hover:bg-white/5"
                                        )}
                                    >
                                        <QrCode size={14} /> Pix
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('money')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-2 rounded border text-xs transition-all",
                                            paymentMethod === 'money' ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-slate-900 border-slate-700 hover:bg-white/5"
                                        )}
                                    >
                                        <Banknote size={14} /> Dinheiro
                                    </button>
                                </div>
                            </div>

                            {/* Total & Action */}
                            <div className="p-4 bg-black/40 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Total a Pagar</span>
                                    <span className="text-2xl font-bold text-white font-mono">R$ {totalCartValue.toFixed(2)}</span>
                                </div>
                                <Button
                                    onClick={handleFinalizeSale}
                                    className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    disabled={cartItems.length === 0}
                                >
                                    <CheckCircle className="mr-2" /> Finalizar Venda
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default NewSale;
