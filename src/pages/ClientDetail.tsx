import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Client, ServiceOrder, BudgetRequest } from '../types';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, FileText, History, FileQuestion, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<Client | null>(null);
    const [history, setHistory] = useState<{ orders: ServiceOrder[], budgets: BudgetRequest[] }>({ orders: [], budgets: [] });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadClient = async () => {
            try {
                setLoading(true);
                setError(null);

                if (id === 'novo') {
                    // Start fresh
                    setClient({
                        id: '',
                        name: '',
                        email: '',
                        whatsapp: '',
                        cpfOrCnpj: '',
                        address: '',
                        notes: '',
                        createdAt: new Date().toISOString()
                    } as Client);
                } else if (id) {
                    const response = await storageService.getClientById(id);
                    if (response.success && response.data) {
                        setClient(response.data);

                        if (response.data.email) {
                            const historyResponse = await storageService.getClientHistory(response.data.email);
                            if (historyResponse.success && historyResponse.data) {
                                setHistory(historyResponse.data);
                            }
                        }
                    } else {
                        setError(response.error || 'Cliente não encontrado');
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar detalhes do cliente:', err);
                setError('Falha crítica ao conectar com o servidor.');
            } finally {
                setLoading(false);
            }
        };
        loadClient();
    }, [id]);

    const handleChange = (field: keyof Client, value: string) => {
        if (client) {
            setClient({ ...client, [field]: value });
        }
    };

    const handleSave = async () => {
        if (client) {
            try {
                let response;
                if (id === 'novo') {
                    response = await storageService.createClient(client);
                } else {
                    response = await storageService.saveClient(client);
                }

                if (response.success) {
                    alert('Cliente salvo com sucesso!');
                    navigate('/clientes');
                } else {
                    alert(`Erro ao salvar: ${response.error}`);
                }
            } catch (err) {
                console.error('Erro ao salvar cliente:', err);
                alert('Erro crítico ao salvar cliente.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-400">
                <p className="text-xl font-bold mb-4">{error}</p>
                <Button onClick={() => navigate('/clientes')} variant="outline">
                    Voltar para Lista
                </Button>
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="space-y-6 animate-fade-in text-text-primary max-w-5xl mx-auto pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/clientes')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            {id === 'novo' ? 'Novo Cliente' : client.name}
                        </h1>
                        {id !== 'novo' && <p className="text-xs text-muted-foreground">Cliente desde {new Date(client.createdAt).getFullYear()}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
                        <Save size={18} className="mr-2" /> Salvar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-surface/30 border border-white/5">
                    <TabsTrigger value="details">Dados Cadastrais</TabsTrigger>
                    <TabsTrigger value="orders">Histórico de OS</TabsTrigger>
                    <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
                </TabsList>

                {/* --- DADOS CADASTRAIS --- */}
                <TabsContent value="details" className="space-y-6 mt-6">
                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <User size={16} /> Informações Pessoais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Nome Completo</label>
                                <Input
                                    value={client.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">CPF / CNPJ</label>
                                <Input
                                    value={client.cpfOrCnpj}
                                    onChange={(e) => handleChange('cpfOrCnpj', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <Phone size={16} /> Contato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Email</label>
                                <Input
                                    value={client.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">WhatsApp / Telefone</label>
                                <Input
                                    value={client.whatsapp}
                                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs text-muted-foreground">Endereço Completo</label>
                                <Input
                                    value={client.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-surface/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <FileText size={16} /> Observações Internas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-700 rounded-sm p-3 text-sm text-white min-h-[100px]"
                                value={client.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Anotações sobre o cliente..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- HISTÓRICO DE OS --- */}
                <TabsContent value="orders" className="mt-6">
                    {history.orders.length > 0 ? (
                        <div className="space-y-3">
                            {history.orders.map(os => (
                                <div key={os.id} className="bg-surface/40 p-4 rounded border border-white/5 flex justify-between items-center hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/os/${os.id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-cyan-500/10 p-2 rounded text-cyan-400">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">OS #{os.id}</p>
                                            <p className="text-xs text-muted-foreground">{os.equipmentType} - {os.brand}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-emerald-400 font-bold">R$ {os.totalValue.toFixed(2)}</p>
                                        <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">{os.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded">
                            Nenhuma Ordem de Serviço encontrada para este email.
                        </div>
                    )}
                </TabsContent>

                {/* --- ORÇAMENTOS --- */}
                <TabsContent value="budgets" className="mt-6">
                    {history.budgets.length > 0 ? (
                        <div className="space-y-3">
                            {history.budgets.map(budget => (
                                <div key={budget.id} className="bg-surface/40 p-4 rounded border border-white/5 flex justify-between items-center hover:border-amber-500/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-amber-500/10 p-2 rounded text-amber-400">
                                            <FileQuestion size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Orçamento #{budget.id}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(budget.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">{budget.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded">
                            Nenhum Orçamento encontrado para este email.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClientDetail;
