import React, { useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Product } from '../types';
import { Button } from '../components/ui/button';
import { FileText, Package } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProductReport: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await supabaseService.getProducts();
            if (res.success && res.data) {
                setProducts(res.data);
            }
            setLoading(false);
        };
        load();
    }, []);

    const totalStock = products.reduce((acc, p) => acc + p.stockQuantity, 0);
    const totalValue = products.reduce((acc, p) => acc + (p.stockQuantity * p.resalePrice), 0);

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('Relatório de Produtos e Estoque', 14, 20);

        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 28);
        doc.text(`Total de Itens: ${totalStock}`, 14, 34);

        // Table
        const tableColumn = ["Código/Ref", "Produto", "Fornecedor", "Qtd.", "Custo", "Venda", "Total Venda"];
        const tableRows: any[] = [];

        products.forEach(product => {
            const productData = [
                product.barcode || '-',
                product.description,
                product.supplier || '-',
                product.stockQuantity,
                `R$ ${product.purchasePrice.toFixed(2)}`,
                `R$ ${product.resalePrice.toFixed(2)}`,
                `R$ ${(product.stockQuantity * product.resalePrice).toFixed(2)}`
            ];
            tableRows.push(productData);
        });

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] }, // Emerald header
            styles: { fontSize: 8 },
        });

        doc.save(`relatorio-produtos-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Relatório de Produtos</h1>
                    <p className="text-slate-400 text-sm">Visão geral do estoque e valores.</p>
                </div>
                <Button onClick={generatePDF} className="bg-red-600 hover:bg-red-500">
                    <FileText className="mr-2" size={18} /> Gerar PDF
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm uppercase font-bold">Total Produtos</p>
                        <p className="text-2xl font-bold text-white">{products.length}</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm uppercase font-bold">Itens em Estoque</p>
                        <p className="text-2xl font-bold text-white">{totalStock}</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="bg-amber-500/20 p-3 rounded-full text-amber-400">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm uppercase font-bold">Valor em Estoque (Venda)</p>
                        <p className="text-2xl font-bold text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Table */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Produto</th>
                            <th className="px-6 py-3 text-center">Qtd.</th>
                            <th className="px-6 py-3 text-right">Custo Unit.</th>
                            <th className="px-6 py-3 text-right">Venda Unit.</th>
                            <th className="px-6 py-3 text-right">Total (Venda)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">Carregando estoque...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>
                        ) : (
                            products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {p.description}
                                        <span className="block text-xs text-slate-500 font-mono">{p.barcode}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.stockQuantity < 5 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                                            {p.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        R$ {p.purchasePrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                        R$ {p.resalePrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-white">
                                        R$ {(p.stockQuantity * p.resalePrice).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductReport;
