import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { EquipmentType } from '../types';
import { Send, CheckCircle, UploadCloud, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Assuming Button component exists

const PublicBudgetForm: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    whatsapp: '',
    email: '',
    equipmentType: 'Notebook' as EquipmentType,
    brand: '',
    model: '',
    problemDescription: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addBudget(formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />

        <Card className="max-w-md w-full border-emerald-500/20 shadow-2xl animate-scale-in text-center bg-surface/50 backdrop-blur-md">
          <CardHeader className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Solicitação Recebida!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Nossa equipe técnica analisará as informações e entrará em contato em breve através do seu WhatsApp ou E-mail.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
            >
              Enviar nova solicitação
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-primary/20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-surface/50 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
            <div className="p-1.5 bg-primary/20 rounded-md">
              <Monitor size={20} className="text-primary" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">TEC MONDO</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Solicitar Orçamento</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Preencha o formulário abaixo para receber uma análise preliminar gratuita do seu equipamento.
          </p>
        </div>

        <Card className="bg-surface/30 border-white/5 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-white/5 pb-2">Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                    <Input
                      required
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="Ex: Maria Oliveira"
                      className="bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
                    <Input
                      required
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                    <Input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Equipamento */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-white/5 pb-2">Dados do Equipamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                    <select
                      name="equipmentType"
                      value={formData.equipmentType}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-sm border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      <option value="Notebook">Notebook</option>
                      <option value="PC">Computador (PC)</option>
                      <option value="Celular">Celular / Smartphone</option>
                      <option value="Console">Console / Videogame</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Marca</label>
                    <Input
                      required
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Ex: Dell, Samsung, Apple"
                      className="bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Modelo</label>
                    <Input
                      required
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Ex: iPhone 13, Inspiron 15 3000"
                      className="bg-slate-950 border-white/10 text-white placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Descrição do Problema</label>
                    <textarea
                      required
                      name="problemDescription"
                      value={formData.problemDescription}
                      onChange={handleChange}
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-sm border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors"
                      placeholder="Descreva o que está acontecendo com o equipamento..."
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold tracking-wide bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Solicitação
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Ao enviar, você concorda com nossos termos de serviço e política de privacidade.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicBudgetForm;