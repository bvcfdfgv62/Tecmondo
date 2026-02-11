import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder } from '../types';
import { PatternLock } from '../components/PatternLock';
import { Printer, Calendar, ShieldCheck, Smartphone, User, Wrench, AlertTriangle, DollarSign, Image as ImageIcon, MapPin, Mail, MessageSquare } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                // Ensure we await the result since it's an async Supabase call
                const data = await storageService.getServiceOrderById(id);
                if (data) {
                    setOrder(data);
                    // Add a small delay for image loading before print
                    setTimeout(() => window.print(), 1500);
                } else {
                    setError('Ordem de serviço não encontrada.');
                }
            } catch (err) {
                console.error('Error loading order for print:', err);
                setError('Erro ao carregar dados da OS.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
                <p className="text-slate-500 font-medium">Preparando documento para impressão...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-red-600 font-bold">
                {error || 'Ordem de Serviço não encontrada.'}
            </div>
        );
    }

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            approved: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            diagnosing: 'bg-purple-100 text-purple-800 border-purple-200',
            pending_approval: 'bg-orange-100 text-orange-800 border-orange-200'
        };

        const labels: Record<string, string> = {
            open: 'ABERTO',
            in_progress: 'EM MANUTENÇÃO',
            completed: 'CONCLUÍDO',
            cancelled: 'CANCELADO',
            approved: 'APROVADO',
            diagnosing: 'EM ANÁLISE',
            pending_approval: 'AGUARDANDO APROVAÇÃO'
        };

        return (
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border print:bg-gray-200 print:text-blue-900 ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="print-container font-sans text-slate-800 bg-white leading-tight">

            {/* --- HEADER --- */}
            <header className="flex justify-between items-start mb-6 pb-6 border-b-2 border-slate-200">
                <div className="flex items-center gap-6">
                    <img src="/logo.jpg" alt="TECMONDO" className="h-24 w-auto object-contain" />
                    <div>
                        <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight print-color-blue">TECMONDO INFORMÁTICA</h1>
                        <p className="text-sm font-bold text-red-600 uppercase tracking-widest print-color-red">Assistência Técnica Especializada</p>
                        <div className="mt-3 space-y-1 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-2"><MapPin size={12} /> Rua Exemplo, 100, Bairro Exemplo - CEP 01234-567</div>
                            <div className="flex items-center gap-2"><MessageSquare size={12} /> (00) 99999-9999</div>
                            <div className="flex items-center gap-2"><Mail size={12} /> contato@tecmondo.com.br</div>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordem de Serviço Nº</span>
                        <span className="text-4xl font-black text-slate-900 print-color-blue mb-2">{order.id ? order.id.slice(0, 6) : '000000'}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 text-xs text-slate-500 font-medium space-y-1">
                        <div className="flex items-center justify-end gap-1">
                            <Calendar size={12} /> Entrada: {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        {order.deadline && (
                            <div className="flex items-center justify-end gap-1">
                                <Calendar size={12} /> Previsão: {new Date(order.deadline).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* --- CLIENTE --- */}
            <section className="mb-6 bg-slate-50 border border-slate-200 rounded p-4 print-bg-gray">
                <h2 className="text-xs font-bold text-blue-900 uppercase mb-3 flex items-center gap-2 print-color-blue">
                    <User size={14} /> Dados do Cliente
                </h2>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Nome Completo</span>
                        <span className="font-bold text-slate-900 text-lg">{order.customerName}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Contato</span>
                        <span className="font-medium text-slate-800">{order.whatsapp} {order.email && `• ${order.email}`}</span>
                    </div>
                    <div className="col-span-2 flex flex-col mt-1 pt-2 border-t border-slate-200 border-dashed">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Endereço / Documento</span>
                        <span className="text-slate-700">CPF/CNPJ: {order.cpf || '—'}</span>
                    </div>
                </div>
            </section>

            {/* --- APARELHO & SEGURANÇA (SIDE BY SIDE) --- */}
            <div className="grid grid-cols-12 gap-6 mb-6">

                {/* APARELHO */}
                <div className="col-span-7 border border-slate-200 rounded overflow-hidden">
                    <div className="bg-blue-900 text-white px-3 py-1.5 flex items-center gap-2 print-color-blue">
                        <Smartphone size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Dados do Aparelho</h3>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Marca</span>
                                <span className="font-bold text-slate-800">{order.brand}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">Modelo</span>
                                <span className="font-bold text-slate-800">{order.model}</span>
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">IMEI / Serial</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs inline-block print-bg-gray">{order.serialNumber || 'Não informado'}</span>
                        </div>
                        <div className="pt-2 border-t border-dashed border-slate-200">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Acessórios Deixados</span>
                            <span className="text-slate-700 text-xs italic">{order.entryCondition?.noAccessories ? 'Nenhum acessório recebido' : 'Carregador, Capa...'}</span>
                        </div>
                    </div>
                </div>

                {/* SEGURANÇA */}
                <div className="col-span-5 border border-slate-200 rounded overflow-hidden flex flex-col">
                    <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center gap-2 print-bg-gray">
                        <ShieldCheck size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Senha do Aparelho</h3>
                    </div>
                    <div className="p-4 flex-1 flex flex-col items-center justify-center">
                        {order.patternPassword ? (
                            <div className="scale-75 origin-center">
                                <PatternLock initialValue={order.patternPassword} readOnly size={100} />
                            </div>
                        ) : order.entryCondition?.password ? (
                            <div className="text-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">PIN / Senha</span>
                                <span className="text-xl font-mono font-bold bg-slate-100 px-3 py-1 rounded block print-bg-gray">{order.entryCondition.password}</span>
                            </div>
                        ) : (
                            <span className="text-slate-400 text-xs italic">Sem senha informada</span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PROBLEMA RELATADO --- */}
            <section className="mb-6 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600 print-color-red rounded-l"></div>
                <div className="bg-white border border-slate-200 border-l-0 rounded-r p-4 pl-5">
                    <h3 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-2 print-color-red">
                        <AlertTriangle size={14} /> Problema Relatado
                    </h3>
                    <p className="text-sm text-slate-800 italic leading-relaxed">
                        "{order.reportedProblem}"
                    </p>
                </div>
            </section>

            {/* BLOCO 5: DIAGNÓSTICO */}
            {order.diagnosis && (
                <div className="mb-6 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-900 print-color-blue rounded-l"></div>
                    <div className="bg-white border border-slate-200 border-l-0 rounded-r p-4 pl-5">
                        <h3 className="text-xs font-bold text-blue-900 uppercase mb-2 flex items-center gap-2 print-color-blue">
                            <Wrench size={14} /> Diagnóstico Técnico
                        </h3>
                        <p className="text-sm text-slate-800 leading-relaxed">
                            {order.diagnosis}
                        </p>
                    </div>
                </div>
            )}

            {/* --- FOTOS (GRID 2x2 or Side-by-Side as needed) --- */}
            {(order.imgBeforeFront || order.imgAfterFront) && (
                <section className="mb-6 border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 flex items-center gap-2 border-b border-slate-200 print-bg-gray">
                        <ImageIcon size={14} className="text-slate-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Registro Fotográfico</h3>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-200">
                        {/* ANTES */}
                        <div className="p-3">
                            <h4 className="text-[10px] font-bold uppercase text-center text-red-500 mb-2 print-color-red">Antes do Reparo</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded overflow-hidden flex items-center justify-center">
                                    {order.imgBeforeFront ? <img src={order.imgBeforeFront} className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-300">Frente</span>}
                                </div>
                                <div className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded overflow-hidden flex items-center justify-center">
                                    {order.imgBeforeBack ? <img src={order.imgBeforeBack} className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-300">Trás</span>}
                                </div>
                            </div>
                        </div>

                        {/* DEPOIS */}
                        <div className="p-3">
                            <h4 className="text-[10px] font-bold uppercase text-center text-green-600 mb-2">Depois do Reparo</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded overflow-hidden flex items-center justify-center">
                                    {order.imgAfterFront ? <img src={order.imgAfterFront} className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-300">Frente</span>}
                                </div>
                                <div className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded overflow-hidden flex items-center justify-center">
                                    {order.imgAfterBack ? <img src={order.imgAfterBack} className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-300">Trás</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- VALORES & SERVIÇOS --- */}
            <section className="mb-6 border border-slate-200 rounded overflow-hidden">
                <div className="bg-slate-50 px-3 py-1.5 flex justify-between items-center border-b border-slate-200 print-bg-gray">
                    <div className="flex items-center gap-2 text-blue-900 print-color-blue">
                        <Wrench size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Serviços Executados</h3>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                        <DollarSign size={12} />
                        <span className="text-[10px] font-medium">Valores em Reais (R$)</span>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                        {order.services.map((s, i) => (
                            <tr key={i}>
                                <td className="p-2 pl-4 text-slate-700">{s.description}</td>
                                <td className="p-2 pr-4 text-right font-mono text-slate-600 w-32">{s.value.toFixed(2)}</td>
                            </tr>
                        ))}
                        {/* Filler rows if empty to keep shape */}
                        {order.services.length === 0 && (
                            <tr><td colSpan={2} className="p-4 text-center text-slate-400 italic text-xs">Nenhum serviço lançado ainda</td></tr>
                        )}
                    </tbody>
                    <tfoot className="bg-slate-50 print-bg-gray border-t border-slate-200">
                        {order.discount > 0 && (
                            <tr>
                                <td className="p-2 pl-4 text-right text-xs uppercase font-bold text-slate-500">Desconto</td>
                                <td className="p-2 pr-4 text-right font-mono text-red-500 font-bold print-color-red">- {order.discount.toFixed(2)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="p-3 pl-4 text-right text-sm uppercase font-black text-slate-900">Total a Pagar</td>
                            <td className="p-3 pr-4 text-right text-xl font-black text-blue-900 print-color-blue bg-blue-50/50">R$ {order.totalValue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {/* --- TERMS & FOOTER --- */}
            <div className="mt-8 pt-4 border-t-2 border-slate-100">
                <div className="text-[9px] text-justify text-slate-400 mb-8 leading-tight">
                    <strong>TERMOS:</strong> 1. Garantia de 90 dias (Art. 26 CDC). 2. Garantia cobre apenas defeito reparado; não cobre danos por líquidos/mau uso. 3. Backup de dados é responsabilidade do cliente. 4. Aparelhos não retirados em 90 dias serão considerados abandonados.
                </div>

                <div className="grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <div className="border-b border-slate-400 mb-1 h-4 w-3/4 mx-auto"></div>
                        <p className="font-bold text-xs uppercase text-slate-800">{order.customerName}</p>
                        <p className="text-[9px] text-slate-400 uppercase">Assinatura do Cliente</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-400 mb-1 h-4 w-3/4 mx-auto"></div>
                        <p className="font-bold text-xs uppercase text-slate-800">Tecmondo Informática</p>
                        <p className="text-[9px] text-slate-400 uppercase">Técnico Responsável</p>
                    </div>
                </div>
            </div>

            {/* --- PRINT FAB --- */}
            <div className="fixed bottom-8 right-8 print:hidden z-50 animate-bounce-slow">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-900 hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Imprimir OS"
                >
                    <Printer size={28} />
                </button>
            </div>

        </div>
    );
};

export default ServiceOrderPrint;
