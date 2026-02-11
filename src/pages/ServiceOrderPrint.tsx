import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { supabaseService } from '../services/supabaseService';
import { ServiceOrder, SystemSettings } from '../types';
import { Printer, MapPin, Phone, User, Smartphone, DollarSign, Wrench, AlertCircle } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!id) {
                if (isMounted) {
                    setError('ID is missing');
                    setLoading(false);
                }
                return;
            }

            try {
                // Parallel fetch for speed
                const [orderRes, settingsRes] = await Promise.all([
                    storageService.getServiceOrderById(id),
                    supabaseService.getSettings()
                ]);

                if (!isMounted) return;

                if (orderRes.success && orderRes.data) {
                    setOrder(orderRes.data);
                } else {
                    setError('Ordem de serviço não encontrada ou erro ao carregar.');
                }

                if (settingsRes.success && settingsRes.data) {
                    setSettings(settingsRes.data);
                }

            } catch (err) {
                console.error('Print Error:', err);
                if (isMounted) setError('Erro fatal ao carregar dados.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (val: number | undefined) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString;
        }
    };

    // --- RENDER: LOADING ---
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-slate-900 font-bold animate-pulse">Carregando OS...</p>
                </div>
            </div>
        );
    }

    // --- RENDER: ERROR ---
    if (error || !order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-red-600">
                <div className="text-center max-w-sm p-6 border border-red-200 rounded-lg bg-red-50">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2">Não foi possível carregar a OS</h2>
                    <p className="text-sm">{error || 'OS não encontrada no sistema.'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: SUCCESS (A4) ---
    return (
        <div className="print-preview-wrapper">

            {/* FLOATING ACTION BUTTON */}
            <button
                onClick={handlePrint}
                className="fixed bottom-8 right-8 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 print:hidden z-50 flex items-center justify-center group"
                title="Imprimir OS (Ctrl+P)"
                aria-label="Imprimir Ordem de Serviço"
            >
                <Printer size={24} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap ml-0 group-hover:ml-2">
                    Imprimir
                </span>
            </button>

            {/* A4 PAPER CONTAINER */}
            <div className="print-page-a4">

                {/* HEAD */}
                <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1 leading-none">
                                {settings?.companyName || 'Tecmondo Assistência'}
                            </h1>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                Comprovante de Entrada / Saída
                            </p>
                            <div className="space-y-1 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                    <MapPin size={12} className="shrink-0" />
                                    <span>{settings?.address || 'Endereço Principal, 123'}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone size={12} className="shrink-0" />
                                    <span>{settings?.phone || '(00) 0000-0000'}</span>
                                    {settings?.email && <span>• {settings.email}</span>}
                                </p>
                                <p className="flex items-center gap-2 font-mono text-[10px] pt-1 text-slate-400">
                                    CNPJ: {settings?.cnpj || '00.000.000/0001-00'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="mb-2">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Número da OS</span>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                #{order.id ? order.id.slice(0, 6).toUpperCase() : '000000'}
                            </span>
                        </div>
                        <div className="mt-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            Data: {formatDate(order.createdAt)}
                        </div>
                    </div>
                </header>

                {/* INFO GRID */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-8">

                    {/* CLIENTE */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <User size={16} className="text-slate-900" />
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">Dados do Cliente</h2>
                        </div>
                        <div className="pl-1 space-y-1.5">
                            <p className="text-base font-bold text-slate-900 leading-tight">
                                {order.customerName || 'Cliente não informado'}
                            </p>
                            <p className="text-xs text-slate-600 font-mono">
                                Tel: {order.whatsapp || order.contact || '—'}
                            </p>
                            <p className="text-xs text-slate-600">
                                Email: {order.email || '—'}
                            </p>
                            <p className="text-xs text-slate-600">
                                CPF: {order.cpf || order.cpfOrCnpj || '—'}
                            </p>
                        </div>
                    </div>

                    {/* EQUIPAMENTO */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <Smartphone size={16} className="text-slate-900" />
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">Equipamento</h2>
                        </div>
                        <div className="pl-1 space-y-1.5">
                            <p className="text-base font-bold text-slate-900 leading-tight">
                                {order.equipmentType}
                            </p>
                            <p className="text-sm text-slate-700">
                                {order.brand} <span className="text-slate-400">|</span> {order.model}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-1">
                                S/N: {order.serialNumber || '—'}
                            </p>

                            <div className="flex gap-2 pt-2">
                                {order.entryCondition?.turnOn && (
                                    <span className="text-[10px] font-bold uppercase bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                                        Liga
                                    </span>
                                )}
                                {order.entryCondition?.brokenScreen && (
                                    <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                                        Tela Quebrada
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RELATO / DEFEITO */}
                <div className="mb-8">
                    <div className="bg-slate-50 border border-slate-200 rounded p-5">
                        <h3 className="text-xs font-black text-slate-900 uppercase mb-3 flex items-center gap-2">
                            <Wrench size={14} /> Relato do Cliente / Defeito
                        </h3>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium">
                            {order.reportedProblem || 'Nenhum problema relatado.'}
                        </p>

                        {order.diagnosis && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Diagnóstico Técnico</h4>
                                <p className="text-sm text-slate-700 leading-relaxed italic">
                                    "{order.diagnosis}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* VALUES TABLE */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                        <DollarSign size={16} className="text-slate-900" />
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">Serviços & Peças</h2>
                    </div>

                    <table className="w-full text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-bold tracking-wider">
                            <tr>
                                <th className="py-2 px-4 text-left rounded-l">Descrição</th>
                                <th className="py-2 px-4 text-right rounded-r w-32">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!order.services?.length && !order.products?.length) && (
                                <tr>
                                    <td colSpan={2} className="py-4 text-center text-slate-400 italic">
                                        Nenhum serviço ou produto lançado ainda.
                                    </td>
                                </tr>
                            )}

                            {order.services?.map((item, i) => (
                                <tr key={`srv-${i}`}>
                                    <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                                    <td className="py-3 px-4 text-right text-slate-700 tabular-nums">{formatCurrency(item.value)}</td>
                                </tr>
                            ))}

                            {order.products?.map((prod, i) => (
                                <tr key={`prod-${i}`}>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                        {prod.description}
                                        {prod.quantity > 1 && <span className="text-slate-400 text-[10px] ml-1">(x{prod.quantity})</span>}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-700 tabular-nums">{formatCurrency(prod.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <div className="w-56 pt-3 border-t-2 border-slate-900">
                            <div className="flex justify-between items-baseline text-slate-900">
                                <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                                <span className="text-2xl font-black tabular-nums">{formatCurrency(order.totalValue)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIGNATURES */}
                <div className="mt-auto pt-8 avoid-break">
                    <div className="flex justify-between gap-16">
                        <div className="flex-1 text-center">
                            <div className="border-b border-slate-300 mb-3"></div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                Assinatura do Cliente
                            </p>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="border-b border-slate-300 mb-3"></div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                Técnico Responsável
                            </p>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center mt-12 pt-6 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            Obrigado pela preferência • {settings?.companyName || 'Tecmondo'}
                        </p>
                        <p className="text-[9px] text-slate-300 mt-1 font-mono">
                            ID: {order.id} • {new Date().toISOString()}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ServiceOrderPrint;
