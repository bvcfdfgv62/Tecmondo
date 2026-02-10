import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { BudgetRequest } from '../types';
import { 
  ClipboardList, Check, X, ArrowRight, DollarSign, Clock, LayoutDashboard 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetRequest[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRequest | null>(null);
  const [approvalValue, setApprovalValue] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    setBudgets(storageService.getBudgets());
  };

  const openApproveModal = (budget: BudgetRequest) => {
    setSelectedBudget(budget);
    setApprovalValue('');
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedBudget && approvalValue) {
      storageService.updateBudgetStatus(selectedBudget.id, 'approved', parseFloat(approvalValue));
      setIsModalOpen(false);
      loadBudgets();
    }
  };

  const handleReject = (id: string) => {
    if (confirm('Tem certeza que deseja rejeitar este orçamento?')) {
      storageService.updateBudgetStatus(id, 'rejected');
      loadBudgets();
    }
  };

  // Conversão em OS e Entrada no Caixa
  const handleConvertToOS = (budget: BudgetRequest) => {
    if (confirm(`Confirmar realização do serviço para ${budget.customerName}? O valor de R$ ${budget.approvedValue} entrará no caixa.`)) {
      storageService.convertBudgetToIncome(budget);
      loadBudgets();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">Painel de Controle - Orçamentos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Header do Card */}
            <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${
              budget.status === 'pending' ? 'bg-yellow-50' : 
              budget.status === 'approved' ? 'bg-blue-50' :
              budget.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-semibold text-gray-700">#{budget.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                budget.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                budget.status === 'approved' ? 'bg-blue-200 text-blue-800' :
                budget.status === 'completed' ? 'bg-green-200 text-green-800' :
                'bg-red-200 text-red-800'
              }`}>
                {budget.status === 'pending' ? 'Aguardando' :
                 budget.status === 'approved' ? 'Aprovado' :
                 budget.status === 'completed' ? 'Concluído/Pago' : 'Rejeitado'}
              </span>
            </div>

            {/* Corpo do Card */}
            <div className="p-6 flex-grow space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{budget.customerName}</h3>
                <p className="text-sm text-gray-500">{budget.equipmentType} - {budget.brand} {budget.model}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border border-gray-100">
                "{budget.problemDescription}"
              </div>

              <div className="text-sm text-gray-500 flex flex-col gap-1">
                 <span>📱 {budget.whatsapp}</span>
                 <span>📧 {budget.email}</span>
                 <span className="flex items-center gap-1 text-xs mt-2 text-gray-400">
                    <Clock size={12} /> {new Date(budget.createdAt).toLocaleString('pt-BR')}
                 </span>
              </div>

              {budget.approvedValue && (
                <div className="mt-2 text-lg font-bold text-green-600 flex items-center gap-1">
                  <DollarSign size={18} />
                  Valor: {budget.approvedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
              {budget.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleReject(budget.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Rejeitar"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={() => openApproveModal(budget)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check size={18} /> Aprovar Orçamento
                  </button>
                </>
              )}

              {budget.status === 'approved' && (
                <button 
                  onClick={() => handleConvertToOS(budget)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <ClipboardList size={18} /> Converter em OS & Receber
                </button>
              )}
              
              {budget.status === 'completed' && (
                <div className="w-full text-center text-green-600 font-medium text-sm flex items-center justify-center gap-2">
                  <Check size={16} /> Lançado no Caixa
                </div>
              )}
            </div>
          </div>
        ))}

        {budgets.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum orçamento encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal de Aprovação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Aprovar Orçamento</h3>
            <p className="text-sm text-gray-600 mb-4">Defina o valor do serviço para <strong>{selectedBudget?.customerName}</strong>.</p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 sm:text-sm"
                placeholder="0.00"
                value={approvalValue}
                onChange={(e) => setApprovalValue(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleApprove}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Confirmar Valor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;