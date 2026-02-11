import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder } from '../types';
import { PatternLock } from '../components/PatternLock';
import { Printer, MapPin, Phone, Calendar, AlertTriangle, Wrench, CheckCircle, Smartphone, User, DollarSign, Image as ImageIcon, Box } from 'lucide-react';

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
                    // Delay print to ensure images load
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Carregando...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-600 font-bold">
                {error || 'OS não encontrada'}
            </div>
        );
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const statusMap: Record<string, { label: string; classes: string }> = {
            open: { label: 'ABERTO', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            in_progress: { label: 'EM ANDAMENTO', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
            completed: { label: 'CONCLUÍDO', classes: 'bg-green-100 text-green-800 border-green-200' },
            cancelled: { label: 'CANCELADO', classes: 'bg-red-100 text-red-800 border-red-200' },
            approved: { label: 'APROVADO', classes: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
            diagnosing: { label: 'EM ANÁLISE', classes: 'bg-purple-100 text-purple-800 border-purple-200' },
            pending_approval: { label: 'AGUARDANDO APROVAÇÃO', classes: 'bg-orange-100 text-orange-800 border-orange-200' },
        };

        const current = statusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${current.classes} print:border-gray-300 print:bg-white print:text-black`}>
                {current.label}
            </span>
        );
    };

    const ConditionCheckbox = ({ label, checked }: { label: string; checked: boolean }) => (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 border border-slate-400 rounded-sm flex items-center justify-center ${checked ? 'bg-slate-800 border-slate-800' : 'bg-white'}`}>
                {checked && <CheckCircle size={10} className="text-white" />}
            </div>
            <span className={`text-[10px] uppercase font-bold ${checked ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            <div className="max-w-[794px] mx-auto bg-white shadow-lg print:shadow-none print:w-full min-h-[1123px] relative flex flex-col p-8 box-border text-[11px] leading-tight font-sans text-gray-800">

                {/* --- HEADER --- */}
                <header className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                        <img src="/logo.jpg" alt="TECMONDO" className="h-20 w-auto object-contain" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Tecmondo Informática</h1>
                            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Assistência Técnica Especializada</p>
                            <div className="mt-2 space-y-0.5 text-[10px] text-gray-600">
                                <p className="flex items-center gap-1.5"><MapPin size={10} /> Rua Exemplo, 123 - Centro, Cidade/UF</p>
                                <p className="flex items-center gap-1.5"><Phone size={10} /> (11) 99999-9999 • contato@tecmondo.com.br</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex flex-col items-end mb-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Nº da OS</span>
                            <span className="text-3xl font-black text-slate-900">#{order.id.slice(0, 6)}</span>
                        </div>
                        <StatusBadge status={order.status} />
                        <div className="mt-2 text-[10px] text-gray-500 font-medium">
                            <p className="flex items-center justify-end gap-1">
                                <Calendar size={10} /> Entrada: {formatDate(order.createdAt)}
                            </p>
                            {order.deadline && (
                                <p className="flex items-center justify-end gap-1">
                                    <CheckCircle size={10} /> Previsão: {formatDate(order.deadline)}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- CLIENT & DEVICE GRID --- */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* CLIENTE */}
                    <section className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:h-full">
                        <div className="bg-slate-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                            <User size={14} className="text-slate-700" />
                            <h3 className="text-xs font-bold text-slate-800 uppercase">Dados do Cliente</h3>
                        </div>
                        <div className="p-3 space-y-2 flex-grow">
                            <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Nome</span>
                                <span className="text-sm font-semibold text-slate-900 block">{order.customerName}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-gray-400">Telefone / WhatsApp</span>
                                    <span className="text-xs text-slate-800 block">{order.whatsapp}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-gray-400">CPF / CNPJ</span>
                                    <span className="text-xs text-slate-800 block">{order.cpf || '—'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Email</span>
                                <span className="text-xs text-slate-800 block truncate">{order.email || '—'}</span>
                            </div>
                        </div>
                    </section>

                    {/* APARELHO */}
                    <section className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:h-full">
                        <div className="bg-slate-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                            <Smartphone size={14} className="text-slate-700" />
                            <h3 className="text-xs font-bold text-slate-800 uppercase">Dados do Aparelho</h3>
                        </div>
                        <div className="p-3 space-y-2 flex-grow">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-gray-400">Equipamento</span>
                                    <span className="text-xs font-semibold text-slate-900 block">{order.equipmentType}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-gray-400">Marca/Modelo</span>
                                    <span className="text-xs text-slate-800 block">{order.brand} / {order.model}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Nº de Série / IMEI</span>
                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-slate-700 inline-block">{order.serialNumber || '—'}</span>
                            </div>

                            {/* Checkboxes Conditions */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-200 mt-2">
                                <ConditionCheckbox label="Liga" checked={order.entryCondition.turnOn} />
                                <ConditionCheckbox label="Tela Quebrada" checked={order.entryCondition.brokenScreen} />
                                <ConditionCheckbox label="Sem Acessórios" checked={order.entryCondition.noAccessories} />
                                <ConditionCheckbox label="Com Senha" checked={order.entryCondition.hasPassword || !!order.patternPassword} />
                            </div>

                            <div className="pt-2 border-t border-dashed border-gray-200 mt-2 flex justify-between items-center">
                                <span className="text-[9px] uppercase font-bold text-gray-400">Senha / Padrão</span>
                                {order.patternPassword ? (
                                    <div className="scale-50 origin-right -my-3">
                                        <PatternLock initialValue={order.patternPassword} readOnly size={60} />
                                    </div>
                                ) : (
                                    <span className="text-xs font-mono font-bold text-slate-800 bg-gray-100 px-2 py-0.5 rounded">
                                        {order.entryCondition.password || 'Sem Senha'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- PROBLEM & DIAGNOSIS --- */}
                <div className="space-y-4 mb-6">
                    <section className="relative pl-3 border-l-4 border-red-500 bg-red-50/30 rounded p-3">
                        <h3 className="text-xs font-bold text-red-700 uppercase mb-1 flex items-center gap-2">
                            <AlertTriangle size={12} /> Problema Relatado
                        </h3>
                        <p className="text-xs text-slate-800 italic leading-relaxed">"{order.reportedProblem}"</p>
                    </section>

                    {order.diagnosis && (
                        <section className="relative pl-3 border-l-4 border-blue-600 bg-blue-50/30 rounded p-3">
                            <h3 className="text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-2">
                                <Wrench size={12} /> Diagnóstico Técnico
                            </h3>
                            <p className="text-xs text-slate-800 leading-relaxed">{order.diagnosis}</p>
                        </section>
                    )}
                </div>

                {/* --- IMAGES --- */}
                <section className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                        <ImageIcon size={14} className="text-slate-700" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase">Imagens do Reparo</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4">
                        {[
                            { label: 'Antes (Frente)', src: order.imgBeforeFront },
                            { label: 'Antes (Trás)', src: order.imgBeforeBack },
                            { label: 'Depois (Frente)', src: order.imgAfterFront },
                            { label: 'Depois (Trás)', src: order.imgAfterBack },
                        ].map((img, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-full aspect-[3/4] border border-gray-200 rounded bg-gray-50 flex items-center justify-center overflow-hidden mb-1.5 relative">
                                    {img.src ? (
                                        <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] text-gray-400 font-medium">Sem Imagem</span>
                                    )}
                                </div>
                                <span className="text-[9px] uppercase font-bold text-gray-500">{img.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FINANCIALS --- */}
                <section className="mb-8">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <DollarSign size={14} className="text-slate-700" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase">Detalhamento Financeiro</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-bold text-gray-500">Pagamento:</span>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-2 uppercase text-[9px]">Código</th>
                                    <th className="text-left px-4 py-2 uppercase text-[9px]">Descrição</th>
                                    <th className="text-right px-4 py-2 uppercase text-[9px]">Qtd.</th>
                                    <th className="text-right px-4 py-2 uppercase text-[9px] w-32">Valor (R$)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.services.map((item, i) => (
                                    <tr key={`srv-${i}`}>
                                        <td className="px-4 py-2 text-slate-500 font-mono text-[9px]">{item.code || 'SERV'}</td>
                                        <td className="px-4 py-2 text-slate-700">{item.description}</td>
                                        <td className="px-4 py-2 text-right text-slate-600">1</td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-600">{item.value.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {order.products && order.products.map((prod, i) => (
                                    <tr key={`prod-${i}`}>
                                        <td className="px-4 py-2 text-slate-500 font-mono text-[9px]">{prod.productId ? prod.productId.slice(0, 4).toUpperCase() : 'PROD'}</td>
                                        <td className="px-4 py-2 text-slate-700">{prod.description}</td>
                                        <td className="px-4 py-2 text-right text-slate-600">{prod.quantity}</td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-600">{prod.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {!order.services.length && (!order.products || !order.products.length) && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-4 text-center text-gray-400 italic">Nenhum serviço ou produto lançado.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-slate-50 font-bold border-t border-gray-200">
                                {order.discount > 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-red-500 uppercase text-[9px]">Desconto</td>
                                        <td className="px-4 py-2 text-right text-red-600 font-mono">- {order.discount.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right text-slate-900 uppercase">Total</td>
                                    <td className="px-4 py-3 text-right text-lg text-blue-900">{formatCurrency(order.totalValue)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>

                {/* --- FOOTER & SIGNATURE --- */}
                <footer className="mt-auto">
                    <div className="border-t border-dashed border-gray-300 pt-4 mb-8">
                        <p className="text-[8px] text-justify text-gray-400 leading-tight">
                            <strong>TERMOS DE GARANTIA:</strong> 1. A garantia é de 90 dias, conforme Art. 26 do Código de Defesa do Consumidor. 2. A garantia cobre apenas o serviço executado e peças substituídas. 3. Danos causados por mau uso, quedas, líquidos ou oxidação anulam a garantia imediatamente. 4. A empresa não se responsabiliza por dados pessoais; o backup é responsabilidade do cliente. 5. Equipamentos não retirados no prazo máximo de 90 dias após aviso de conclusão poderão ser descartados ou vendidos para custear despesas de armazenamento (Lei 11.111/2005). 6. Ao assinar, o cliente declara estar ciente e de acordo com as condições acima.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-8 mb-4">
                        <div className="text-center">
                            <div className="border-b border-slate-900 mb-2 w-3/4 mx-auto"></div>
                            <p className="text-[10px] font-bold uppercase text-slate-800">{order.customerName}</p>
                            <p className="text-[9px] uppercase text-gray-500">Assinatura do Cliente</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-slate-900 mb-2 w-3/4 mx-auto"></div>
                            <p className="text-[10px] font-bold uppercase text-slate-800">Tecmondo Informática</p>
                            <p className="text-[9px] uppercase text-gray-500">Assinatura do Técnico</p>
                        </div>
                    </div>

                    <div className="text-center text-[9px] text-slate-300 mt-4 uppercase tracking-widest">
                        Sistema Tecmondo Manager • Documento gerado em {new Date().toLocaleString('pt-BR')}
                    </div>
                </footer>

                {/* --- FAB BUTTON --- */}
                <button
                    onClick={() => window.print()}
                    className="fixed bottom-6 right-6 bg-blue-900 hover:bg-blue-800 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 print:hidden z-50 flex items-center justify-center"
                    title="Imprimir"
                >
                    <Printer size={24} />
                </button>
            </div>
        </div>
    );
};

export default ServiceOrderPrint;
