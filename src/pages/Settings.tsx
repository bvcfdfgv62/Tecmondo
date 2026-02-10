import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { SystemSettings } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        companyName: '',
        cnpj: '',
        phone: '',
        email: '',
        address: ''
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loaded = storageService.getSettings();
        setSettings(loaded);
    }, []);

    const handleChange = (field: keyof SystemSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        storageService.saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-8 animate-fade-in text-text-primary pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <SettingsIcon size={32} /> Configurações
                </h1>
                <p className="text-muted-foreground mt-1">Gerencie as preferências do sistema e sua conta.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full md:w-[600px] grid-cols-4 bg-surface/30 border border-white/5">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="notifications">Alertas</TabsTrigger>
                    <TabsTrigger value="appearance">Visual</TabsTrigger>
                    <TabsTrigger value="security">Segurança</TabsTrigger>
                </TabsList>

                {/* --- PERFIL --- */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <Card className="bg-surface/30 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <User size={20} className="text-primary" /> Dados da Empresa
                            </CardTitle>
                            <CardDescription>Informações exibidas nos orçamentos e ordens de serviço.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-white">Nome Fantasia</Label>
                                    <Input
                                        value={settings.companyName}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">CNPJ</Label>
                                    <Input
                                        value={settings.cnpj}
                                        onChange={(e) => handleChange('cnpj', e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Telefone / WhatsApp</Label>
                                    <Input
                                        value={settings.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white">Email de Contato</Label>
                                    <Input
                                        value={settings.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Endereço</Label>
                                <Input
                                    value={settings.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white"
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    className={`transition-all ${saved ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary-hover'}`}
                                >
                                    {saved ? (
                                        <><Check size={18} className="mr-2" /> Salvo!</>
                                    ) : (
                                        <><Save size={18} className="mr-2" /> Salvar Alterações</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- APARÊNCIA --- */}
                <TabsContent value="appearance" className="mt-6">
                    <Card className="bg-surface/30 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Palette size={20} className="text-primary" /> Tema e Visual
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-slate-950 border border-white/10 rounded-lg text-center">
                                <p className="text-slate-400">O tema <strong>Deep Obsidian</strong> está ativo por padrão.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICAÇÕES (Placeholder) --- */}
                <TabsContent value="notifications" className="mt-6">
                    <Card className="bg-surface/30 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Bell size={20} className="text-primary" /> Preferências de Alerta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 text-sm">
                            Configurações de notificações em breve.
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SEGURANÇA (Placeholder) --- */}
                <TabsContent value="security" className="mt-6">
                    <Card className="bg-surface/30 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield size={20} className="text-primary" /> Segurança da Conta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400 text-sm">
                            Alteração de senha e autenticação em dois fatores em breve.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
