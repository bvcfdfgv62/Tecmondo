import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder } from '../types';
import { PatternLock } from '../components/PatternLock';
import { Printer, Calendar, ShieldCheck, Smartphone, User, Wrench, AlertTriangle, FileText, DollarSign, Image as ImageIcon } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);

    useEffect(() => {
        if (id) {
            const data = storageService.getServiceOrderById(id);
            if (data) {
                setOrder(data);
                setTimeout(() => window.print(), 800);
            }
        }
    }, [id]);

    if (!order) return <div className="flex items-center justify-center h-screen bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;

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
            <span className={`px-4 py-1 rounded-full text-xs font-bold border print-bg-gray print-color-blue ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="print-container font-sans text-slate-900 bg-white">

            {/* --- CABEÇALHO IMPACTANTE --- */}
            <header className="flex justify-between items-start mb-8 pb-6 border-b-4 border-blue-900 relative">
                <div className="flex flex-col items-center justify-center w-full absolute top-0 left-0 h-full pointer-events-none">
                    <div className="flex flex-col items-center">
                        <img src="/logo.jpg" alt="TECMONDO" className="h-16 mb-2 object-contain" />
                        <h1 className="text-3xl font-black tracking-tighter text-blue-900 uppercase print-color-blue">TECMONDO INFORMÁTICA</h1>
                        <p className="text-sm font-semibold text-red-600 tracking-widest uppercase print-color-red">Assistência Técnica Especializada</p>
                    </div>
                </div>

                <div className="flex flex-col items-start z-10">
                    <div className="text-[10px] text-slate-500 font-medium space-y-0.5 mt-2">
                        <p>CNPJ: 00.000.000/0001-00</p>
                        <p>Rua Exemplo, 123 - Centro</p>
                        <p>(00) 00000-0000</p>
                    </div>
                </div>

                <div className="flex flex-col items-end z-10 mt-1">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ordem de Serviço</span>
                        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none print-color-blue">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <StatusBadge status={order.status} />
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </header>

            {/* --- LAYOUT GRID --- */}
            <div className="grid grid-cols-12 gap-6">

                {/* BLOCO 1: CLIENTE */}
                <div className="col-span-12">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center print-bg-gray">
                        <div className="mr-6 text-blue-900 p-3 bg-white rounded-full border border-blue-100 print-color-blue">
                            <User size={24} />
                        </div>
                        <div className="grid grid-cols-4 gap-6 w-full text-sm">
                            <div className="col-span-2">
                                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Cliente</span>
                                <span className="block font-bold text-lg text-slate-900 truncate">{order.customerName}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Telefone / WhatsApp</span>
                                <span className="block font-medium text-slate-800 font-mono">{order.whatsapp}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">CPF / CNPJ</span>
                                <span className="block font-medium text-slate-800 font-mono">{order.cpf || '—'}</span>
                            </div>
                            {order.email && (
                                <div className="col-span-4 border-t border-dashed border-slate-200 pt-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Email:</span>
                                    <span className="text-slate-700">{order.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BLOCO 2: DADOS DO APARELHO */}
                <div className="col-span-7">
                    <div className="border border-slate-200 rounded-lg overflow-hidden h-full">
                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2 print-bg-gray">
                            <Smartphone size={16} className="text-blue-900 print-color-blue" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Dados do Aparelho</h3>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="p-3 text-slate-500 w-1/3 bg-slate-50/50 font-medium">Equipamento</td>
                                        <td className="p-3 font-bold text-slate-900">{order.equipmentType}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="p-3 text-slate-500 w-1/3 bg-slate-50/50 font-medium">Marca / Modelo</td>
                                        <td className="p-3 font-bold text-slate-900">{order.brand} <span className="font-normal text-slate-400 mx-1">|</span> {order.model}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="p-3 text-slate-500 w-1/3 bg-slate-50/50 font-medium">Identificação</td>
                                        <td className="p-3 font-mono text-slate-700">{order.serialNumber || '—'}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-slate-500 w-1/3 bg-slate-50/50 font-medium">Acessórios</td>
                                        <td className="p-3 text-slate-700 text-xs leading-tight">{order.entryCondition.noAccessories ? 'Nenhum acessório deixado' : 'Carregador / Capa / Outros'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* BLOCO 3: SEGURANÇA */}
                <div className="col-span-5">
                    <div className="border border-slate-200 rounded-lg overflow-hidden h-full flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2 print-bg-gray">
                            <ShieldCheck size={16} className="text-blue-900 print-color-blue" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Segurança</h3>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center items-center">
                            {order.patternPassword ? (
                                <div className="flex flex-col items-center">
                                    <div className="border-2 border-slate-200 rounded p-1 mb-2">
                                        <PatternLock initialValue={order.patternPassword} readOnly size={80} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Padrão de Desbloqueio</span>
                                </div>
                            ) : order.entryCondition.password ? (
                                <div className="text-center my-4">
                                    <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Senha PIN / Texto</span>
                                    <span className="block text-xl font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded print-bg-gray">
                                        {order.entryCondition.password}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center opacity-50 my-auto">
                                    <ShieldCheck size={40} className="mx-auto mb-2 text-slate-300" />
                                    <span className="text-xs">Sem senha informada</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BLOCO 4: PROBLEMA RELATADO */}
                <div className="col-span-12">
                    <div className="border border-slate-200 rounded-lg p-5 relative">
                        <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 print-color-red">
                            <AlertTriangle size={12} /> Problema Relatado
                        </span>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed italic">
                            "{order.reportedProblem}"
                        </p>
                    </div>
                </div>

                {/* BLOCO 5: DIAGNÓSTICO */}
                {order.diagnosis && (
                    <div className="col-span-12">
                        <div className="bg-blue-50/50 border-l-4 border-blue-900 p-5 rounded-r-lg print-color-blue">
                            <h3 className="text-xs font-bold text-blue-900 uppercase mb-2 flex items-center gap-2 print-color-blue">
                                <Wrench size={14} /> Diagnóstico Técnico
                            </h3>
                            <p className="text-sm text-slate-800 leading-relaxed">
                                {order.diagnosis}
                            </p>
                        </div>
                    </div>
                )}

                {/* BLOCO 6: REGISTRO FOTOGRÁFICO */}
                {(order.imgBeforeFront || order.imgAfterFront) && (
                    <div className="col-span-12">
                        <div className="border border-slate-200 rounded-lg p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                <ImageIcon size={14} /> Registro Visual
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                                {/* Antes */}
                                <div className="space-y-2">
                                    <span className="block text-center text-[10px] uppercase font-bold text-red-500 print-color-red">Antes do Reparo</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="aspect-[4/5] bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                                            {order.imgBeforeFront ? <img src={order.imgBeforeFront} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[10px] text-slate-400">Frente</div>}
                                        </div>
                                        <div className="aspect-[4/5] bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                                            {order.imgBeforeBack ? <img src={order.imgBeforeBack} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[10px] text-slate-400">Trás</div>}
                                        </div>
                                    </div>
                                </div>
                                {/* Depois */}
                                <div className="space-y-2">
                                    <span className="block text-center text-[10px] uppercase font-bold text-green-600">Depois do Reparo</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="aspect-[4/5] bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                                            {order.imgAfterFront ? <img src={order.imgAfterFront} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[10px] text-slate-400">Frente</div>}
                                        </div>
                                        <div className="aspect-[4/5] bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                                            {order.imgAfterBack ? <img src={order.imgAfterBack} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[10px] text-slate-400">Trás</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BLOCO 7: VALORES */}
                <div className="col-span-12 mt-2">
                    <div className="border border-slate-900 rounded-lg overflow-hidden">
                        <div className="bg-slate-900 text-white p-2 px-4 flex justify-between items-center print-color-blue">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} />
                                <span className="font-bold uppercase tracking-widest text-sm">Detalhamento de Valores</span>
                            </div>
                            <span className="text-[10px] opacity-70 font-normal">Valores em Reais (R$)</span>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 print-bg-gray">
                                <tr>
                                    <th className="text-left font-bold text-slate-600 uppercase text-[10px] p-3 w-2/3">Descrição do Serviço / Peça</th>
                                    <th className="text-right font-bold text-slate-600 uppercase text-[10px] p-3">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.services.map((s, i) => (
                                    <tr key={i}>
                                        <td className="p-3 text-slate-700 font-medium">{s.description}</td>
                                        <td className="p-3 text-right font-mono text-slate-600">{s.value.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* Filler rows if empty to keep shape */}
                                {order.services.length === 0 && (
                                    <tr><td colSpan={2} className="p-4 text-center text-slate-400 italic text-xs">Nenhum serviço lançado ainda</td></tr>
                                )}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200 print-bg-gray">
                                {order.discount > 0 && (
                                    <tr>
                                        <td className="p-2 px-4 text-right text-xs uppercase font-bold text-slate-500">Desconto Aplicado</td>
                                        <td className="p-2 px-4 text-right font-mono text-red-600 print-color-red">- {order.discount.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="p-3 px-4 text-right font-black uppercase text-sm text-slate-900 tracking-wide">Valor Total</td>
                                    <td className="p-3 px-4 text-right font-black text-xl text-red-600 print-color-red tracking-tight">R$ {order.totalValue.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </div>

            {/* BLOCO 8 & 9: TERMOS E ASSINATURAS (Rodapé fixo visualmente) */}
            <div className="mt-8 border-t-4 border-slate-100 pt-6 break-inside-avoid">
                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div className="text-center">
                        <div className="border-b border-slate-900 mb-2 h-1 w-3/4 mx-auto"></div>
                        <p className="font-bold text-sm uppercase text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Assinatura do Cliente</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-900 mb-2 h-1 w-3/4 mx-auto"></div>
                        <p className="font-bold text-sm uppercase text-slate-900">TECMONDO INFORMÁTICA</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Responsável Técnico</p>
                    </div>
                </div>

                <div className="text-[9px] text-justify text-slate-400 leading-tight">
                    <p>
                        <strong>CONDIÇÕES GERAIS DE PRESTAÇÃO DE SERVIÇO:</strong> 1. A garantia dos serviços prestados é de 90 (noventa) dias, conforme artigo 26, inciso II do Código de Defesa do Consumidor. 2. A garantia cobre exclusivamente a mão de obra e peças substituídas descritas nesta ordem de serviço. 3. Não estão cobertos pela garantia: danos causados por mau uso, quedas, contato com líquidos, variações de tensão elétrica ou intervenção de terceiros não autorizados. 4. A empresa não se responsabiliza por dados, arquivos ou softwares instalados no equipamento. É de inteira responsabilidade do cliente a realização de backup prévio. 5. Equipamentos não retirados no prazo máximo de 90 dias após a comunicação de conclusão do serviço serão considerados abandonados, podendo a empresa dar-lhes a destinação que melhor lhe convier para custear as despesas de armazenamento e reparo.
                    </p>
                </div>
            </div>

            {/* Print FAB */}
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
