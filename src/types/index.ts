export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

export interface DashboardStats {
    monthlyIncome: number;
    pendingBudgets: number;
    activeOS: number;
    uniqueClients: number;
}

export interface CashFlowStats {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

export interface SystemSettings {
    companyName: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
}

export interface Client {
    id: string;
    createdAt: string;
    name: string;
    email: string;
    whatsapp: string;
    cpfOrCnpj: string;
    address: string;
    notes: string;
}

export type EquipmentType = 'PC' | 'Notebook' | 'Celular' | 'Console' | 'Outro';

export interface BudgetRequest {
    id: string;
    customerName: string;
    whatsapp: string;
    email: string;
    equipmentType: EquipmentType;
    brand: string;
    model: string;
    problemDescription: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: string;
    approvedValue?: number;
}

// Service Order Types
export type ServiceOrderStatus = 'open' | 'diagnosing' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export type ServiceCategory = 'COMPUTADORES_NOTEBOOKS' | 'IMPRESSORAS' | 'CELULARES' | 'CAMERAS_SEGURANCA';

export interface ServiceCatalogItem {
    id?: string; // Optional because logic might rely on 'code' as key
    code: string;
    category: ServiceCategory;
    description: string;
    value: number;
    cost?: number; // Optional as per requirements
    active: boolean;
}

export interface ServiceItem {
    id: string;
    code?: string; // Link to catalog
    description: string;
    value: number;
    amount?: number; // Quantity
}

export interface ServiceOrder {
    id: string;
    // Status & Metadata
    status: ServiceOrderStatus;
    createdAt: string;
    deadline?: string;
    technician: string;

    // Classification
    repairCategory?: ServiceCategory; // New field for the module

    // Client Data
    customerName: string;
    whatsapp: string;
    email: string;
    cpf?: string;

    // Equipment Data
    equipmentType: EquipmentType;
    brand: string;
    model: string;
    serialNumber?: string;
    entryCondition: {
        turnOn: boolean;
        brokenScreen: boolean;
        noAccessories: boolean;
        hasPassword: boolean;
        password?: string;
    };

    // Problem & Diagnosis
    reportedProblem: string;
    diagnosis?: string;
    technicalNotes?: string;
    riskAssessment?: string;

    // Financials
    services: ServiceItem[];
    products?: {
        id: string;
        productId: string;
        description: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }[];
    discount: number;
    totalValue: number;

    // Payment
    paymentMethod?: 'pix' | 'money' | 'card';
    paymentStatus: 'pending' | 'paid';

    // Legal
    warrantyTerms?: string;
    clientSignature?: string;
    technicianSignature?: string;

    // Link to other entities
    budgetId?: string; // If converted from budget
}

export interface Product {
    id: string;
    barcode: string;
    description: string;
    purchasePrice: number;
    resalePrice: number;
    stockQuantity: number;
    imageUrl: string;
    supplier: string;
    createdAt: string;
    updatedAt: string;
}

export interface SaleItem {
    id: string;
    productId: string;
    description: string;
    unitPrice: number;
    quantity: number;
    total: number;
}

export interface Sale {
    id: string;
    createdAt: string;
    clientId?: string;
    customerName: string;
    items: SaleItem[];
    totalValue: number;
    paymentMethod: 'credit' | 'debit' | 'money' | 'pix';
    status: 'completed' | 'cancelled';
}
