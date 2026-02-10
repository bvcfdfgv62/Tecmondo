import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    FileText,
    Wrench,
    Users,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/os', label: 'Ordens de Serviço', icon: Wrench },
        { path: '/clientes', label: 'Clientes (CRM)', icon: Users },
        { path: '/fluxo', label: 'Fluxo de Caixa', icon: Wallet },
        { path: '/configuracoes', label: 'Configurações', icon: Settings },
    ];

    return (
        <>
            {/* Overlay para mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed md:relative top-0 left-0 h-screen w-72 bg-background border-r border-white/5 flex flex-col transition-transform duration-300 z-40 ease-out shadow-2xl md:shadow-none",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Header da Sidebar */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 bg-surface/30">
                    <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center">
                            <span className="font-bold text-lg">T</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">TEC MONDO</span>
                    </Link>
                </div>

                {/* Navegação */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Menu Principal
                    </div>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-sm transition-all duration-200 group border border-transparent",
                                isActive
                                    ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className="stroke-[1.5]" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                            <ChevronRight size={14} className={cn(
                                "opacity-0 -translate-x-2 transition-all duration-200",
                                "group-hover:opacity-100 group-hover:translate-x-0" // Using string for conditional class to avoid TypeScript error if isActive wasn't available here, but simpler to just use group-hover
                            )} />
                        </NavLink>
                    ))}
                </nav>

                {/* Footer da Sidebar (Perfil) */}
                <div className="p-4 border-t border-white/5 bg-surface/30">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[1px]">
                            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrador'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@tecmondo.com'}</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950/20"
                        onClick={logout}
                    >
                        <LogOut size={18} className="mr-2" />
                        Sair do Sistema
                    </Button>
                </div>
            </aside>
        </>
    );
};
