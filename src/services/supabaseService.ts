
import { supabase } from '../lib/supabase';
import {
    BudgetRequest,
    Transaction,
    DashboardStats,
    ServiceOrder,
    Product,
    Sale,
    Client,
    SystemSettings,
    CashFlowStats,
    ApiResponse
} from '../types';

const createResponse = <T>(data: T | null, error: any): ApiResponse<T> => {
    if (error) {
        console.error('API Error:', error);
        return {
            success: false,
            data: null,
            error: error.message || 'Erro desconhecido ao processar requisição'
        };
    }
    return {
        success: true,
        data: data,
        error: null
    };
};

export const supabaseService = {
    // --- Settings Methods ---
    getSettings: async (): Promise<ApiResponse<SystemSettings>> => {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found", which we handle gracefully
            return createResponse(null, error);
        }

        if (!data) {
            // Return default settings if none exist
            return createResponse({
                companyName: 'Tec Mondo Assistência',
                cnpj: '00.000.000/0001-00',
                phone: '(11) 99999-9999',
                email: 'contato@tec-mondo.com',
                address: 'Rua Exemplo, 123 - Centro, SP'
            }, null);
        }

        return createResponse({
            companyName: data.company_name,
            cnpj: data.cnpj,
            phone: data.phone,
            email: data.email,
            address: data.address
        }, null);
    },

    saveSettings: async (settings: SystemSettings): Promise<ApiResponse<void>> => {
        // Check if settings exist
        const { count, error: countError } = await supabase.from('settings').select('*', { count: 'exact', head: true });

        if (countError) return createResponse(null, countError);

        if (count && count > 0) {
            // Update first row
            const { data } = await supabase.from('settings').select('id').limit(1).single();
            if (data) {
                const { error: updateError } = await supabase.from('settings').update({
                    company_name: settings.companyName,
                    cnpj: settings.cnpj,
                    phone: settings.phone,
                    email: settings.email,
                    address: settings.address
                }).eq('id', data.id);
                if (updateError) return createResponse(null, updateError);
            }
        } else {
            const { error: insertError } = await supabase.from('settings').insert({
                company_name: settings.companyName,
                cnpj: settings.cnpj,
                phone: settings.phone,
                email: settings.email,
                address: settings.address
            });
            if (insertError) return createResponse(null, insertError);
        }
        return createResponse(null, null);
    },

    // --- Budget Methods ---
    getBudgets: async (): Promise<ApiResponse<BudgetRequest[]>> => {
        const { data, error } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });

        if (error) return createResponse(null, error);

        const budgets = (data || []).map((b: any) => ({
            id: b.id,
            customerName: b.customer_name || 'Cliente',
            email: b.email || '',
            whatsapp: b.whatsapp || '',
            equipmentType: (b.equipment_text as any) || 'Outro',
            brand: '',
            model: '',
            problemDescription: b.problem_description || '',
            status: b.status || 'pending',
            createdAt: b.created_at,
            approvedValue: b.approved_value
        }));

        return createResponse(budgets, null);
    },

    addBudget: async (budget: Omit<BudgetRequest, 'id' | 'createdAt' | 'status'>): Promise<ApiResponse<BudgetRequest>> => {
        const { data, error } = await supabase.from('budgets').insert({
            customer_name: budget.customerName,
            email: budget.email,
            whatsapp: budget.whatsapp,
            equipment_text: `${budget.equipmentType} - ${budget.brand} - ${budget.model}`,
            problem_description: budget.problemDescription,
            status: 'pending',
            approved_value: budget.approvedValue
        }).select().single();

        if (error) return createResponse(null, error);

        const newBudget = {
            id: data.id,
            customerName: data.customer_name || 'Cliente',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            equipmentType: (data.equipment_text as any) || 'Outro',
            brand: '',
            model: '',
            problemDescription: data.problem_description || '',
            status: data.status || 'pending',
            createdAt: data.created_at,
            approvedValue: data.approved_value
        };

        return createResponse(newBudget, null);
    },

    updateBudgetStatus: async (id: string, status: BudgetRequest['status'], approvedValue?: number): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('budgets').update({
            status,
            approved_value: approvedValue
        }).eq('id', id);

        return createResponse(null, error);
    },

    // --- Service Order Methods ---
    getServiceOrders: async (): Promise<ApiResponse<ServiceOrder[]>> => {
        const { data, error } = await supabase.from('service_orders').select('*').order('created_at', { ascending: false });

        if (error) return createResponse(null, error);

        const orders = (data || []).map((o: any) => ({
            id: o.id,
            createdAt: o.created_at,
            status: o.status || 'open',
            technician: o.technician || '',
            customerName: o.customer_name || 'Cliente Sem Nome',
            whatsapp: o.whatsapp || '',
            email: o.email || '',
            equipmentType: o.equipment_type || 'Outro',
            brand: o.brand || '',
            model: o.model || '',
            reportedProblem: o.reported_problem || '',
            entryCondition: o.entry_condition || {},
            services: o.services || [],
            products: o.products || [],
            discount: o.discount || 0,
            totalValue: o.total_value || 0,
            paymentStatus: o.payment_status || 'pending',
            budgetId: undefined
        }));

        return createResponse(orders, null);
    },

    getServiceOrderById: async (id: string): Promise<ApiResponse<ServiceOrder>> => {
        const { data: o, error } = await supabase.from('service_orders').select('*').eq('id', id).single();

        if (error) return createResponse(null, error);
        if (!o) return createResponse(null, { message: 'OS não encontrada' });

        const order = {
            id: o.id,
            createdAt: o.created_at,
            status: o.status || 'open',
            technician: o.technician || '',
            customerName: o.customer_name || 'Cliente Sem Nome',
            whatsapp: o.whatsapp || '',
            email: o.email || '',
            equipmentType: o.equipment_type || 'Outro',
            brand: o.brand || '',
            model: o.model || '',
            reportedProblem: o.reported_problem || '',
            entryCondition: o.entry_condition || {},
            diagnosis: o.diagnosis || '',
            services: o.services || [],
            products: o.products || [],
            discount: o.discount || 0,
            totalValue: o.total_value || 0,
            paymentStatus: o.payment_status || 'pending',
            repairCategory: o.repair_category || undefined,
            budgetId: undefined
        };

        return createResponse(order, null);
    },

    createServiceOrder: async (data: Partial<ServiceOrder>): Promise<ApiResponse<ServiceOrder>> => {
        // Use default values for a new OS
        const { data: newOrder, error } = await supabase.from('service_orders').insert({
            status: 'open',
            customer_name: '',
            equipment_type: 'Outro',
            entry_condition: {},
            services: [],
            products: [],
            total_value: 0
        }).select().single();

        if (error) return createResponse(null, error);

        const createdOrder = {
            id: newOrder.id,
            createdAt: newOrder.created_at,
            status: newOrder.status,
            technician: newOrder.technician || '',
            customerName: newOrder.customer_name || '',
            whatsapp: newOrder.whatsapp || '',
            email: newOrder.email || '',
            equipmentType: newOrder.equipment_type || 'Outro',
            brand: newOrder.brand || '',
            model: newOrder.model || '',
            reportedProblem: newOrder.reported_problem || '',
            entryCondition: newOrder.entry_condition || {},
            services: newOrder.services || [],
            products: newOrder.products || [],
            discount: newOrder.discount || 0,
            totalValue: newOrder.total_value || 0,
            paymentStatus: newOrder.payment_status || 'pending',
            budgetId: undefined
        };

        return createResponse(createdOrder, null);
    },

    saveServiceOrder: async (order: ServiceOrder): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('service_orders').update({
            status: order.status,
            technician: order.technician,
            customer_name: order.customerName,
            whatsapp: order.whatsapp,
            email: order.email,
            equipment_type: order.equipmentType,
            brand: order.brand,
            model: order.model,
            reported_problem: order.reportedProblem,
            entry_condition: order.entryCondition,
            diagnosis: order.diagnosis,
            services: order.services,
            products: order.products,
            discount: order.discount,
            total_value: order.totalValue,
            payment_status: order.paymentStatus,
            repair_category: order.repairCategory,
            updated_at: new Date().toISOString()
        }).eq('id', order.id);

        if (error) return createResponse(null, error);

        // If completed or paid, maybe register transaction?
        if (order.status === 'completed' && order.paymentStatus === 'paid') {
            await supabaseService.addTransactionFromOS(order);
        }

        return createResponse(null, null);
    },

    deleteServiceOrder: async (id: string): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('service_orders').delete().eq('id', id);
        return createResponse(null, error);
    },

    // ... (rest of methods)

    // --- Transactions ---
    getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
        const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        if (error) return createResponse(null, error);

        const transactions = (data || []).map((t: any) => ({
            id: t.id,
            date: t.date,
            description: t.description || 'Sem descrição',
            amount: t.amount || 0,
            type: t.type || 'expense',
            category: t.category || 'Geral'
        }));

        return createResponse(transactions, null);
    },

    addTransaction: async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('transactions').insert({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: new Date().toISOString()
        });

        return createResponse(null, error);
    },

    addTransactionFromOS: async (os: ServiceOrder): Promise<ApiResponse<void>> => {
        // Check if duplicate transaction exists
        const { count, error: checkError } = await supabase.from('transactions')
            .select('*', { count: 'exact', head: true })
            .ilike('description', `%Serviço ${os.id}%`);

        if (checkError) return createResponse(null, checkError);

        if (count === 0) {
            return await supabaseService.addTransaction({
                description: `Serviço ${os.id} - ${os.customerName}`,
                amount: os.totalValue,
                type: 'income',
                category: 'Serviços'
            });
        }

        return createResponse(null, null);
    },

    // --- Clients ---
    getClients: async (): Promise<ApiResponse<Client[]>> => {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) return createResponse(null, error);

        const clients = (data || []).map((c: any) => ({
            id: c.id,
            createdAt: c.created_at,
            name: c.name || 'Cliente Sem Nome',
            email: c.email || '',
            whatsapp: c.whatsapp || '',
            cpfOrCnpj: c.cpf_cnpj || '',
            address: c.address || '',
            notes: c.notes || ''
        }));

        return createResponse(clients, null);
    },

    getClientById: async (id: string): Promise<ApiResponse<Client>> => {
        const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
        if (error) return createResponse(null, error);
        if (!data) return createResponse(null, { message: 'Cliente não encontrado' });

        const client = {
            id: data.id,
            createdAt: data.created_at,
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            cpfOrCnpj: data.cpf_cnpj,
            address: data.address,
            notes: data.notes
        };

        return createResponse(client, null);
    },

    saveClient: async (client: Client): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('clients').upsert({
            id: client.id.length < 10 ? undefined : client.id, // Handle legacy IDs vs UUIDs
            updated_at: new Date().toISOString(),
            name: client.name,
            email: client.email,
            whatsapp: client.whatsapp,
            cpf_cnpj: client.cpfOrCnpj,
            address: client.address,
            notes: client.notes
        });

        return createResponse(null, error);
    },

    createClient: async (data: Partial<Client>): Promise<ApiResponse<Client>> => {
        const { data: newClient, error } = await supabase.from('clients').insert({
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            cpf_cnpj: data.cpfOrCnpj,
            address: data.address,
            notes: data.notes
        }).select().single();

        if (error) return createResponse(null, error);

        const client = {
            id: newClient.id,
            createdAt: newClient.created_at,
            name: newClient.name,
            email: newClient.email,
            whatsapp: newClient.whatsapp,
            cpfOrCnpj: newClient.cpf_cnpj,
            address: newClient.address,
            notes: newClient.notes
        };

        return createResponse(client, null);
    },

    getClientHistory: async (email: string): Promise<ApiResponse<{ orders: any[], budgets: any[] }>> => {
        const { data: orders, error: ordersError } = await supabase.from('service_orders').select('*').eq('email', email).order('created_at', { ascending: false });
        const { data: budgets, error: budgetsError } = await supabase.from('budgets').select('*').eq('email', email).order('created_at', { ascending: false });

        if (ordersError) return createResponse(null, ordersError);
        if (budgetsError) return createResponse(null, budgetsError);

        const history = {
            orders: orders ? orders.map((o: any) => ({
                id: o.id,
                createdAt: o.created_at,
                status: o.status,
                technician: o.technician,
                customerName: o.customer_name,
                whatsapp: o.whatsapp,
                email: o.email,
                equipmentType: o.equipment_type,
                brand: o.brand,
                model: o.model,
                reportedProblem: o.reported_problem,
                entryCondition: o.entry_condition || {},
                services: o.services || [],
                products: o.products || [],
                discount: o.discount,
                totalValue: o.total_value,
                paymentStatus: o.payment_status
            })) : [],
            budgets: budgets ? budgets.map((b: any) => ({
                id: b.id,
                customerName: b.customer_name,
                email: b.email,
                whatsapp: b.whatsapp,
                equipmentType: b.equipment_text ? b.equipment_text.split(' - ')[0] : 'Outro',
                brand: '',
                model: '',
                problemDescription: b.problem_description,
                status: b.status,
                createdAt: b.created_at,
                approvedValue: b.approved_value
            })) : []
        };

        return createResponse(history, null);
    },

    // --- Products ---
    getProducts: async (): Promise<ApiResponse<Product[]>> => {
        const { data, error } = await supabase.from('products').select('*').order('description', { ascending: true });
        if (error) return createResponse(null, error);

        const products = (data || []).map((p: any) => ({
            id: p.id,
            barcode: p.barcode || '',
            description: p.description || 'Produto Sem Nome',
            purchasePrice: p.purchase_price || 0,
            resalePrice: p.resale_price || 0,
            stockQuantity: p.stock_quantity || 0,
            imageUrl: p.image_url || '',
            supplier: p.supplier || '',
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));

        return createResponse(products, null);
    },

    getProductById: async (id: string): Promise<ApiResponse<Product>> => {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) return createResponse(null, error);
        if (!data) return createResponse(null, { message: 'Produto não encontrado' });

        const product = {
            id: data.id,
            barcode: data.barcode,
            description: data.description,
            purchasePrice: data.purchase_price,
            resalePrice: data.resale_price,
            stockQuantity: data.stock_quantity,
            imageUrl: data.image_url,
            supplier: data.supplier,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return createResponse(product, null);
    },

    saveProduct: async (product: Product): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('products').upsert({
            id: product.id.length < 10 ? undefined : product.id,
            barcode: product.barcode,
            description: product.description,
            purchase_price: product.purchasePrice,
            resale_price: product.resalePrice,
            stock_quantity: product.stockQuantity,
            image_url: product.imageUrl,
            supplier: product.supplier,
            updated_at: new Date().toISOString()
        });

        return createResponse(null, error);
    },

    createProduct: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
        const { data: newProduct, error } = await supabase.from('products').insert({
            barcode: data.barcode,
            description: data.description,
            purchase_price: data.purchasePrice,
            resale_price: data.resalePrice,
            stock_quantity: data.stockQuantity,
            image_url: data.imageUrl,
            supplier: data.supplier
        }).select().single();

        if (error) return createResponse(null, error);

        const product = {
            id: newProduct.id,
            barcode: newProduct.barcode,
            description: newProduct.description,
            purchasePrice: newProduct.purchase_price,
            resalePrice: newProduct.resale_price,
            stockQuantity: newProduct.stock_quantity,
            imageUrl: newProduct.image_url,
            supplier: newProduct.supplier,
            createdAt: newProduct.created_at,
            updatedAt: newProduct.updated_at
        };

        return createResponse(product, null);
    },

    deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        return createResponse(null, error);
    },

    // --- Sales ---
    getSales: async (): Promise<ApiResponse<Sale[]>> => {
        const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
        if (error) return createResponse(null, error);

        const sales = (data || []).map((s: any) => ({
            id: s.id,
            createdAt: s.created_at,
            customerName: s.customer_name || 'Cliente',
            totalValue: s.total_value || 0,
            paymentMethod: s.payment_method || 'money',
            status: s.status || 'completed',
            items: s.items || []
        }));

        return createResponse(sales, null);
    },

    createSale: async (sale: Omit<Sale, 'id' | 'createdAt'>): Promise<ApiResponse<Sale>> => {
        const { data: newSale, error } = await supabase.from('sales').insert({
            customer_name: sale.customerName,
            client_id: sale.clientId,
            total_value: sale.totalValue,
            payment_method: sale.paymentMethod,
            status: sale.status,
            items: sale.items
        }).select().single();

        if (error) return createResponse(null, error);

        // Update stock
        for (const item of sale.items) {
            const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', item.productId).single();
            if (prod) {
                await supabase.from('products').update({
                    stock_quantity: prod.stock_quantity - item.quantity
                }).eq('id', item.productId);
            }
        }

        // Register Transaction
        await supabaseService.addTransaction({
            description: `Venda #${newSale.id} - ${newSale.customer_name}`,
            amount: newSale.total_value,
            category: 'Vendas',
            type: 'income'
        });

        const createdSale = {
            id: newSale.id,
            createdAt: newSale.created_at,
            customerName: newSale.customer_name,
            totalValue: newSale.total_value,
            paymentMethod: newSale.payment_method,
            status: newSale.status,
            items: newSale.items
        };

        return createResponse(createdSale, null);
    },

    getDashboardKPIs: async (): Promise<ApiResponse<DashboardStats>> => {
        // Monthly Income
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: incomeData, error: incomeError } = await supabase.from('transactions')
            .select('amount')
            .eq('type', 'income')
            .gte('date', firstDay);

        if (incomeError) return createResponse(null, incomeError);

        const monthlyIncome = incomeData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

        // Pending Budgets
        const { count: pendingBudgets, error: budgetError } = await supabase.from('budgets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Active OS
        const { count: activeOS, error: osError } = await supabase.from('service_orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['open', 'diagnosing', 'pending_approval', 'approved', 'in_progress']);

        // Unique Clients
        const { count: uniqueClients, error: clientError } = await supabase.from('clients')
            .select('*', { count: 'exact', head: true });

        return createResponse({
            monthlyIncome,
            pendingBudgets: pendingBudgets || 0,
            activeOS: activeOS || 0,
            uniqueClients: uniqueClients || 0
        }, null);
    },

    getCashFlowStats: async (): Promise<ApiResponse<CashFlowStats>> => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Total Balance
        const { data: allTransactions, error: txError } = await supabase.from('transactions').select('amount, type');

        if (txError) return createResponse(null, txError);

        const totalBalance = allTransactions?.reduce((acc, curr) => {
            return acc + (curr.type === 'income' ? curr.amount : -curr.amount);
        }, 0) || 0;

        // Monthly Stats
        const { data: monthlyTransactions, error: mTxError } = await supabase.from('transactions')
            .select('amount, type')
            .gte('date', firstDay);

        if (mTxError) return createResponse(null, mTxError);

        const monthlyIncome = monthlyTransactions
            ?.filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0) || 0;

        const monthlyExpense = monthlyTransactions
            ?.filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0) || 0;

        return createResponse({
            totalBalance,
            monthlyIncome,
            monthlyExpense
        }, null);
    }
};
