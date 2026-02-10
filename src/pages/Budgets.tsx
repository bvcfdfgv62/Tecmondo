import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { BudgetRequest } from '../types';
import { CheckCircle, XCircle, Clock, FileText, ArrowRight, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const Budgets: React.FC = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<BudgetRequest[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [approvalValue, setApprovalValue] = useState('');

  useEffect(() => {
    loadBudgets();

    // Auto-refresh when tab comes into focus
    const handleFocus = () => {
      loadBudgets();
    };

    window.addEventListener('focus', handleFocus);
    // Also listen for storage events (updates from other tabs)
    window.addEventListener('storage', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleFocus);
    };
  }, []);

  const loadBudgets = () => {
    setBudgets(storageService.getBudgets());
  };

  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
    if (!selectedBudget) return;

    // Se aprovado, requer valor
    if (status === 'approved' && !approvalValue) {
      alert('Informe o valor aprovado!');
      return;
    }

    storageService.updateBudgetStatus(
      selectedBudget.id,
      status,
      status === 'approved' ? parseFloat(approvalValue) : undefined
    );

    setSelectedBudget(null);
    setApprovalValue('');
    loadBudgets();
  };

  const handleConvertToOS = (budget: BudgetRequest) => {
    const newOS = storageService.createServiceOrder({
      customerName: budget.customerName,
      whatsapp: budget.whatsapp,
      email: budget.email,
      equipmentType: budget.equipmentType,
      brand: budget.brand,
      model: budget.model,
      reportedProblem: budget.problemDescription,
      budgetId: budget.id
    });
    navigate(`/os/${newOS.id}`);
  };

  const copyPublicLink = (id: string) => {
    const url = `${window.location.origin}/#/orcamento/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-primary">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground text-sm">Gerenciamento de solicitações de clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground bg-surface/30 rounded-lg border border-white/5">
            Nenhum orçamento pendente no momento.
          </div>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id} className="border-white/5 bg-surface/30 hover:border-primary/20 transition-colors group">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {budget.customerName}
                </CardTitle>
                <span className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border",
                  budget.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    budget.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      budget.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                )}>
                  {budget.status === 'pending' ? 'Pendente' :
                    budget.status === 'approved' ? 'Aprovado' :
                      budget.status === 'completed' ? 'Convertido em OS' :
                        'Rejeitado'}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Equipamento</p>
                  <p className="text-sm text-slate-300">{budget.equipmentType} - {budget.brand} {budget.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Problema</p>
                  <p className="text-sm text-slate-400 line-clamp-2">{budget.problemDescription}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase">Contato</p>
                  <p className="text-xs text-slate-500 font-mono">{budget.whatsapp} | {budget.email}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-slate-400 hover:text-white hover:bg-white/5 h-8"
                    onClick={() => copyPublicLink(budget.id)}
                  >
                    <LinkIcon size={12} className="mr-2" /> Copiar Link Público
                  </Button>
                  <div className="flex gap-2">
                    {budget.status === 'pending' && (
                      <Button
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                        onClick={() => setSelectedBudget(budget)}
                      >
                        Avaliar
                      </Button>
                    )}
                    {budget.status === 'approved' && (
                      <Button
                        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20"
                        onClick={() => handleConvertToOS(budget)}
                      >
                        <ArrowRight size={16} className="mr-2" /> Gerar OS
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Avaliação */}
      {selectedBudget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="max-w-md w-full bg-surface border-white/10 shadow-2xl animate-scale-in">
            <CardHeader>
              <CardTitle>Avaliar Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Defina o valor do serviço para aprovação:</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    className="pl-8"
                    placeholder="0.00"
                    value={approvalValue}
                    onChange={(e) => setApprovalValue(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleStatusUpdate('rejected')}
                >
                  <XCircle size={18} className="mr-2" /> Rejeitar
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => handleStatusUpdate('approved')}
                >
                  <CheckCircle size={18} className="mr-2" /> Aprovar
                </Button>
              </div>
              <button
                className="w-full text-center text-xs text-muted-foreground hover:text-white mt-2"
                onClick={() => setSelectedBudget(null)}
              >
                Cancelar
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Budgets;