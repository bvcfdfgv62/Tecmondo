import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder, ServiceItem, ServiceOrderStatus, ServiceCategory, ServiceCatalogItem } from '../types';
import { SERVICE_CATALOG } from '../data/serviceCatalog';
import {
    Save, ArrowLeft, Printer, CheckCircle, Plus, Trash2, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/custom-select';

const CATEGORIES: { label: string; value: ServiceCategory }[] = [
    { label: 'Computadores / Notebooks', value: 'COMPUTADORES_NOTEBOOKS' },
    { label: 'Impressoras', value: 'IMPRESSORAS' },
    { label: 'Celulares', value: 'CELULARES' },
    { label: 'Câmeras de Segurança', value: 'CAMERAS_SEGURANCA' }
];

const ServiceOrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<ServiceOrder | null>(null);

    // Module State
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | ''>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<ServiceCatalogItem | null>(null);
    const [serviceQuantity, setServiceQuantity] = useState(1);
    const [customServicePrice, setCustomServicePrice] = useState<string>('');

    // Pre-load logic
    useEffect(() => {
        if (id === 'novo') {
            const newOrder = storageService.createServiceOrder({});
            setFormData(newOrder);
            setLoading(false);
        } else if (id) {
            const order = storageService.getServiceOrderById(id);
            if (order) {
                setFormData(order);
                if (order.repairCategory) setSelectedCategory(order.repairCategory);
            } else {
                alert('OS não encontrada');
                navigate('/os');
            }
            setLoading(false);
        }
    }, [id, navigate]);

    // Derived state for catalog
    const filteredServices = SERVICE_CATALOG.filter(service => {
        const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
        const matchesSearch = service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch && service.active;
    });

    const handleChange = (field: keyof ServiceOrder, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const handleNestedChange = (parent: keyof ServiceOrder, field: string, value: any) => {
        if (!formData) return;
        setFormData({
            ...formData,
            [parent]: {
                ...(formData[parent] as any),
                [field]: value
            }
        });
    };

    // Special handler for category change to enforce "Don't mix categories" rule
    const handleCategoryChange = (newCategory: ServiceCategory) => {
        if (!formData) return;

        // Check if there are services from a different category already added
        const hasServices = formData.services.length > 0;
        if (hasServices && formData.repairCategory && formData.repairCategory !== newCategory) {
            const confirmChange = confirm('Trocar a categoria removerá os serviços incompatíveis. Deseja continuar?');
            if (!confirmChange) return;

            // Clear services if changing category
            setFormData({ ...formData, services: [], totalValue: 0, repairCategory: newCategory });
        } else {
            setFormData({ ...formData, repairCategory: newCategory });
        }
        setSelectedCategory(newCategory);
        setSelectedCatalogItem(null);
        setSearchQuery('');
    };

    const handleSelectCatalogItem = (item: ServiceCatalogItem) => {
        setSelectedCatalogItem(item);
        setCustomServicePrice(item.value.toFixed(2));
        setServiceQuantity(1);
    };

    const addService = () => {
        if (!formData || !selectedCatalogItem) return;

        const price = parseFloat(customServicePrice);
        if (isNaN(price)) return;

        const newItem: ServiceItem = {
            id: Date.now().toString(),
            code: selectedCatalogItem.code,
            description: selectedCatalogItem.description,
            value: price * serviceQuantity,
            amount: serviceQuantity
        };

        const updatedServices = [...formData.services, newItem];
        updateTotals(updatedServices, formData.discount);

        // Reset selection
        setSelectedCatalogItem(null);
        setCustomServicePrice('');
        setServiceQuantity(1);
    };

    const removeService = (itemId: string) => {
        if (!formData) return;
        const updatedServices = formData.services.filter(s => s.id !== itemId);
        updateTotals(updatedServices, formData.discount);
    };

    const updateTotals = (services: ServiceItem[], discount: number) => {
        if (!formData) return;
        const totalServices = services.reduce((acc, item) => acc + item.value, 0);
        setFormData({
            ...formData,
            services: services,
            discount: discount,
            totalValue: Math.max(0, totalServices - discount)
        });
    };

    const handlePrint = () => {
        if (formData) {
            storageService.saveServiceOrder(formData);
            navigate(`/os/${formData.id}/imprimir`);
        }
    };

    const handleSave = () => {
        if (formData) {
            storageService.saveServiceOrder(formData);
            alert('Ordem de Serviço salva com sucesso!');
            navigate('/os');
        }
    };

    const handleStatusChange = (newStatus: ServiceOrderStatus) => {
        if (!formData) return;
        if (newStatus === 'completed' && formData.totalValue === 0) {
            alert('Não é possível finalizar uma OS com valor total zero.');
            return;
        }
        if (newStatus === 'completed' && formData.paymentStatus !== 'paid') {
            if (!confirm('O pagamento ainda não consta como PAGO. Deseja finalizar mesmo assim?')) return;
        }
        const updatedOrder = { ...formData, status: newStatus };
        setFormData(updatedOrder);
        storageService.saveServiceOrder(updatedOrder);
    };

    if (loading || !formData) return <div className="p-8 text-white">Carregando...</div>;
    const isReadOnly = formData.status === 'completed' || formData.status === 'cancelled';

    return (
        <div className="space-y-6 animate-fade-in text-text-primary max-w-6xl mx-auto pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-20 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/os')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            OS #{formData.id}
                            <span className={cn("px-2 py-0.5 rounded text-xs uppercase tracking-wider border",
                                formData.status === 'open' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    formData.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            )}>
                                {formData.status === 'open' ? 'Aberta' :
                                    formData.status === 'completed' ? 'Finalizada' :
                                        formData.status}
                            </span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={handlePrint}>
                        <Printer size={18} className="mr-2" /> Imprimir
                    </Button>
                    {!isReadOnly && (
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
                            <Save size={18} className="mr-2" /> Salvar
                        </Button>
                    )}
                    {formData.status !== 'completed' && formData.status !== 'cancelled' && (
                        <Button variant="outline" className="text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => handleStatusChange('completed')}>
                            <CheckCircle size={18} className="mr-2" /> Finalizar
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Info Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Client & Equipment Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-white/5 bg-surface/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Input value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} disabled={isReadOnly} placeholder="Nome do Cliente" />
                                <Input value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} disabled={isReadOnly} placeholder="WhatsApp" />
                                <Input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} disabled={isReadOnly} placeholder="Email" />
                                <Input value={formData.cpf || ''} onChange={(e) => handleChange('cpf', e.target.value)} disabled={isReadOnly} placeholder="CPF/CNPJ" />
                            </CardContent>
                        </Card>

                        <Card className="border-white/5 bg-surface/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Equipamento</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="flex h-10 w-full rounded-sm border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 appearance-none"
                                        value={formData.equipmentType}
                                        onChange={(e) => handleChange('equipmentType', e.target.value)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="Notebook">Notebook</option>
                                        <option value="PC">PC / Desktop</option>
                                        <option value="Celular">Celular</option>
                                        <option value="Console">Console</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                    <Input value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} disabled={isReadOnly} placeholder="Marca" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input value={formData.model} onChange={(e) => handleChange('model', e.target.value)} disabled={isReadOnly} placeholder="Modelo" />
                                    <Input value={formData.serialNumber || ''} onChange={(e) => handleChange('serialNumber', e.target.value)} disabled={isReadOnly} placeholder="Nº Série" />
                                </div>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={formData.entryCondition.turnOn} onChange={(e) => handleNestedChange('entryCondition', 'turnOn', e.target.checked)} disabled={isReadOnly} /> Liga</label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={formData.entryCondition.brokenScreen} onChange={(e) => handleNestedChange('entryCondition', 'brokenScreen', e.target.checked)} disabled={isReadOnly} /> Tela Quebrada</label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={formData.entryCondition.noAccessories} onChange={(e) => handleNestedChange('entryCondition', 'noAccessories', e.target.checked)} disabled={isReadOnly} /> Sem Acessórios</label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={formData.entryCondition.hasPassword} onChange={(e) => handleNestedChange('entryCondition', 'hasPassword', e.target.checked)} disabled={isReadOnly} /> Com Senha</label>
                                </div>
                                {formData.entryCondition.hasPassword && (
                                    <Input placeholder="Informe a senha..." value={formData.entryCondition.password || ''} onChange={(e) => handleNestedChange('entryCondition', 'password', e.target.value)} disabled={isReadOnly} />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* New Service Module Section */}
                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader className="pb-3 border-b border-white/10">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                                    <Search size={16} /> Catálogo de Serviços
                                </CardTitle>
                                {!isReadOnly && (
                                    <CustomSelect
                                        options={CATEGORIES}
                                        value={selectedCategory}
                                        onChange={(val) => handleCategoryChange(val as ServiceCategory)}
                                        placeholder="Selecione a Categoria de Reparo"
                                        className="w-[280px]"
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!selectedCategory ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    Selecione uma categoria acima para visualizar os serviços disponíveis.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5">
                                    {/* Left: Service List */}
                                    <div className="p-4 space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 text-muted-foreground" size={14} />
                                            <Input
                                                placeholder="Buscar serviço..."
                                                className="pl-8 h-9 text-xs"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="h-[250px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                            {filteredServices.map(service => (
                                                <button
                                                    key={service.code}
                                                    onClick={() => !isReadOnly && handleSelectCatalogItem(service)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-sm text-xs transition-colors flex justify-between items-center group",
                                                        selectedCatalogItem?.code === service.code
                                                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-200"
                                                            : "hover:bg-white/5 border border-transparent text-slate-300"
                                                    )}
                                                >
                                                    <span className="truncate pr-2">
                                                        <span className="font-mono opacity-50 mr-2">{service.code}</span>
                                                        {service.description}
                                                    </span>
                                                    <span className="font-mono text-emerald-400 whitespace-nowrap">
                                                        R$ {service.value.toFixed(2)}
                                                    </span>
                                                </button>
                                            ))}
                                            {filteredServices.length === 0 && (
                                                <div className="text-center py-4 text-xs text-muted-foreground">Nenhum serviço encontrado.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Add to OS */}
                                    <div className="p-4 bg-black/20 flex flex-col justify-center space-y-4">
                                        {selectedCatalogItem ? (
                                            <>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground font-mono">{selectedCatalogItem.code}</p>
                                                    <h3 className="text-sm font-semibold text-white leading-tight">{selectedCatalogItem.description}</h3>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor Unit. (R$)</label>
                                                            <Input
                                                                type="number"
                                                                className="h-8 bg-slate-900 border-slate-700"
                                                                value={customServicePrice}
                                                                onChange={(e) => setCustomServicePrice(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Quantidade</label>
                                                            <Input
                                                                type="number"
                                                                className="h-8 bg-slate-900 border-slate-700"
                                                                value={serviceQuantity}
                                                                onChange={(e) => setServiceQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                                min={1}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="pt-2">
                                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                            <span>Subtotal Item</span>
                                                            <span className="text-white font-bold">
                                                                R$ {((parseFloat(customServicePrice) || 0) * serviceQuantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <Button onClick={addService} className="w-full bg-emerald-600 hover:bg-emerald-500 h-8 text-xs uppercase tracking-wider font-bold">
                                                            <Plus size={14} className="mr-2" /> Adicionar à OS
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground text-xs py-10 opacity-50">
                                                Selecione um item da lista para adicionar.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Diagnosis Field */}
                    <Card className="border-white/5 bg-surface/30">
                        <CardContent className="pt-4 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Problema Relatado</label>
                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-sm p-3 text-sm text-white min-h-[60px]" value={formData.reportedProblem} onChange={(e) => handleChange('reportedProblem', e.target.value)} disabled={isReadOnly} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-yellow-500 uppercase mb-1 block">Diagnóstico Técnico</label>
                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-sm p-3 text-sm text-white min-h-[80px]" value={formData.diagnosis || ''} onChange={(e) => handleChange('diagnosis', e.target.value)} placeholder="Diagnóstico..." disabled={isReadOnly} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Financials & Review */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-white/5 bg-surface/30 sticky top-24">
                        <CardHeader className="bg-black/20 border-b border-white/5">
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex justify-between">
                                <span>Resumo da OS</span>
                                <span className="text-white">{formData.services.length} itens</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Selected Services List */}
                            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {formData.services.map((item) => (
                                    <div key={item.id} className="relative group bg-white/5 p-3 rounded-sm border border-transparent hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                {item.code && <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded mr-2">{item.code}</span>}
                                                <span className="text-sm font-medium text-white">{item.description}</span>
                                            </div>
                                            {!isReadOnly && (
                                                <button onClick={() => removeService(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>{item.amount || 1}x R$ {(item.value / (item.amount || 1)).toFixed(2)}</span>
                                            <span className="text-emerald-400 font-mono text-sm">R$ {item.value.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                {formData.services.length === 0 && (
                                    <div className="text-center text-muted-foreground text-xs py-8">Nenhum serviço adicionado.</div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="bg-black/40 p-4 border-t border-white/10 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>R$ {formData.services.reduce((a, b) => a + b.value, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Desconto</span>
                                    <Input
                                        type="number"
                                        className="w-24 h-8 text-right bg-transparent border-white/10 focus:border-emerald-500"
                                        value={formData.discount}
                                        onChange={(e) => updateTotals(formData.services, parseFloat(e.target.value) || 0)}
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/5">
                                    <span>Total Final</span>
                                    <span className="text-emerald-400">R$ {formData.totalValue.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Status & Payment Actions */}
                            <div className="p-4 space-y-3 border-t border-white/10">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground uppercase">Status</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-700 rounded-sm p-2 text-sm text-white"
                                        value={formData.status}
                                        onChange={(e) => handleStatusChange(e.target.value as ServiceOrderStatus)}
                                        disabled={isReadOnly && formData.status !== 'open'}
                                    >
                                        <option value="open">Aberta</option>
                                        <option value="diagnosing">Em Diagnóstico</option>
                                        <option value="pending_approval">Aguardando Aprovação</option>
                                        <option value="approved">Aprovada</option>
                                        <option value="in_progress">Em Execução</option>
                                        <option value="completed">Finalizada</option>
                                        <option value="cancelled">Cancelada</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground uppercase">Pagamento</label>
                                    <select
                                        className={cn(
                                            "w-full rounded-sm p-2 text-sm border",
                                            formData.paymentStatus === 'paid'
                                                ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                                                : "bg-slate-950 border-slate-700 text-white"
                                        )}
                                        value={formData.paymentStatus}
                                        onChange={(e) => handleChange('paymentStatus', e.target.value)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="paid">Pago</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderDetail;
