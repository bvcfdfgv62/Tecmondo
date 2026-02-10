import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { ServiceOrder } from '../types';

const ServiceOrderPrint: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);

    useEffect(() => {
        if (id) {
            const data = storageService.getServiceOrderById(id);
            if (data) {
                setOrder(data);
                setTimeout(() => window.print(), 500); // Auto-print
            }
        }
    }, [id]);

    if (!order) return <div className="p-10 text-center">Carregando OS...</div>;

    return (
        <div className="bg-white min-h-screen text-black p-8 font-sans print:p-0" style={{ color: 'black' }}>
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    {/* Placeholder Logo */}
                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl rounded">
                        TM
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide">Tec Mondo</h1>
                        <p className="text-sm text-slate-600">Assistência Técnica Especializada</p>
                        <p className="text-sm text-slate-600">CNPJ: 00.000.000/0001-00</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">Ordem de Serviço</h2>
                    <p className="text-3xl font-mono font-bold text-slate-800">#{order.id}</p>
                    <p className="text-sm text-slate-500 mt-1">Data: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Cliente */}
                <div className="border border-slate-200 rounded p-4">
                    <h3 className="font-bold uppercase text-xs text-slate-500 mb-3 border-b pb-1">Dados do Cliente</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-semibold">Nome:</span> {order.customerName}</p>
                        <p><span className="font-semibold">Email:</span> {order.email}</p>
                        <p><span className="font-semibold">WhatsApp:</span> {order.whatsapp}</p>
                        <p><span className="font-semibold">CPF/CNPJ:</span> {order.cpf || 'Não informado'}</p>
                    </div>
                </div>

                {/* Equipamento */}
                <div className="border border-slate-200 rounded p-4">
                    <h3 className="font-bold uppercase text-xs text-slate-500 mb-3 border-b pb-1">Equipamento</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-semibold">Tipo:</span> {order.equipmentType}</p>
                        <p><span className="font-semibold">Marca/Modelo:</span> {order.brand} - {order.model}</p>
                        <p><span className="font-semibold">Nº Série:</span> {order.serialNumber || 'N/A'}</p>
                        <div className="mt-2 text-xs flex flex-wrap gap-2 text-slate-600">
                            {order.entryCondition.turnOn && <span className="border px-1 rounded">Liga</span>}
                            {order.entryCondition.brokenScreen && <span className="border px-1 rounded">Tela Quebrada</span>}
                            {order.entryCondition.noAccessories && <span className="border px-1 rounded">Sem Acessórios</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Problema e Diagnóstico */}
            <div className="mb-8 space-y-4">
                <div className="border border-slate-200 rounded p-4 bg-slate-50">
                    <h3 className="font-bold uppercase text-xs text-slate-500 mb-2">Problema Relatado</h3>
                    <p className="text-sm italic text-slate-700">"{order.reportedProblem}"</p>
                </div>

                {order.diagnosis && (
                    <div className="border border-slate-200 rounded p-4">
                        <h3 className="font-bold uppercase text-xs text-slate-500 mb-2">Diagnóstico Técnico</h3>
                        <p className="text-sm text-slate-800">{order.diagnosis}</p>
                    </div>
                )}
            </div>

            {/* Serviços */}
            <div className="mb-8">
                <h3 className="font-bold uppercase text-xs text-slate-500 mb-2">Serviços Executados / Peças</h3>
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-800">
                            <th className="py-2">Descrição</th>
                            <th className="py-2 text-right w-32">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.services.map((item) => (
                            <tr key={item.id} className="border-b border-slate-200">
                                <td className="py-2">{item.description}</td>
                                <td className="py-2 text-right text-slate-600">R$ {item.value.toFixed(2)}</td>
                            </tr>
                        ))}
                        {order.services.length === 0 && (
                            <tr><td colSpan={2} className="py-4 text-center text-slate-400">Nenhum serviço lançado.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="font-bold">
                        <tr>
                            <td className="py-2 text-right pt-4">Subtotal:</td>
                            <td className="py-2 text-right pt-4">R$ {order.services.reduce((a, b) => a + b.value, 0).toFixed(2)}</td>
                        </tr>
                        {order.discount > 0 && (
                            <tr className="text-red-600">
                                <td className="py-1 text-right">Desconto:</td>
                                <td className="py-1 text-right">- R$ {order.discount.toFixed(2)}</td>
                            </tr>
                        )}
                        <tr className="text-lg">
                            <td className="py-2 text-right">Total:</td>
                            <td className="py-2 text-right">R$ {order.totalValue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer / Termos */}
            <div className="text-xs text-slate-500 text-justify mb-12 border-t pt-4">
                <p>
                    <strong>Garantia legal de 90 dias</strong> sobre os serviços prestados e peças substituídas,
                    conforme Código de Defesa do Consumidor. A garantia não cobre danos causados por mau uso,
                    quedas, líquidos, oscilações elétricas ou intervenção de terceiros.
                    Equipamentos não retirados em até 90 dias serão considerados abandonados e descartados.
                </p>
            </div>

            {/* Assinaturas */}
            <div className="flex justify-between pt-10">
                <div className="w-[40%] text-center border-t border-slate-400 pt-2">
                    <p className="font-bold text-sm">Tec Mondo</p>
                    <p className="text-xs text-slate-500">Técnico Responsável</p>
                </div>
                <div className="w-[40%] text-center border-t border-slate-400 pt-2">
                    <p className="font-bold text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-500">Cliente</p>
                </div>
            </div>

            {/* Botão Voltar (Escondido na impressão) */}
            <button
                onClick={() => window.close()}
                className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded shadow-lg print:hidden hover:bg-slate-800"
            >
                Fechar
            </button>
        </div>
    );
};

export default ServiceOrderPrint;
