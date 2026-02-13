import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { supabaseService } from '../services/supabaseService';
import { ServiceOrder, SystemSettings } from '../types';
import { MapPin, Phone, User, Smartphone, Calendar, Mail, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!id) return;
            try {
                const [orderRes, settingsRes] = await Promise.all([
                    storageService.getServiceOrderById(id),
                    supabaseService.getSettings()
                ]);

                if (!isMounted) return;

                if (orderRes.success && orderRes.data) {
                    setOrder(orderRes.data);
                } else {
                    setError('OS não encontrada.');
                }

                if (settingsRes.success && settingsRes.data) {
                    setSettings(settingsRes.data);
                }

                setTimeout(() => window.print(), 800);

            } catch (err) {
                console.error(err);
                if (isMounted) setError('Erro ao carregar dados.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [id]);

    const formatCurrency = (val: number | undefined) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR') + ' ' + new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    // --- PATTERN LOCK VISUALIZER ---
    const PatternLock = ({ pattern }: { pattern?: string }) => {
        if (!pattern) return (
            <div className="w-full text-center text-slate-400 text-xs py-4 italic">Nenhuma senha cadastrada</div>
        );

        // Pattern is expected to be numbers 0-8 (from PatternLock component)
        // Format can be "0-1-2" or legacy "125"

        // Coordinates for SVG lines
        const getCoord = (index: number) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            return { x: col * 40 + 20, y: row * 40 + 20 };
        };

        let points: number[] = [];
        if (pattern.includes('-')) {
            // "0-1-2" -> [0, 1, 2]
            points = pattern.split('-').map(Number).filter(n => !isNaN(n));
        } else {
            // "123" -> [1, 2, 3] (Legacy 1-based? Or manual entry?)
            // Assuming legacy might be 1-based, let's treat 1-9 as 0-8 if needed, 
            // BUT standardizing on the component output is safer.
            // If the string is just digits, let's assume they map to 1-9 visual layout if > 0.
            // However, safe bet is to assume the component output "0-1-2".
            // If fallback:
            points = pattern.split('').map(Number).filter(n => !isNaN(n));

            // Heuristic: If we have digits 1-9 and no dash, maybe subtract 1? 
            // Let's just render what we have. If it's 0-8, it works.
        }

        return (
            <div className="flex justify-center py-2">
                <svg width="120" height="120" className="bg-slate-50 rounded-lg border border-slate-200">
                    {/* Grid Dots (0-8) */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                        const { x, y } = getCoord(n);
                        const isSelected = points.includes(n);
                        return <circle key={n} cx={x} cy={y} r={isSelected ? 6 : 4} fill={isSelected ? '#1e293b' : '#cbd5e1'} />;
                    })}

                    {/* Connection Lines */}
                    {points.length > 1 && (
                        <polyline
                            points={points.map(n => {
                                const { x, y } = getCoord(n);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>
            </div>
        );
    };

    if (loading) return <div className="text-center p-10 font-bold">Carregando Layout Premium...</div>;
    if (error || !order) return <div className="text-center p-10 text-red-600 font-bold">{error}</div>;

    const entryDate = formatDate(order.createdAt);
    // Calculate simple delivery date prediction (e.g. +3 days) or use entry date
    const deliveryDate = new Date(order.createdAt || Date.now());
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const estimatedDate = deliveryDate.toLocaleDateString('pt-BR');

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center py-8 print:py-0 print:bg-white">
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none print:w-full print:h-full text-slate-800 font-sans text-sm relative overflow-hidden">

                {/* --- HEADER --- */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    {/* Left: Logo */}
                    <div className="w-1/3">
                        <img src="/logo.jpg" alt="Logo" className="w-48 object-contain mb-2 mix-blend-multiply" />
                    </div>

                    {/* Right: Info */}
                    <div className="w-2/3 flex flex-col items-end text-right">
                        <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-1">
                            Ordem de Serviço
                        </h1>
                        <span className="text-4xl font-black text-blue-900 tracking-tighter mb-4">
                            #{order.id.slice(0, 6).toUpperCase()}
                        </span>

                        <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                            <div className="flex items-center justify-end gap-2">
                                <span className="font-bold">Data de Entrada:</span> {entryDate} <Calendar size={12} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <span className="font-bold">Previsão Entrega:</span> {estimatedDate} <ShieldCheck size={12} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <span>{settings?.phone || '(00) 0000-0000'}</span> <Phone size={12} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <span>{settings?.email || 'contato@tecmondo.com'}</span> <Mail size={12} />
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-1">
                                <MapPin size={12} /> <span>{settings?.address || 'Endereço da Loja'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- STATUS BAR --- */}
                <div className="bg-slate-100 mx-8 py-2 px-4 rounded-lg flex justify-between items-center mb-6 border border-slate-200">
                    <span className="font-bold text-slate-700 uppercase text-xs">Status Atual:</span>
                    <span className={`font-black uppercase text-sm px-3 py-1 rounded ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                        {order.status === 'open' ? 'Aberto / Em Análise' :
                            order.status === 'completed' ? 'Finalizado' : order.status}
                    </span>
                </div>

                {/* --- DADOS DO CLIENTE --- */}
                <div className="px-8 mb-6">
                    <h3 className="bg-slate-200 text-slate-800 font-bold uppercase text-xs px-3 py-1.5 rounded-t-md border-b-2 border-slate-300 w-full mb-0 flex items-center gap-2">
                        <User size={14} /> Dados do Cliente
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-b-md border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-lg font-bold text-slate-800">{order.customerName}</p>
                            <p className="text-xs text-slate-500 font-mono mt-1">{order.cpf || 'CPF não informado'}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="font-bold text-slate-700">{order.whatsapp || order.contact}</p>
                            <p className="text-xs text-slate-600">{order.email}</p>
                        </div>
                    </div>
                </div>

                {/* --- TWO COLS: DEVICE & CHECKLIST --- */}
                <div className="px-8 grid grid-cols-12 gap-6 mb-6">

                    {/* LEFT COL: DEVICE INFO (7/12) */}
                    <div className="col-span-7 space-y-6">
                        {/* HEADER */}
                        <div>
                            <h3 className="bg-slate-800 text-white font-bold uppercase text-xs px-3 py-1.5 rounded-t-md mb-0 flex items-center gap-2">
                                <Smartphone size={14} /> Dados do Aparelho
                            </h3>
                            <div className="bg-white border border-slate-200 p-4 rounded-b-md space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="font-bold text-slate-500 block">Marca:</span>
                                        <span className="text-slate-800 font-bold">{order.brand}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-500 block">Modelo:</span>
                                        <span className="text-slate-800 font-bold">{order.model}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                    <div>
                                        <span className="font-bold text-slate-500 block">Cor:</span>
                                        <span className="text-slate-800 uppercase">-</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-500 block">IMEI / Serial:</span>
                                        <span className="text-slate-800 font-mono">{order.serialNumber || '-'}</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <span className="font-bold text-slate-500 block mb-1">Acessórios / Observações:</span>
                                    <p className="text-slate-700 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                                        {order.checklist || 'Nenhum acessório deixado.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PROBLEM REPORT */}
                        <div>
                            <h3 className="bg-slate-200 text-slate-800 font-bold uppercase text-xs px-3 py-1.5 rounded-t-md border-b-2 border-slate-300 mb-0">
                                Relato do Problema
                            </h3>
                            <div className="bg-white border border-slate-200 p-4 rounded-b-md text-xs text-slate-800 italic leading-relaxed">
                                {order.reportedProblem || 'Sem descrição.'}
                            </div>
                        </div>

                        {/* VALUES */}
                        <div>
                            <h3 className="bg-slate-800 text-white font-bold uppercase text-xs px-3 py-1.5 rounded-t-md mb-0">
                                Valores do Reparo
                            </h3>
                            <div className="bg-white border border-slate-200 pt-2 rounded-b-md">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr className="text-left">
                                            <th className="px-3 py-2">Serviço/Peça</th>
                                            <th className="px-3 py-2 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.services?.map((s, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2">{s.description}</td>
                                                <td className="px-3 py-2 text-right">{formatCurrency(s.value)}</td>
                                            </tr>
                                        ))}
                                        {order.products?.map((p, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2">{p.description} <span className="text-[10px] text-slate-400">x{p.quantity}</span></td>
                                                <td className="px-3 py-2 text-right">{formatCurrency(p.total)}</td>
                                            </tr>
                                        ))}
                                        {(!order.services?.length && !order.products?.length) && (
                                            <tr><td colSpan={2} className="px-3 py-4 text-center text-slate-400 italic">Sob Análise</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="bg-slate-100 p-3 mt-2 flex justify-between items-center rounded-b-md">
                                    <span className="font-bold text-slate-700 uppercase text-xs">Total Final</span>
                                    <span className="font-black text-xl text-slate-900">{formatCurrency(order.totalValue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: PASSWORD & PHOTOS (5/12) */}
                    <div className="col-span-5 space-y-6">

                        {/* PASSWORD PATTERN */}
                        <div>
                            <h3 className="bg-blue-900 text-white font-bold uppercase text-xs px-3 py-1.5 rounded-t-md text-center mb-0">
                                Senha do Aparelho
                            </h3>
                            <div className="bg-white border border-slate-200 p-4 rounded-b-md flex justify-center items-center">
                                <PatternLock pattern={order.patternPassword} />
                            </div>
                        </div>

                        {/* ENTRY PHOTOS */}
                        <div>
                            <h3 className="bg-slate-200 text-slate-700 font-bold uppercase text-xs px-3 py-1.5 rounded-t-md border-b-2 border-slate-300 text-center mb-0">
                                Estado de Entrada
                            </h3>
                            <div className="bg-white border border-slate-200 p-2 rounded-b-md grid grid-cols-2 gap-2">
                                <div className="text-center">
                                    <div className="w-full h-24 bg-slate-100 rounded border border-slate-200 mb-1 flex items-center justify-center overflow-hidden">
                                        {order.imgBeforeFront ?
                                            <img src={order.imgBeforeFront} className="w-full h-full object-cover" /> :
                                            <span className="text-[9px] text-slate-400">Sem Foto</span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Frente</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-full h-24 bg-slate-100 rounded border border-slate-200 mb-1 flex items-center justify-center overflow-hidden">
                                        {order.imgBeforeBack ?
                                            <img src={order.imgBeforeBack} className="w-full h-full object-cover" /> :
                                            <span className="text-[9px] text-slate-400">Sem Foto</span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Trás</span>
                                </div>
                            </div>
                        </div>

                        {/* EXIT PHOTOS */}
                        <div>
                            <h3 className="bg-green-700 text-white font-bold uppercase text-xs px-3 py-1.5 rounded-t-md text-center mb-0">
                                Depois do Reparo
                            </h3>
                            <div className="bg-white border border-slate-200 p-2 rounded-b-md grid grid-cols-2 gap-2">
                                <div className="text-center">
                                    <div className="w-full h-24 bg-slate-100 rounded border border-slate-200 mb-1 flex items-center justify-center overflow-hidden">
                                        {order.imgAfterFront ?
                                            <img src={order.imgAfterFront} className="w-full h-full object-cover" /> :
                                            <span className="text-[9px] text-slate-400">Sem Foto</span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Frente</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-full h-24 bg-slate-100 rounded border border-slate-200 mb-1 flex items-center justify-center overflow-hidden">
                                        {order.imgAfterBack ?
                                            <img src={order.imgAfterBack} className="w-full h-full object-cover" /> :
                                            <span className="text-[9px] text-slate-400">Sem Foto</span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Trás</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- FOOTER: TERMS --- */}
                <div className="px-8 mt-auto mb-8">
                    <div className="bg-slate-50 border border-slate-200 rounded p-4 text-[9px] text-slate-600 leading-tight text-justify">
                        <h4 className="font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">Cláusulas de Garantia e Responsabilidade</h4>

                        <div className="space-y-2">
                            <div>
                                <strong className="block font-bold text-slate-700 mb-0.5">1. Da Garantia Legal</strong>
                                <p>Nos termos do art. 26 do Código de Defesa do Consumidor (Lei nº 8.078/1990), é concedida garantia legal de 90 (noventa) dias, contados da data de entrega do equipamento ao cliente, restrita exclusivamente ao serviço executado e às peças efetivamente substituídas.</p>
                            </div>

                            <div>
                                <strong className="block font-bold text-slate-700 mb-0.5">2. Das Exclusões de Garantia</strong>
                                <p>A garantia ora concedida não abrange defeitos ou danos decorrentes de:</p>
                                <ul className="list-none pl-1 mt-0.5 space-y-0.5">
                                    <li>I – Mau uso, utilização inadequada ou em desacordo com as orientações técnicas;</li>
                                    <li>II – Quedas, impactos, pressão excessiva ou quaisquer danos físicos;</li>
                                    <li>III – Contato com líquidos, infiltração, oxidação ou exposição à umidade;</li>
                                    <li>IV – Intervenção, violação ou tentativa de reparo por terceiros não autorizados;</li>
                                    <li>V – Oscilações ou falhas na rede elétrica, curto-circuito ou sobrecarga.</li>
                                </ul>
                                <p className="mt-0.5 italic">Constatada qualquer das hipóteses acima, a garantia será automaticamente considerada sem efeito.</p>
                            </div>

                            <div>
                                <strong className="block font-bold text-slate-700 mb-0.5">3. Da Responsabilidade sobre Dados</strong>
                                <p>A CONTRATADA não se responsabiliza, em nenhuma hipótese, por perda, corrupção ou vazamento de dados, arquivos, imagens, aplicativos ou quaisquer informações armazenadas no equipamento. Compete exclusivamente ao cliente a realização de backup prévio antes da entrega do aparelho para manutenção.</p>
                            </div>

                            <div>
                                <strong className="block font-bold text-slate-700 mb-0.5">4. Do Prazo para Retirada do Equipamento</strong>
                                <p>O cliente obriga-se a retirar o equipamento no prazo máximo de 90 (noventa) dias, contados da data de comunicação da conclusão do serviço. Decorrido o referido prazo sem manifestação ou retirada do bem, caracterizar-se-á abandono, autorizando a empresa a dar o destino cabível (descarte, venda ou compensação de custos) conforme art. 1.275, inciso III, do Código Civil.</p>
                            </div>

                            <div>
                                <strong className="block font-bold text-slate-700 mb-0.5">5. Da Declaração de Ciência e Concordância</strong>
                                <p>O cliente declara, para todos os fins de direito, que as informações fornecidas são verdadeiras, que leu integralmente as cláusulas acima e que concorda expressamente com seus termos e condições.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-16 mt-12">
                        <div className="flex-1 text-center">
                            <div className="border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-bold text-slate-700 uppercase">Assinatura do Cliente</p>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-bold text-slate-700 uppercase">Técnico Responsável</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ServiceOrderPrint;
