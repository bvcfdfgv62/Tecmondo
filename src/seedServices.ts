
import { supabaseService } from './services/supabaseService';
import { ServiceCatalogItem } from './types';

const initialServices: ServiceCatalogItem[] = [
    { code: 'MOPC001', description: 'FORMATAÇÃO COMPLETA', value: 150.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC002', description: 'INSTALAÇÃO DE DRIVERS', value: 80.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC003', description: 'INSTALAÇÃO DE PROGRAMAS PADRÃO', value: 100.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC004', description: 'LIMPEZA E TROCA DE PASTA TERMICA CONSOLES', value: 250.00, category: 'COMPUTADORES_NOTEBOOKS', active: true }, // Consoles usually go here or specific cat
    { code: 'MOPC005', description: 'LIMPEZA E TROCA DE PASTA TERMICA PC GAMER', value: 250.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC006', description: 'LIMPEZA E TROCA DE PASTA TERMICA PC SIMPLES', value: 150.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC007', description: 'MONTAGEM DE COMPUTADOR (EM LOCO)', value: 250.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC008', description: 'MONTAGEM DE PC GAMER (CLIENTE FORNECE AS PEÇAS)', value: 400.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC009', description: 'NOTEBOOK CAIU ÁGUA', value: 250.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC010', description: 'ORÇAMENTO PC, NOTE, CONSOLE', value: 100.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },
    { code: 'MOPC011', description: 'PC CAIU ÁGUA', value: 120.00, category: 'COMPUTADORES_NOTEBOOKS', active: true },

    { code: 'MOI001', description: 'ALINHAMENTO DE IMPRESSORA', value: 125.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI002', description: 'INSTALAÇÃO DE IMPRESSORAS (EM LOCO)', value: 250.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI003', description: 'INSTALAÇÃO DE IMPRESSORAS (NA LOJA)', value: 80.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI004', description: 'IMPRESSORA CAIU ÁGUA (LIMPEZA DE LÍQUIDOS)', value: 150.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI005', description: 'LIMPEZA DE CABEÇOTE', value: 125.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI006', description: 'LIMPEZA DE IMPRESSORA', value: 125.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI007', description: 'ORÇAMENTO IMPRESSORA', value: 50.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI008', description: 'RESET E ATUALIZAÇÃO DE FIRMEWARE', value: 125.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI009', description: 'TROCA DE ALMOFADA DE IMPRESSÃO', value: 87.00, category: 'IMPRESSORAS', active: true },
    { code: 'MOI010', description: 'TROCA DE CARRO DE IMPRESSÃO OU SUBSTITUIÇÃO DE PEÇAS', value: 150.00, category: 'IMPRESSORAS', active: true },

    { code: 'MOC001', description: 'ATUALIZAÇÃO DE APPS', value: 50.00, category: 'CELULARES', active: true },
    { code: 'MOC002', description: 'ATUALIZAÇÃO DE SOFTWARE', value: 50.00, category: 'CELULARES', active: true },
    { code: 'MOC003', description: 'BACKUP DE DADOS', value: 150.00, category: 'CELULARES', active: true },
    { code: 'MOC004', description: 'CALIBRAGEM OU COPIA DE BATERIA EM IPHONES', value: 250.00, category: 'CELULARES', active: true },
    { code: 'MOC005', description: 'CELULAR CAIU NA ÁGUA (LIMPEZA DE LÍQUIDOS)', value: 120.00, category: 'CELULARES', active: true },
    { code: 'MOC006', description: 'CRIAÇÃO DE CONTAS (POR CONTA)', value: 40.00, category: 'CELULARES', active: true },
    { code: 'MOC007', description: 'DESBLOQUEIO DE CONTA GOOGLE (COM SERVIDOR)', value: 200.00, category: 'CELULARES', active: true },
    { code: 'MOC008', description: 'DESBLOQUEIO DE CONTA GOOGLE (SEM SERVIDOR)', value: 120.00, category: 'CELULARES', active: true },
    { code: 'MOC009', description: 'LIMPEZA DE VÍRUS', value: 50.00, category: 'CELULARES', active: true },
    { code: 'MOC010', description: 'ORÇAMENTO CELULAR', value: 100.00, category: 'CELULARES', active: true },
    { code: 'MOC011', description: 'PASSAR LASER TAMPA DE VIDRO DO IPHONE', value: 150.00, category: 'CELULARES', active: true },
    { code: 'MOC012', description: 'RECUPERAÇÃO DE SENHA OU CONTAS (POR CONTA)', value: 50.00, category: 'CELULARES', active: true },
    { code: 'MOC013', description: 'RESET OU RESTAURAÇÃO DE FÁBRICA (CLIENTE NÃO SABE AS SENHAS)', value: 150.00, category: 'CELULARES', active: true },
    { code: 'MOC014', description: 'RESET OU RESTAURAÇÃO DE FÁBRICA (CLIENTE SABE AS SENHAS)', value: 80.00, category: 'CELULARES', active: true },
    { code: 'MOC015', description: 'TRANSFERENCIA DE TELEFONES', value: 100.00, category: 'CELULARES', active: true },
    { code: 'MOC016', description: 'TROCA DE PEÇAS', value: 100.00, category: 'CELULARES', active: true },
    { code: 'MOC017', description: 'TROCA DE PEÇAS (CLIENTE TRAZ A PEÇA)', value: 150.00, category: 'CELULARES', active: true },
];

export const seedServices = async () => {
    console.log('Seeding services...');
    for (const service of initialServices) {
        await supabaseService.saveServiceCatalogItem(service);
    }
    console.log('Seeding complete.');
};
