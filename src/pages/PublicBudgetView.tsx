import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { BudgetRequest } from '../types';
import { Monitor, CheckCircle, Clock, XCircle, ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PublicBudgetView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [budget, setBudget] = useState<BudgetRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundBudget = storageService.getBudgetById(id);
            setBudget(foundBudget || null);
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando...</div>;
    }

    if (!budget) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Orçamento não encontrado</h1>
                <p className="text-slate-400 mb-6">Verifique se o link está correto.</p>
                <Link to="/orcamento">
                    <Button variant="outline">Ir para solicitação</Button>
                </Link>
            </div>
        );
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'approved':
                return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle, label: 'Aprovado' };
            case 'rejected':
                return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle, label: 'Rejeitado' };
            case 'completed':
                return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: CheckCircle, label: 'Convertido em Serviço' };
            default:
                return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock, label: 'Em Análise' };
        }
    };

    const statusInfo = getStatusInfo(budget.status);

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-primary/20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in relative z-10">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 bg-surface/50 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                        <div className="p-1.5 bg-primary/20 rounded-md">
                            <Monitor size={20} className="text-primary" />
                        </div>
                        <span className="font-bold text-lg text-white tracking-wide">TEC MONDO</span>
                    </div>
                </div>

                <Card className="bg-surface/30 border-white/5 shadow-2xl backdrop-blur-sm">
                    <CardHeader className="text-center border-b border-white/5 pb-6">
                        <div className="flex justify-center mb-4">
                            <div className={cn("p-4 rounded-full", statusInfo.bg, statusInfo.color)}>
                                <statusInfo.icon size={32} />
                            </div>
                        </div>
                        <p className={cn("text-sm font-bold uppercase tracking-widest mb-1", statusInfo.color)}>
                            {statusInfo.label}
                        </p>
                        <CardTitle className="text-2xl font-bold text-white">
                            Orçamento #{budget.id}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold">Cliente</p>
                                <p className="text-white">{budget.customerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase font-bold">Data</p>
                                <p className="text-white">{new Date(budget.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-lg border border-white/5 space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Equipamento</p>
                                <p className="text-slate-200 text-sm">{budget.equipmentType} - {budget.brand} {budget.model}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Problema Relatado</p>
                                <p className="text-slate-400 text-sm italic">"{budget.problemDescription}"</p>
                            </div>
                        </div>

                        {budget.approvedValue && (
                            <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 text-center">
                                <p className="text-xs text-emerald-500 uppercase font-bold mb-1">Valor Aprovado</p>
                                <p className="text-3xl font-bold text-white">
                                    {budget.approvedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        )}

                        {(budget.status === 'pending') && (
                            <div className="bg-yellow-500/5 p-4 rounded-lg border border-yellow-500/20 text-center">
                                <p className="text-yellow-500 text-sm">
                                    Seu orçamento está sendo analisado por nossa equipe técnica.
                                    <br />
                                    Você receberá uma notificação assim que o valor for definido.
                                </p>
                            </div>
                        )}

                        <div className="pt-4 flex justify-between items-center text-xs text-muted-foreground">
                            <p>Tec Mondo - Assistência Técnica Especializada</p>
                        </div>
                    </CardContent>
                    {budget.status === 'approved' && (
                        <CardFooter className="bg-white/5 p-4 justify-center">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500">
                                Aprovar e Iniciar Serviço
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PublicBudgetView;
