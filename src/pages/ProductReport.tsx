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
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const totalPagesExp = '{total_pages_count_string}';
        const dateStr = `Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`;

        // Define columns
        const tableColumn = ["Código/Ref", "Produto", "Fornecedor", "Qtd.", "Custo", "Venda", "Total Venda"];

        // Prepare rows
        const tableRows = products.map(product => [
            product.barcode || '-',
            product.description,
            product.supplier || '-',
            product.stockQuantity,
            `R$ ${product.purchasePrice.toFixed(2)}`,
            `R$ ${product.resalePrice.toFixed(2)}`,
            `R$ ${(product.stockQuantity * product.resalePrice).toFixed(2)}`
        ]);

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            margin: { top: 40, right: 15, bottom: 20, left: 15 },
            theme: 'grid',
            headStyles: {
                fillColor: [22, 163, 74], // Emerald
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                valign: 'middle'
            },
            rowPageBreak: 'auto',
            columnStyles: {
                0: { cellWidth: 25 }, // Código
                1: { cellWidth: 'auto' }, // Produto
                2: { cellWidth: 25 }, // Fornecedor
                3: { cellWidth: 15, halign: 'center' }, // Qtd
                4: { cellWidth: 25, halign: 'right' }, // Custo
                5: { cellWidth: 25, halign: 'right' }, // Venda
                6: { cellWidth: 25, halign: 'right' }  // Total
            },
            didDrawPage: (data) => {
                // Header
                doc.setFontSize(18);
                doc.setTextColor(40);
                doc.text('Relatório de Produtos e Estoque', data.settings.margin.left, 20);

                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(dateStr, data.settings.margin.left, 28);

                // Show totals only on first page header or maybe useful on all? 
                // Let's keep it simple on the header context.
                if (data.pageNumber === 1) {
                    doc.text(`Total de Itens: ${totalStock} | Valor Total (Venda): ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}`, data.settings.margin.left, 34);
                }

                // Page numbers
                let str = 'Página ' + doc.getNumberOfPages();
                if (typeof doc.putTotalPages === 'function') {
                    str = str + ' de ' + totalPagesExp;
                }
                doc.setFontSize(8);
                doc.text(str, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
            }
        });

        // Add total pages count
        if (typeof doc.putTotalPages === 'function') {
            doc.putTotalPages(totalPagesExp);
        }

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
