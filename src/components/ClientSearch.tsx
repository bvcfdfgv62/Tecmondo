import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Client } from '../types';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Loader2, Search, User, Phone, FileText } from 'lucide-react';

interface ClientSearchProps {
    onSelectClient: (client: Client) => void;
    onNewClient?: () => void;
}

export function ClientSearch({ onSelectClient, onNewClient }: ClientSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await supabaseService.searchClients(query);
                if (response.success && response.data) {
                    setResults(response.data);
                }
            } catch (error) {
                console.error('Error searching clients:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (client: Client) => {
        onSelectClient(client);
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar cliente (Nome, CPF/CNPJ ou Telefone)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    className="pl-8"
                />
                {loading && (
                    <div className="absolute right-2 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {showResults && (query.trim().length >= 2) && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {results.length > 0 ? (
                        results.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => handleSelect(client)}
                                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex flex-col gap-1"
                            >
                                <div className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    {client.name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    {client.whatsapp && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {client.whatsapp}
                                        </span>
                                    )}
                                    {client.cpfOrCnpj && (
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" /> {client.cpfOrCnpj}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <div className="p-4 text-center text-gray-500">
                                <p>Nenhum cliente encontrado.</p>
                                {onNewClient && (
                                    <button
                                        onClick={onNewClient}
                                        className="mt-2 text-sm text-blue-600 hover:underline font-medium"
                                    >
                                        + Cadastrar Novo Cliente
                                    </button>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
