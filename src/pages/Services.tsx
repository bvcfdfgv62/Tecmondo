import React, { useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { ServiceCatalogItem } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search, Edit, Trash2, Database } from 'lucide-react';
import { seedServices } from '../seedServices';

const Services: React.FC = () => {
    const [services, setServices] = useState<ServiceCatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<ServiceCatalogItem | null>(null);
    const [isInternalModalOpen, setIsInternalModalOpen] = useState(false); // Quick hack for modal visibility if not using a UI lib modal

    // Form State
    const [formData, setFormData] = useState<Partial<ServiceCatalogItem>>({
        code: '', description: '', value: 0, category: 'COMPUTADORES_NOTEBOOKS', active: true
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        const res = await supabaseService.getServiceCatalog();

        // Auto-seed if empty (Native behavior requested by user)
        if (res.success && (!res.data || res.data.length === 0)) {
            console.log('Catálogo vazio, populando nativamente...');
            await seedServices();
            // Re-fetch after seeding
            const reRes = await supabaseService.getServiceCatalog();
            if (reRes.success && reRes.data) {
                setServices(reRes.data);
            }
        } else if (res.success && res.data) {
            setServices(res.data);
        }

        setLoading(false);
    };

    const handleSeed = async () => {
        if (confirm('Deseja importar os serviços padrão? Isso pode duplicar itens se já existirem.')) {
            setLoading(true);
            await seedServices();
            await fetchServices();
            setLoading(false);
            alert('Serviços importados com sucesso!');
        }
    };

    const handleSave = async () => {
        if (!formData.code || !formData.description) return alert('Preencha os campos obrigatórios');

        await supabaseService.saveServiceCatalogItem(formData as ServiceCatalogItem);
        setIsInternalModalOpen(false);
        setEditingItem(null);
        setFormData({ code: '', description: '', value: 0, category: 'COMPUTADORES_NOTEBOOKS', active: true });
        fetchServices();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            await supabaseService.deleteServiceCatalogItem(id);
            fetchServices();
        }
    };

    const openEdit = (item: ServiceCatalogItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsInternalModalOpen(true);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({ code: '', description: '', value: 0, category: 'COMPUTADORES_NOTEBOOKS', active: true });
        setIsInternalModalOpen(true);
    };

    const filtered = services.filter(s =>
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Catálogo de Serviços</h1>
                <div className="flex gap-2">
                    <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-500">
                        <Plus className="mr-2" size={18} /> Novo Serviço
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <Input
                        placeholder="Buscar por nome ou código..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-900 border-slate-700 text-white"
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3 text-right">Valor</th>
                            <th className="px-6 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">Carregando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum serviço encontrado.</td></tr>
                        ) : (
                            filtered.map(service => (
                                <tr key={service.id || service.code} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-emerald-400">{service.code}</td>
                                    <td className="px-6 py-4 font-medium text-white">{service.description}</td>
                                    <td className="px-6 py-4 text-xs uppercase text-slate-500">{service.category}</td>
                                    <td className="px-6 py-4 text-right font-bold">R$ {service.value.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" onClick={() => openEdit(service)}>
                                            <Edit size={16} />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => service.id && handleDelete(service.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* SIMPLE MODAL FOR EDIT/CREATE */}
            {isInternalModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-md p-6 space-y-4">
                        <h2 className="text-xl font-bold text-white">{editingItem ? 'Editar Serviço' : 'Novo Serviço'}</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400">Código</label>
                                <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="bg-slate-950 border-slate-700" placeholder="Ex: MOPC001" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Descrição</label>
                                <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-slate-950 border-slate-700" placeholder="Nome do serviço" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Categoria</label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-700 bg-slate-950 text-sm px-3 text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                >
                                    <option value="COMPUTADORES_NOTEBOOKS">Computadores / Notebooks</option>
                                    <option value="IMPRESSORAS">Impressoras</option>
                                    <option value="CELULARES">Celulares</option>
                                    <option value="CAMERAS_SEGURANCA">Câmeras</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Valor (R$)</label>
                                <Input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })} className="bg-slate-950 border-slate-700" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={() => setIsInternalModalOpen(false)}>Cancelar</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleSave}>Salvar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
