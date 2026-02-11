import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('tecmondo@icloud.com');
    const [password, setPassword] = useState('202020');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(email, password)) {
            navigate('/', { replace: true });
        } else {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[96px] pointer-events-none" />

            <Card className="w-full max-w-md mx-4 border-white/10 shadow-2xl animate-scale-in backdrop-blur-md bg-surface/50">
                <CardHeader className="text-center space-y-2 flex flex-col items-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-lg ring-4 ring-primary/20">
                        <img src="/logo.jpg" alt="Tec Mondo" className="w-full h-full object-contain p-2" />
                    </div>
                    {/* <CardTitle className="text-2xl font-bold text-white tracking-tight">TEC MONDO</CardTitle> */}
                    <CardDescription className="text-lg">Acesse o painel administrativo</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm flex items-center gap-2 text-destructive text-sm animate-fade-in">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Mail size={16} />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="tecmondo@icloud.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5">
                            Entrar no Sistema
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-white/5 pt-6 mt-2">
                    <p className="text-xs text-muted-foreground">
                        Esqueceu a senha? Contate o suporte técnico.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
