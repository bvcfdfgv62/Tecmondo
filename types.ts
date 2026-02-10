export type EquipmentType = 'PC' | 'Notebook' | 'Celular' | 'Console' | 'Outro';

export type BudgetStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface BudgetRequest {
  id: string;
  customerName: string;
  whatsapp: string;
  email: string;
  equipmentType: EquipmentType;
  brand: string;
  model: string;
  problemDescription: string;
  createdAt: string; // ISO Date
  status: BudgetStatus;
  approvedValue?: number; // Valor definido pelo admin ao aprovar
  images?: string[]; // Simulação de URLs de imagem
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO Date
  relatedBudgetId?: string; // Link opcional para o orçamento
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}