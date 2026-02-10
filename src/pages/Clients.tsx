import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Client } from '../types';
import { Search, Plus, User, Phone, Mail, FileText, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Clients: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        setClients(storageService.getClients());
    }, []);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cpfOrCnpj.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-fade-in text-text-primary pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground mt-1">Gerencie sua base de clientes e históricos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-surface/50 backdrop-blur border border-white/5 px-4 py-2 rounded-sm text-right hidden md:block">
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-0.5">TOTAL DE CLIENTES</p>
                        <p className="text-primary font-bold text-lg leading-none">{clients.length}</p>
                    </div>
                    <Button
                        onClick={() => navigate('/clientes/novo')}
                        className="bg-primary hover:bg-primary-hover text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    >
                        <Plus size={18} className="mr-2" /> Novo Cliente
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-surface/30 p-4 rounded-sm border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Buscar por nome, email ou CPF/CNPJ..."
                        className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Client List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <Card
                            key={client.id}
                            className="bg-surface/40 border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                            onClick={() => navigate(`/clientes/${client.id}`)}
                        >
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-primary transition-colors">{client.name}</h3>
                                            <p className="text-xs text-muted-foreground">ID: {client.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600 bg-slate-950 px-2 py-1 rounded border border-white/5 font-mono">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Mail size={14} className="text-primary/70" />
                                        <span className="truncate">{client.email || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Phone size={14} className="text-primary/70" />
                                        <span>{client.whatsapp || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <FileText size={14} className="text-primary/70" />
                                        <span>{client.cpfOrCnpj || '—'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-surface/20 rounded border border-white/5 border-dashed">
                        <User size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhum cliente encontrado.</p>
                        {searchTerm && <p className="text-sm">Tente buscar por outro termo.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
