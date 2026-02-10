import { BudgetRequest, Transaction, DashboardStats, ServiceOrder, ServiceOrderStatus } from '../types';

const STORAGE_KEYS = {
  BUDGETS: 'tec_mondo_budgets',
  TRANSACTIONS: 'tec_mondo_transactions',
  SERVICE_ORDERS: 'tec_mondo_service_orders',
  SETTINGS: 'tec_mondo_settings'
};

export const storageService = {
  // --- Settings Methods ---
  getSettings: (): import('../types').SystemSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return JSON.parse(data);

    // Default settings if none exist
    return {
      companyName: 'Tec Mondo Assistência',
      cnpj: '00.000.000/0001-00',
      phone: '(11) 99999-9999',
      email: 'contato@tec-mondo.com',
      address: 'Rua Exemplo, 123 - Centro, SP'
    };
  },

  saveSettings: (settings: import('../types').SystemSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- Budget Methods ---
  getBudgets: (): BudgetRequest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  },

  getBudgetById: (id: string): BudgetRequest | undefined => {
    const budgets = storageService.getBudgets();
    return budgets.find(b => b.id === id);
  },

  addBudget: (budget: Omit<BudgetRequest, 'id' | 'createdAt' | 'status'>) => {
    const budgets = storageService.getBudgets();
    const newBudget: BudgetRequest = {
      ...budget,
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([newBudget, ...budgets]));
    return newBudget;
  },

  updateBudgetStatus: (id: string, status: BudgetRequest['status'], approvedValue?: number) => {
    const budgets = storageService.getBudgets();
    const updatedBudgets = budgets.map(b =>
      b.id === id ? { ...b, status, approvedValue: approvedValue ?? b.approvedValue } : b
    );
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(updatedBudgets));
  },

  // --- Service Order Methods ---
  getServiceOrders: (): ServiceOrder[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICE_ORDERS);
    return data ? JSON.parse(data) : [];
  },

  getServiceOrderById: (id: string): ServiceOrder | undefined => {
    const orders = storageService.getServiceOrders();
    return orders.find(o => o.id === id);
  },

  saveServiceOrder: (order: ServiceOrder) => {
    const orders = storageService.getServiceOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);

    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }

    localStorage.setItem(STORAGE_KEYS.SERVICE_ORDERS, JSON.stringify(orders));

    // Impact Cash Flow if finalized
    if (order.status === 'completed' && order.paymentStatus === 'paid') {
      storageService.addTransactionFromOS(order);
    }
  },

  createServiceOrder: (data: Partial<ServiceOrder>): ServiceOrder => {
    const newOrder: ServiceOrder = {
      id: `OS-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      technician: 'Técnico Responsável',
      customerName: data.customerName || '',
      whatsapp: data.whatsapp || '',
      email: data.email || '',
      equipmentType: data.equipmentType || 'Notebook',
      brand: data.brand || '',
      model: data.model || '',
      entryCondition: {
        turnOn: false,
        brokenScreen: false,
        noAccessories: false,
        hasPassword: false
      },
      reportedProblem: data.reportedProblem || '',
      services: [],
      discount: 0,
      totalValue: 0,
      paymentStatus: 'pending',
      ...data
    } as ServiceOrder; // Cast necessary for partial spread

    storageService.saveServiceOrder(newOrder);
    return newOrder;
  },

  // --- Transaction / Cash Flow Methods ---
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const transactions = storageService.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([newTransaction, ...transactions]));
  },

  addTransactionFromOS: (os: ServiceOrder) => {
    // Check if duplicate transaction exists (simple check by ID in description)
    const transactions = storageService.getTransactions();
    const exists = transactions.some(t => t.description.includes(os.id));

    if (!exists) {
      storageService.addTransaction({
        description: `Serviço ${os.id} - ${os.customerName}`,
        amount: os.totalValue,
        type: 'income',
        category: 'Serviços'
      });
    }
  },

  convertBudgetToIncome: (budget: BudgetRequest) => {
    storageService.updateBudgetStatus(budget.id, 'completed');
    if (budget.approvedValue) {
      storageService.addTransaction({
        description: `Serviço Orçamento #${budget.id} - ${budget.customerName}`,
        amount: budget.approvedValue,
        type: 'income',
        category: 'Serviços'
      });
    }
  },

  getStats: (): DashboardStats => {
    const transactions = storageService.getTransactions();
    const now = new Date();

    return transactions.reduce((acc, curr) => {
      const transDate = new Date(curr.date);
      const isThisMonth = transDate.getMonth() === now.getMonth() &&
        transDate.getFullYear() === now.getFullYear();

      const amount = curr.amount;

      if (curr.type === 'income') {
        acc.totalBalance += amount;
        if (isThisMonth) acc.monthlyIncome += amount;
      } else {
        acc.totalBalance -= amount;
        if (isThisMonth) acc.monthlyExpense += amount;
      }
      return acc;
    }, { totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0 });
  },

  // --- Client Methods ---
  getClients: (): import('../types').Client[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },

  getClientById: (id: string): import('../types').Client | undefined => {
    const clients = storageService.getClients();
    return clients.find(c => c.id === id);
  },

  saveClient: (client: import('../types').Client) => {
    const clients = storageService.getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);

    if (existingIndex >= 0) {
      clients[existingIndex] = client;
    } else {
      clients.unshift(client);
    }

    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  createClient: (data: Partial<import('../types').Client>): import('../types').Client => {
    const newClient: import('../types').Client = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
      name: data.name || '',
      email: data.email || '',
      whatsapp: data.whatsapp || '',
      cpfOrCnpj: data.cpfOrCnpj || '',
      address: data.address || '',
      notes: data.notes || '',
      ...data
    } as import('../types').Client;

    storageService.saveClient(newClient);
    return newClient;
  },

  getClientHistory: (email: string) => {
    // Finds all OS and Budgets related to this client email
    const orders = storageService.getServiceOrders().filter(o => o.email === email);
    const budgets = storageService.getBudgets().filter(b => b.email === email);
    return { orders, budgets };
  },

  getKPIs: () => {
    const budgets = storageService.getBudgets();
    const transactions = storageService.getTransactions();
    const orders = storageService.getServiceOrders();

    // Faturamento Mês
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Sum incomes from transactions for the current month
    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    // Orçamentos Pendentes
    const pendingBudgets = budgets.filter(b => b.status === 'pending').length;

    // OS em Andamento
    const activeOS = orders.filter(o => ['open', 'diagnosing', 'pending_approval', 'approved', 'in_progress'].includes(o.status)).length;

    // Base de Clientes (Unique emails from Budgets + OS)
    const clientEmails = new Set([
      ...budgets.map(b => b.email),
      ...orders.map(o => o.email)
    ]);
    const uniqueClients = clientEmails.size;

    return { monthlyIncome, pendingBudgets, activeOS, uniqueClients };
  }
};