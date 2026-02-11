import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder } from '../types';
import { PatternLock } from '../components/PatternLock';
import { Printer, MapPin, Phone, Calendar, AlertTriangle, Wrench, CheckCircle, Smartphone, User, DollarSign, Image as ImageIcon } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const data = await storageService.getServiceOrderById(id);
                if (data) {
                    setOrder(data);
                    // Retardando o print para garantir que imagens carreguem
                    setTimeout(() => window.print(), 1000);
                } else {
                    setError('Ordem de serviço não encontrada.');
                }
            } catch (err) {
                console.error('Error loading order:', err);
                setError('Erro ao carregar dados da OS.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Carregando Ordem de Serviço...</p>
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

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            open: "bg-yellow-100 text-yellow-800 border-yellow-200",
            in_progress: "bg-blue-100 text-blue-800 border-blue-200",
            completed: "bg-green-100 text-green-800 border-green-200",
            cancelled: "bg-red-100 text-red-800 border-red-200",
            approved: "bg-indigo-100 text-indigo-800 border-indigo-200",
            diagnosing: "bg-purple-100 text-purple-800 border-purple-200",
            pending_approval: "bg-orange-100 text-orange-800 border-orange-200",
        };

        const labelMap: Record<string, string> = {
            open: 'ABERTO',
            in_progress: 'EM ANDAMENTO',
            completed: 'CONCLUÍDO',
            cancelled: 'CANCELADO',
            approved: 'APROVADO',
            diagnosing: 'EM ANÁLISE',
            pending_approval: 'AGUARDANDO APROVAÇÃO',
        };

        return (
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${map[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                {labelMap[status] || status}
            </span>
        );
    };

    const ConditionCheckbox = ({ label, checked }: { label: string; checked: boolean }) => (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center ${checked ? 'bg-slate-800 border-slate-800' : 'bg-white'}`}>
                {checked && <CheckCircle size={12} className="text-white" />}
            </div>
            <span className={`text-[10px] uppercase font-bold ${checked ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white flex justify-center">
            {/* FAB Button - Hidden on Print */}
            <button
                onClick={() => window.print()}
                className="fixed bottom-8 right-8 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 print:hidden z-50 flex items-center justify-center"
                title="Imprimir OS"
            >
                <Printer size={24} />
            </button>

            {/* Print Container A4 */}
            <div id="print-area" className="w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-[20mm] relative flex flex-col text-slate-800 font-sans leading-tight box-border">

                {/* --- HEADER --- */}
                <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div className="flex items-center gap-6">
                        {/* Logo Placeholder - Adjust src as needed */}
                        <div className="h-24 w-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden">
                            <img src="/logo.jpg" alt="LOGO" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span className="text-xs text-slate-400 font-bold">LOGO</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-1">Tecmondo</h1>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Assistência Técnica Especializada</p>
                            <div className="space-y-1 text-xs text-slate-600">
                                <p className="flex items-center gap-2"><MapPin size={12} /> Rua Exemplo, 123 - Centro, Cidade/UF</p>
                                <p className="flex items-center gap-2"><Phone size={12} /> (11) 99999-9999 • contato@tecmondo.com.br</p>
                                <p className="flex items-center gap-2 font-mono text-[10px]">CNPJ: 00.000.000/0001-00</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="mb-4">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Número da OS</span>
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">#{order.id.slice(0, 6)}</span>
                        </div>
                        {getStatusBadge(order.status)}
                        <div className="mt-3 text-[10px] font-medium text-slate-500">
                            <p>Entrada: {formatDate(order.createdAt)}</p>
                            {order.deadline && <p>Previsão: {formatDate(order.deadline)}</p>}
                        </div>
                    </div>
                </header>

                {/* --- TWO COLUMNS: CLIENT & DEVICE --- */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* CLIENTE */}
                    <section>
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                            <User size={16} className="text-slate-900" />
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Dados do Cliente</h2>
                        </div>
                        <div className="space-y-3 pl-1">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400">Nome Completo</label>
                                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400">Telefone / WhatsApp</label>
                                    <p className="text-xs font-semibold text-slate-800">{order.whatsapp}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400">CPF / Documento</label>
                                    <p className="text-xs font-semibold text-slate-800">{order.cpf || '—'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400">Email</label>
                                <p className="text-xs text-slate-600">{order.email || '—'}</p>
                            </div>
                        </div>
                    </section>

                    {/* APARELHO */}
                    <section>
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                            <Smartphone size={16} className="text-slate-900" />
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Dados do Equipamento</h2>
                        </div>
                        <div className="space-y-3 pl-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400">Tipo</label>
                                    <p className="text-xs font-bold text-slate-900">{order.equipmentType}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400">Marca / Modelo</label>
                                    <p className="text-xs font-semibold text-slate-800">{order.brand} {order.model}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400">Nº Série / IMEI</label>
                                <p className="text-xs font-mono text-slate-600 bg-slate-100 inline-block px-1 rounded">{order.serialNumber || '—'}</p>
                            </div>

                            {/* Checkboxes */}
                            <div className="grid grid-cols-2 gap-y-2 gap-x-1 pt-2">
                                <ConditionCheckbox label="Liga" checked={order.entryCondition.turnOn} />
                                <ConditionCheckbox label="Tela Quebrada" checked={order.entryCondition.brokenScreen} />
                                <ConditionCheckbox label="Sem Acessórios" checked={order.entryCondition.noAccessories} />
                                <ConditionCheckbox label="Com Senha" checked={order.entryCondition.hasPassword || !!order.patternPassword} />
                            </div>

                            {/* Senha Visual */}
                            <div className="pt-2 mt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Senha / Padrão</span>
                                {order.patternPassword ? (
                                    <div className="scale-[0.4] origin-right -my-4">
                                        <PatternLock initialValue={order.patternPassword} readOnly size={80} />
                                    </div>
                                ) : (
                                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{order.entryCondition.password || 'Sem Senha'}</span>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- PROBLEM & DIAGNOSIS --- */}
                <div className="mb-8 space-y-4">
                    <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-md">
                        <h3 className="text-xs font-black text-slate-900 uppercase mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" /> Relato do Cliente
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed italic">"{order.reportedProblem}"</p>
                    </div>

                    {order.diagnosis && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                            <h3 className="text-xs font-black text-blue-900 uppercase mb-2 flex items-center gap-2">
                                <Wrench size={14} className="text-blue-600" /> Diagnóstico Técnico
                            </h3>
                            <p className="text-xs text-slate-800 leading-relaxed">{order.diagnosis}</p>
                        </div>
                    )}
                </div>

                {/* --- IMAGES GRID --- */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                        <ImageIcon size={16} className="text-slate-900" />
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Registro Fotográfico</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Antes (Frente)', src: order.imgBeforeFront },
                            { label: 'Antes (Trás)', src: order.imgBeforeBack },
                            { label: 'Depois (Frente)', src: order.imgAfterFront },
                            { label: 'Depois (Trás)', src: order.imgAfterBack },
                        ].map((img, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <div className="aspect-[3/4] bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                                    {img.src ? (
                                        <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">Sem Foto</span>
                                    )}
                                </div>
                                <span className="text-[8px] font-bold text-center text-slate-500 uppercase">{img.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- FINANCIALS --- */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-slate-900" />
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Valores e Serviços</h2>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            Pagamento: {order.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE'}
                        </div>
                    </div>

                    <table className="w-full text-xs mb-4">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-bold">
                            <tr>
                                <th className="py-2 px-3 text-left w-16">Item</th>
                                <th className="py-2 px-3 text-left">Descrição</th>
                                <th className="py-2 px-3 text-right w-16">Qtd.</th>
                                <th className="py-2 px-3 text-right w-24">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.services.map((item, i) => (
                                <tr key={`srv-${i}`}>
                                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{i + 1}</td>
                                    <td className="py-2 px-3 font-medium text-slate-800">{item.description}</td>
                                    <td className="py-2 px-3 text-right text-slate-600">1</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-700">{item.value.toFixed(2)}</td>
                                </tr>
                            ))}
                            {order.products && order.products.map((prod, i) => (
                                <tr key={`prod-${i}`}>
                                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{order.services.length + i + 1}</td>
                                    <td className="py-2 px-3 font-medium text-slate-800">{prod.description} <span className="text-[9px] text-slate-400 font-normal ml-1">(Produto)</span></td>
                                    <td className="py-2 px-3 text-right text-slate-600">{prod.quantity}</td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-700">{prod.total.toFixed(2)}</td>
                                </tr>
                            ))}
                            {!order.services.length && (!order.products || !order.products.length) && (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-slate-400 italic font-medium">Nenhum serviço ou produto lançado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-48 space-y-1">
                            {order.discount > 0 && (
                                <div className="flex justify-between text-xs text-red-500 font-bold">
                                    <span>Desconto:</span>
                                    <span>- {order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-1">
                                <span>TOTAL:</span>
                                <span>{formatCurrency(order.totalValue)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER & SIGNATURE --- */}
                <div className="mt-auto pt-6">
                    <div className="grid grid-cols-2 gap-16 mb-6">
                        <div className="text-center">
                            <div className="border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-bold text-slate-900 uppercase">{order.customerName}</p>
                            <p className="text-[9px] text-slate-500 uppercase">Assinatura do Cliente</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-bold text-slate-900 uppercase">Tecmondo Informática</p>
                            <p className="text-[9px] text-slate-500 uppercase">Assinatura do Técnico / Responsável</p>
                        </div>
                    </div>

                    <div className="text-[8px] text-slate-400 text-justify leading-snug border-t border-slate-200 pt-3">
                        <p><strong>TERMOS DE GARANTIA:</strong> A garantia legal é de 90 dias (Art. 26 CDC). Cobrimos apenas o serviço executado e peças trocadas. Perda de garantia imediata em caso de: mau uso, quedas, contato com líquidos, violação de selos ou manutenção por terceiros. Não nos responsabilizamos por backup de dados. Equipamentos não retirados em 90 dias após notificação serão descartados ou vendidos para custeio (Lei 11.111/2005).</p>
                        <p className="mt-1 text-center font-mono">Sistema Tecmondo Manager v1.0 • Impresso em {new Date().toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderPrint;
