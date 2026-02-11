import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { supabaseService } from '../services/supabaseService';
import { ServiceOrder, SystemSettings } from '../types';
import { Printer, MapPin, Phone, User, Smartphone, DollarSign, Wrench } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch Order and Settings in parallel
                const [orderRes, settingsRes] = await Promise.all([
                    storageService.getServiceOrderById(id),
                    supabaseService.getSettings()
                ]);

                if (orderRes) {
                    setOrder(orderRes);
                } else {
                    setError('Ordem de serviço não encontrada.');
                }

                if (settingsRes.success && settingsRes.data) {
                    setSettings(settingsRes.data);
                }

                // Delay print slightly to ensure DOM is ready
                setTimeout(() => window.print(), 1000);

            } catch (err) {
                console.error('Error loading data:', err);
                setError('Erro ao carregar dados.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Preparando impressão...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-red-600 font-bold">
                {error || 'OS não encontrada'}
            </div>
        );
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* FAB Button - Hidden on Print */}
            <button
                onClick={() => window.print()}
                className="fixed bottom-8 right-8 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 print:hidden z-50 flex items-center justify-center"
                title="Imprimir OS"
            >
                <Printer size={24} />
            </button>

            {/* Print Container A4 */}
            <div id="print-area" className="w-full max-w-[210mm] mx-auto bg-white min-h-screen print:min-h-0 md:shadow-xl print:shadow-none p-8 md:p-[20mm] relative flex flex-col text-slate-800 font-sans leading-tight box-border print:w-full print:max-w-none print:p-0 print:m-0">

                {/* --- HEADER (Company Info) --- */}
                <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div className="flex items-center gap-6">
                        {/* Company Logo/Name */}
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
                                {settings?.companyName || 'Tecmondo Assistência'}
                            </h1>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Assistência Técnica Especializada</p>
                            <div className="space-y-1 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                    <MapPin size={12} /> {settings?.address || 'Endereço não configurado'}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone size={12} /> {settings?.phone || '(00) 0000-0000'} • {settings?.email}
                                </p>
                                <p className="flex items-center gap-2 font-mono text-[10px]">
                                    CNPJ: {settings?.cnpj || '00.000.000/0000-00'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-2">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Número da OS</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">#{order.id.slice(0, 6)}</span>
                        </div>
                        <div className="mt-1 text-[10px] font-medium text-slate-500">
                            <p>Data: {formatDate(order.createdAt)}</p>
                        </div>
                    </div>
                </header>

                {/* --- INFO GRID --- */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* CLIENTE */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1">
                            <User size={14} className="text-slate-900" />
                            <h2 className="text-sm font-black text-slate-900 uppercase">Cliente</h2>
                        </div>
                        <div className="pl-1 space-y-1">
                            <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                            <p className="text-xs text-slate-700">{order.whatsapp}</p>
                            <p className="text-xs text-slate-600">{order.email}</p>
                            <p className="text-xs text-slate-600">CPF: {order.cpf || '—'}</p>
                        </div>
                    </section>

                    {/* EQUIPAMENTO */}
                    <section>
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1">
                            <Smartphone size={14} className="text-slate-900" />
                            <h2 className="text-sm font-black text-slate-900 uppercase">Equipamento</h2>
                        </div>
                        <div className="pl-1 space-y-1">
                            <p className="text-sm font-bold text-slate-900">{order.equipmentType} - {order.brand} {order.model}</p>
                            <p className="text-xs text-slate-600">S/N: {order.serialNumber || '—'}</p>
                            <div className="flex gap-2 text-[10px] uppercase font-bold text-slate-500 mt-2">
                                {order.entryCondition?.turnOn && <span className="border border-slate-300 px-1 rounded">Liga</span>}
                                {order.entryCondition?.brokenScreen && <span className="border border-slate-300 px-1 rounded">Tela Quebrada</span>}
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- PROBLEMA / SERVIÇO --- */}
                <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-sm">
                    <h3 className="text-xs font-black text-slate-900 uppercase mb-2 flex items-center gap-2">
                        <Wrench size={14} /> Descrição do Reparo / Problema
                    </h3>
                    <p className="text-sm text-slate-800 leading-relaxed mb-4">
                        {order.reportedProblem || 'Sem descrição do problema.'}
                    </p>
                    {order.diagnosis && (
                        <>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Diagnóstico Técnico</h4>
                            <p className="text-xs text-slate-700 leading-relaxed">{order.diagnosis}</p>
                        </>
                    )}
                </div>

                {/* --- VALUES --- */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                        <DollarSign size={14} className="text-slate-900" />
                        <h2 className="text-sm font-black text-slate-900 uppercase">Valores</h2>
                    </div>

                    <table className="w-full text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-bold">
                            <tr>
                                <th className="py-2 px-3 text-left">Descrição</th>
                                <th className="py-2 px-3 text-right w-24">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.services.map((item, i) => (
                                <tr key={`srv-${i}`}>
                                    <td className="py-2 px-3 font-medium text-slate-800">{item.description}</td>
                                    <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(item.value)}</td>
                                </tr>
                            ))}
                            {order.products?.map((prod, i) => (
                                <tr key={`prod-${i}`}>
                                    <td className="py-2 px-3 font-medium text-slate-800">{prod.description} (x{prod.quantity})</td>
                                    <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(prod.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <div className="w-48 pt-2 border-t border-slate-900">
                            <div className="flex justify-between text-lg font-black text-slate-900">
                                <span>TOTAL:</span>
                                <span>{formatCurrency(order.totalValue)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SIGNATURES --- */}
                <div className="mt-auto pt-10">
                    <div className="flex justify-between gap-10">
                        <div className="flex-1 text-center">
                            <div className="border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-bold text-slate-900 uppercase">Cliente</p>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-bold text-slate-900 uppercase">Técnico Responsável</p>
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-400 text-center mt-4">
                        Documento impresso em {new Date().toLocaleString('pt-BR')}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ServiceOrderPrint;
