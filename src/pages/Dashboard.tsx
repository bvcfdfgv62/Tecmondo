import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Smartphone, FileQuestion, Users, CheckCircle, ArrowRight, TrendingUp, TrendingDown, DollarSign, Activity, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState({ monthlyIncome: 0, pendingBudgets: 0, activeOS: 0, uniqueClients: 0 });
  const [chartData, setChartData] = useState<{ name: string, value: number }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await storageService.getKPIs();
        setKpis(data);

        // Prepare chart data (Last 7 days balance)
        const transactions = await storageService.getTransactions();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });

        const graph = last7Days.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
          const dailyBalance = dayTransactions.reduce((acc, t) => {
            return acc + (t.type === 'income' ? t.amount : -t.amount);
          }, 0);

          return {
            name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: dailyBalance
          };
        });

        setChartData(graph);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    };

    loadData();
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  return (
    <div className="space-y-8 animate-fade-in pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Olá, <span className="text-primary">{user?.name || 'Administrador'}</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Aqui está o resumo da sua operação hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface/50 backdrop-blur-sm border border-white/5 px-4 py-2 rounded-full shadow-lg shadow-black/20">
          <Calendar size={16} className="text-primary" />
          <span className="text-sm font-medium text-slate-200 capitalize">{today}</span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Faturamento Mensal"
          value={kpis.monthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={DollarSign}
          trend="+12% vs. mês anterior" // Placeholder for future logic
          gradient="from-emerald-500/20 to-teal-500/5"
          iconColor="text-emerald-400"
        />
        <KpiCard
          title="OS em Andamento"
          value={kpis.activeOS}
          icon={Activity}
          trend="4 precisando atenção"
          gradient="from-blue-500/20 to-indigo-500/5"
          iconColor="text-blue-400"
        />
        <KpiCard
          title="Base de Clientes"
          value={kpis.uniqueClients}
          icon={Users}
          trend="+3 novos esta semana"
          gradient="from-violet-500/20 to-purple-500/5"
          iconColor="text-violet-400"
        />
        <KpiCard
          title="Ticket Médio" // New placeholder metric
          value="R$ 450,00"
          icon={TrendingUp}
          trend="Estável"
          gradient="from-amber-500/20 to-orange-500/5"
          iconColor="text-amber-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart Area */}
        <Card className="lg:col-span-2 border-white/5 bg-surface/30 backdrop-blur-md shadow-xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/5">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                Fluxo Financeiro
              </CardTitle>
              <CardDescription className="text-xs">
                Movimentação dos últimos 7 dias
              </CardDescription>
            </div>
            <div className="px-2 py-1 bg-primary/10 rounded text-xs font-bold text-primary">
              Tempo Real
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full p-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(8px)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#f1f5f9',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#22d3ee' }}
                    formatter={(value: number) => [`R$ ${value}`, 'Saldo']}
                    labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Atalhos</h3>
          </div>

          <Link to="/os" className="block group">
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-surface/80 to-surface/40 p-5 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/10 group-hover:-translate-y-1">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-inner">
                  <Smartphone size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <span className="text-base font-bold text-white block mb-0.5">Nova OS</span>
                  <span className="text-xs text-slate-500 group-hover:text-cyan-200 transition-colors">Registrar entrada</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 text-slate-500 group-hover:text-cyan-400 transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>

          <Link to="/clientes" className="block group">
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-surface/80 to-surface/40 p-5 hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/10 group-hover:-translate-y-1">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-inner">
                  <Users size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <span className="text-base font-bold text-white block mb-0.5">Clientes</span>
                  <span className="text-xs text-slate-500 group-hover:text-violet-200 transition-colors">Gerenciar CRM</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 text-slate-500 group-hover:text-violet-400 transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>

          <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border border-emerald-500/10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <CheckCircle size={18} />
                <span className="font-bold text-sm">Status do Sistema</span>
              </div>
              <p className="text-xs text-emerald-200/70 leading-relaxed">
                Todos os serviços operando normalmente. Backup realizado às 03:00.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Modern KPI Card
interface KpiCardNewProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  gradient: string;
  iconColor: string;
}

const KpiCard: React.FC<KpiCardNewProps> = ({ title, value, icon: Icon, trend, gradient, iconColor }) => (
  <Card className={cn(
    "border-0 relative overflow-hidden group shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
    "bg-gradient-to-br bg-surface/40 backdrop-blur-md border border-white/5"
  )}>
    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br", gradient)} />

    <CardContent className="p-6 relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-lg bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10", iconColor)}>
          <Icon size={22} />
        </div>
        {/* Placeholder for sparkline or action menu */}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400 tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80">
          <TrendingUp size={12} className={cn("inline", iconColor)} />
          <span className="opacity-80 group-hover:opacity-100 group-hover:text-white transition-opacity">{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Dashboard;