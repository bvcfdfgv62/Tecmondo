import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder, ServiceOrderStatus } from '../types';
import {
    Wrench, Plus, Search, Filter, Clock, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const ServiceOrders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await storageService.getServiceOrders();
            setOrders(data);
        } catch (err) {
            console.error('Erro ao carregar OS:', err);
            setError('Falha ao carregar OS. Tente recarregar.');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.equipmentType.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: ServiceOrderStatus) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'diagnosing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'pending_approval': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'approved': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
            case 'in_progress': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusLabel = (status: ServiceOrderStatus) => {
        switch (status) {
            case 'open': return 'Aberta';
            case 'diagnosing': return 'Em Diagnóstico';
            case 'pending_approval': return 'Aguardando Aprovação';
            case 'approved': return 'Aprovada';
            case 'in_progress': return 'Em Execução';
            case 'completed': return 'Finalizada';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-text-primary">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-sm text-primary">
                            <Wrench size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Ordens de Serviço</h1>
                    </div>
                    <p className="text-muted-foreground text-sm ml-11">Gerenciamento técnico e acompanhamento de reparos</p>
                </div>
                <Button
                    onClick={() => navigate('/os/novo')}
                    className="bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 gap-2"
                >
                    <Plus size={20} /> Nova OS
                </Button>
            </div>

            <Card className="border-white/5 bg-surface/30">
                <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Buscar por cliente, ID ou equipamento..."
                            className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-10 rounded-sm border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-48 appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="open">Aberta</option>
                        <option value="diagnosing">Em Diagnóstico</option>
                        <option value="pending_approval">Aguardando Aprovação</option>
                        <option value="approved">Aprovada</option>
                        <option value="in_progress">Em Execução</option>
                        <option value="completed">Finalizada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mx-4 rounded-sm flex items-center gap-2">
                        <span className="font-bold">Erro:</span> {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <CardContent className="p-0">
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader className="bg-surface/50">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-[100px]">OS Nº</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Equipamento</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((os) => (
                                            <TableRow key={os.id} className="border-white/5 hover:bg-white/5 group">
                                                <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                                    {os.id}
                                                </TableCell>
                                                <TableCell className="font-medium text-white">
                                                    {os.customerName}
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    {os.equipmentType} - {os.model}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide border",
                                                        getStatusColor(os.status)
                                                    )}>
                                                        {getStatusLabel(os.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/os/${os.id}`)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                                                    >
                                                        <FileText size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Nenhuma ordem de serviço encontrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

export default ServiceOrders;
