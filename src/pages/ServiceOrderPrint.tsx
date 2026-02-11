import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder } from '../types';
import { PatternLock } from '../components/PatternLock';
import { CheckSquare, Square, Printer } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);

    useEffect(() => {
        if (id) {
            const data = storageService.getServiceOrderById(id);
            if (data) {
                setOrder(data);
                // Delay print slightly to ensure images/layout render
                setTimeout(() => window.print(), 800);
            }
        }
    }, [id]);

    if (!order) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;

    const Checkbox = ({ checked, label }: { checked: boolean; label: string }) => (
        <div className="flex items-center gap-2 mb-1">
            {checked ? <CheckSquare size={16} className="text-slate-900" /> : <Square size={16} className="text-slate-300" />}
            <span className={checked ? "font-semibold text-slate-900" : "text-slate-500"}>{label}</span>
        </div>
    );

    return (
        <div className="bg-white min-h-screen text-slate-900 font-sans print:p-0 p-8 max-w-5xl mx-auto">

            {/* --- CABEÇALHO --- */}
            <div className="bg-slate-900 text-white p-8 rounded-t-xl print:rounded-none flex justify-between items-start mb-8 -mx-8 -mt-8 print:m-0">
                <div className="flex gap-6 items-center">
                    <div className="h-20 w-20 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <span className="text-3xl font-bold tracking-tighter">TM</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-wider mb-1">TECMONDO</h1>
                        <p className="text-blue-200 text-sm font-medium">Assistência Técnica Especializada em Smartphones e Eletrônicos</p>
                        <div className="mt-3 text-sm text-slate-300 space-y-0.5">
                            <p>📍 Endereço: Rua Exemplo, 123 - Centro</p>
                            <p>📞 WhatsApp: (00) 00000-0000 | 📧 Email: contato@tecmondo.com.br</p>
                            <p>🏢 CNPJ: 00.000.000/0001-00</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block bg-white/10 px-4 py-2 rounded-lg border border-white/20 mb-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-200">Ordem de Serviço</h2>
                        <p className="text-4xl font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-slate-300 mt-2">Data de Entrada: <span className="text-white font-mono">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                    {order.deadline && <p className="text-sm text-slate-300">Previsão: <span className="text-white font-mono">{new Date(order.deadline).toLocaleDateString()}</span></p>}
                </div>
            </div>

            {/* --- CORPO DA OS --- */}
            <div className="grid grid-cols-12 gap-8">

                {/* COLUNA ESQUERDA (Dados Básicos) */}
                <div className="col-span-7 space-y-6">

                    {/* DADOS DO CLIENTE */}
                    <div className="border border-slate-200 rounded-lg p-5 shadow-sm bg-slate-50/50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                            👤 Dados do Cliente
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Nome:</span>
                                <span className="col-span-2 font-semibold text-slate-900">{order.customerName}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Telefone/Zap:</span>
                                <span className="col-span-2 font-mono text-slate-800">{order.whatsapp}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">CPF/CNPJ:</span>
                                <span className="col-span-2 font-mono text-slate-800">{order.cpf || 'Não informado'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Email:</span>
                                <span className="col-span-2 text-slate-800">{order.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* DADOS DO APARELHO */}
                    <div className="border border-slate-200 rounded-lg p-5 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                            📱 Dados do Aparelho
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <span className="block text-xs text-slate-500">Tipo</span>
                                <span className="font-semibold block">{order.equipmentType}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500">Marca/Modelo</span>
                                <span className="font-semibold block">{order.brand} - {order.model}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-xs text-slate-500">Serial / IMEI</span>
                                <span className="font-mono block bg-slate-100 px-2 py-1 rounded w-fit">{order.serialNumber || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                            <span className="block text-xs text-slate-500 mb-2 font-bold uppercase">Estado de Entrada</span>
                            <div className="grid grid-cols-2 gap-y-1 text-xs">
                                <Checkbox checked={order.entryCondition.turnOn} label="Liga o aparelho" />
                                <Checkbox checked={order.entryCondition.brokenScreen} label="Tela Quebrada" />
                                <Checkbox checked={order.entryCondition.noAccessories} label="Sem Acessórios" />
                                <Checkbox checked={!!order.entryCondition.hasPassword} label="Possui Senha" />
                            </div>
                        </div>
                    </div>

                    {/* PROBLEM & DIAGNOSIS */}
                    <div className="space-y-4">
                        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                            <h3 className="text-xs font-bold text-red-700 uppercase mb-1">⚠ Relato do Cliente</h3>
                            <p className="text-sm text-slate-800 italic">"{order.reportedProblem}"</p>
                        </div>

                        {order.diagnosis && (
                            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                                <h3 className="text-xs font-bold text-blue-700 uppercase mb-1">🔎 Diagnóstico Técnico</h3>
                                <p className="text-sm text-slate-800">{order.diagnosis}</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* COLUNA DIREITA (Senha, Financeiro, Fotos) */}
                <div className="col-span-5 space-y-6">

                    {/* SENHA / BLOQUEIO */}
                    <div className="border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200"></div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            🔐 Segurança
                        </h3>

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <span className="block text-xs text-slate-500 mb-2">Tipo de Bloqueio</span>
                                <div className="space-y-1 text-xs">
                                    <Checkbox checked={!order.patternPassword && !order.entryCondition.password} label="Sem Senha" />
                                    <Checkbox checked={!!order.patternPassword} label="Padrão (Desenho)" />
                                    <Checkbox checked={!!order.entryCondition.password} label="PIN / Senha" />
                                </div>
                            </div>

                            {/* Pattern Display */}
                            {order.patternPassword && (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Padrão</span>
                                    <div className="border-2 border-slate-200 rounded-lg p-1 bg-white">
                                        <PatternLock initialValue={order.patternPassword} readOnly size={80} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {order.entryCondition.password && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <span className="text-xs text-slate-500 block">Senha Numérica/Texto:</span>
                                <span className="font-mono font-bold text-lg tracking-widest">{order.entryCondition.password}</span>
                            </div>
                        )}
                    </div>

                    {/* ORÇAMENTO */}
                    <div className="border border-slate-900 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-slate-900 text-white p-3 text-center">
                            <h3 className="font-bold uppercase tracking-widest text-sm">💰 Orçamento</h3>
                        </div>
                        <div className="p-5 bg-slate-50">
                            <div className="space-y-2 mb-4">
                                {order.services.map((s, i) => (
                                    <div key={i} className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-1">
                                        <span className="text-slate-600 truncate pr-2">{s.description}</span>
                                        <span className="font-mono">{s.value.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-slate-200 pt-3 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>R$ {order.services.reduce((a, b) => a + b.value, 0).toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Desconto</span>
                                        <span>- R$ {order.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                                    <span>TOTAL</span>
                                    <span>R$ {order.totalValue.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <span className="block text-xs text-slate-500 mb-2 uppercase font-bold">Status Atual</span>
                                <span className={`
                                     block w-full text-center py-1.5 rounded text-sm font-bold uppercase tracking-wide
                                     ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'}
                                 `}>
                                    {order.status === 'open' ? 'Aberto' :
                                        order.status === 'diagnosing' ? 'Em Análise' :
                                            order.status === 'pending_approval' ? 'Aguardando Aprovação' :
                                                order.status === 'approved' ? 'Aprovado' :
                                                    order.status === 'in_progress' ? 'Em Manutenção' :
                                                        order.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* FOTOS */}
            {(order.imgBeforeFront || order.imgBeforeBack || order.imgAfterFront || order.imgAfterBack) && (
                <div className="mt-8 border border-slate-200 rounded-lg p-5 break-inside-avoid">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        📸 Registro Visual
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { img: order.imgBeforeFront, label: 'Frente (Entrada)', type: 'bad' },
                            { img: order.imgBeforeBack, label: 'Trás (Entrada)', type: 'bad' },
                            { img: order.imgAfterFront, label: 'Frente (Saída)', type: 'good' },
                            { img: order.imgAfterBack, label: 'Trás (Saída)', type: 'good' }
                        ].map((p, i) => (
                            <div key={i} className={`border rounded-lg p-1.5 ${p.img ? 'bg-white' : 'bg-slate-50 opacity-50'}`}>
                                <div className="flex items-center justify-between mb-1.5 px-0.5">
                                    <span className="text-[10px] uppercase font-bold text-slate-500">{p.label}</span>
                                    {p.img && (p.type === 'good' ? <CheckSquare size={12} className="text-green-500" /> : <span size={12} className="text-red-500 font-bold block w-3 h-3 text-center leading-3">!</span>)}
                                </div>
                                <div className="aspect-square bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                                    {p.img ? (
                                        <img src={p.img} alt={p.label} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-slate-300 text-xs">Sem foto</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TERMS & FOOTER */}
            <div className="mt-auto pt-8">
                <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 text-[10px] text-slate-500 text-justify leading-relaxed mb-8">
                    <h4 className="font-bold uppercase mb-2 text-slate-700">📜 Termos e Condições</h4>
                    <p>
                        1. <strong>Autorização:</strong> O cliente autoriza a abertura do equipamento para diagnóstico técnico.
                        2. <strong>Garantia:</strong> Garantia legal de 90 dias sobre peças e serviços (Art. 26 CDC). A garantia cobre apenas o defeito reparado; não cobre danos por líquidos, quedas, mau uso ou violação de selos.
                        3. <strong>Dados:</strong> A empresa não se responsabiliza por dados do usuário. O backup é responsabilidade do cliente antes da entrega.
                        4. <strong>Abandono:</strong> Equipamentos prontos e não retirados em até 90 dias poderão ser descartados ou vendidos para custear despesas (Lei 11.343/06 analogia).
                        5. <strong>Riscos:</strong> Em aparelhos muito danificados/oxidados, o processo de abertura pode agravar falhas ocultas. O cliente declara ciência deste risco.
                    </p>
                </div>

                {/* ASSINATURAS */}
                <div className="grid grid-cols-2 gap-12 mt-12 mb-4">
                    <div className="text-center">
                        <div className="border-b border-slate-400 mb-2 h-8"></div>
                        <p className="font-bold text-sm uppercase">{order.customerName}</p>
                        <p className="text-xs text-slate-500">Assinatura do Cliente</p>
                        <p className="text-[10px] text-slate-400 mt-1">Declaro estar de acordo com os serviços</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-400 mb-2 h-8"></div>
                        <p className="font-bold text-sm uppercase">Tec Mondo Assistência</p>
                        <p className="text-xs text-slate-500">Técnico Responsável</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            {/* Print Button Wrapper */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 print:hidden z-50">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
                    title="Imprimir"
                >
                    <Printer size={24} />
                </button>
            </div>
        </div>
    );
};

export default ServiceOrderPrint;
