import React, { useState } from 'react';
import { Menu, X, Monitor } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row text-text-primary font-sans selection:bg-primary/30">
            {/* Mobile Header */}
            <div className="md:hidden bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center z-50 sticky top-0">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1.5 rounded text-primary">
                        <Monitor size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-wide text-white">TEC MONDO</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white transition-colors">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen bg-background relative scroll-smooth">
                {/* Top gradient for effect */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};
