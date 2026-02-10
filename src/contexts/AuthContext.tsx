import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: { name: string; email: string } | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        try {
            const storedAuth = localStorage.getItem('auth_token');
            if (storedAuth === 'valid_token') {
                setIsAuthenticated(true);
                setUser({ name: 'Admin', email: 'tecmondo@icloud.com' });
            }
        } catch (error) {
            console.error('Erro ao acessar localStorage:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (email: string, password: string) => {
        if (email === 'tecmondo@icloud.com' && password === '202020') {
            localStorage.setItem('auth_token', 'valid_token');
            setIsAuthenticated(true);
            setUser({ name: 'Admin', email: 'tecmondo@icloud.com' });
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Carregando...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
