import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { Transaction, CashFlowStats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const CashFlow: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<CashFlowStats>({ totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0 });
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: 'income' as 'income' | 'expense', category: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setTransactions(await storageService.getTransactions());
    setStats(await storageService.getCashFlowStats());
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    await storageService.addTransaction({
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category || 'Geral'
    });

    setNewTransaction({ description: '', amount: '', type: 'income', category: '' });
    setShowForm(false);
    refreshData();
  };

  // Preparar dados para o gráfico (últimos 10 dias)
  const chartData = transactions.slice(0, 10).reverse().map(t => ({
    name: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Receita: t.type === 'income' ? t.amount : 0,
    Despesa: t.type === 'expense' ? t.amount : 0
  }));

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground text-sm">Controle financeiro detalhado</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={cn("gap-2", showForm ? "bg-red-500 hover:bg-red-600" : "bg-cyan-600 hover:bg-cyan-500")}
        >
          {showForm ? 'Cancelar' : <><PlusCircle size={20} /> Nova Transação</>}
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Saldo Total"
          value={stats.totalBalance}
          icon={DollarSign}
          type={stats.totalBalance >= 0 ? 'success' : 'danger'}
        />
        <StatsCard
          title="Entradas (Mês)"
          value={stats.monthlyIncome}
          icon={TrendingUp}
          type="success"
        />
        <StatsCard
          title="Saídas (Mês)"
          value={stats.monthlyExpense}
          icon={TrendingDown}
          type="danger"
        />
      </div>

      {/* Formulário de Adição Rápida */}
      {showForm && (
        <Card className="animate-scale-in border-cyan-500/30">
          <CardHeader>
            <CardTitle>Adicionar Movimentação Manual</CardTitle>
            <CardDescription>Registre entradas ou saídas que não vieram de orçamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                <Input
                  type="text" placeholder="Ex: Conta de Luz" required
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Valor (R$)</label>
                <Input
                  type="number" placeholder="0.00" required min="0" step="0.01"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                <Input
                  type="text" placeholder="Ex: Operacional"
                  value={newTransaction.category}
                  onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-sm border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  value={newTransaction.type}
                  onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                >
                  <option value="income">Entrada (+)</option>
                  <option value="expense">Saída (-)</option>
                </select>
              </div>
              <Button type="submit" className="md:col-span-4 mt-2 bg-emerald-600 hover:bg-emerald-500 w-full sm:w-auto ml-auto">
                Salvar Movimentação
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Gráficos e Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Movimentação Recente</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lista de Últimas Transações */}
        <Card className="flex flex-col h-[400px] overflow-hidden">
          <CardHeader className="bg-surface/30 border-b border-white/5 pb-4">
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-surface/50 sticky top-0 backdrop-blur-md z-10">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-[100px]">Data</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{t.description}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{t.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-right font-bold font-mono", t.type === 'income' ? 'text-emerald-500' : 'text-red-500')}>
                      {t.type === 'expense' ? '-' : '+'}
                      {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper Component for Stats
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  type: 'success' | 'danger' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, type }) => {
  const colorClass = type === 'success' ? 'text-emerald-500' : type === 'danger' ? 'text-red-500' : 'text-slate-200';
  const bgClass = type === 'success' ? 'bg-emerald-500/10' : type === 'danger' ? 'bg-red-500/10' : 'bg-slate-800';

  return (
    <Card className="flex items-center justify-between p-6">
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{title}</p>
        <p className={cn("text-2xl font-bold mt-1 tracking-tight", colorClass)}>
          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      <div className={cn("p-3 rounded-full", bgClass, colorClass)}>
        <Icon size={24} />
      </div>
    </Card>
  );
};

export default CashFlow;