'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Importando o Checkbox
import { useState } from "react";

// Definir a interface para as categorias e bouquets
interface Category {
  id: number;
  category: string;
  count: number;
}

interface Bouquet {
  id: number;
  bouquet_name: string;  // Ajuste aqui para refletir o retorno do backend
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line react/no-unescaped-entities

export default function SyncMovies() {
    const [provider, setProvider] = useState("");  // Estado para o provedor
    const [username, setUsername] = useState("");  // Estado para o username
    const [password, setPassword] = useState("");  // Estado para a password
    const [categories, setCategories] = useState<Category[]>([]); // Estado para armazenar as categorias
    const [bouquets, setBouquets] = useState<Bouquet[]>([]); // Estado para armazenar os bouquets
    const [error, setError] = useState<string | null>(null); // Estado para armazenar erros (string ou null)
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // Estado para as categorias selecionadas
    const [selectedBouquet, setSelectedBouquet] = useState<number | null>(null); // Estado para o bouquet selecionado
    const [loading, setLoading] = useState(false); // Estado para controle de loading
    const [syncSuccess, setSyncSuccess] = useState(false); // Estado para saber se o sync foi bem-sucedido

    const DownloadAndParse = async () => {
        setLoading(true); // Ativa o loading quando a requisição começa
        try {
            // Verifica se o provedor, username e password foram fornecidos
            if (!provider || !username || !password) {
                setError("Por favor, insira o provedor, username e password.");
                setLoading(false); // Desativa o loading
                return;
            }
    
            const type = 'm3u_plus'; // Tipo fixo
            const output = 'ts'; // Output fixo

            // Construa a URL com os parâmetros necessários
            const m3uUrl = `http://${provider}/get.php?username=${username}&password=${password}&type=${type}&output=${output}`;
    
            // Recupera o token do localStorage
            const token = localStorage.getItem("token");
    
            // Verifica se o token está disponível
            if (!token) {
                setError("Token não encontrado. Faça login novamente.");
                setLoading(false); // Desativa o loading
                return;
            }
    
            // Construa a URL para a requisição ao backend
            const requestUrl = `https://api.ecosentry.cloud/v1/download-and-parse-m3u?m3uUrl=${encodeURIComponent(m3uUrl)}&type=1`;
    
            // Faça a requisição ao backend
            const response = await fetch(requestUrl, {
                method: 'GET',
                credentials: 'include', // Envia cookies de autenticação, se necessário
                headers: {
                    'Authorization': `Bearer ${token}`, // Adiciona o token ao cabeçalho Authorization
                    'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
                },
            });
    
            // Aguarda a resposta da API
            const data = await response.json();
    
            if (response.ok) {
                // Se a resposta for bem-sucedida, atualiza os estados de categorias e bouquets
                setCategories(data.categories || []);
                setBouquets(data.bouquets || []);
                setError(null); // Limpa qualquer erro anterior
            } else {
                // Se houver erro, mostre a mensagem de erro
                setError(data.erro || "Erro ao processar o arquivo M3U.");
            }
        } catch (error) {
            console.error("Erro ao fazer download e parsing do M3U:", error);
            setError("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false); // Desativa o loading após a requisição
        }
    };

    // Função para alternar a seleção das categorias
    const toggleCategory = (id: number) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((catId) => catId !== id) // Desmarca a categoria
                : [...prevSelected, id] // Marca a categoria
        );
    };

    // Função para alternar a seleção dos bouquets
    const selectBouquet = (id: number) => {
        setSelectedBouquet(id); // Define o bouquet selecionado
    };

    // Função para enviar as categorias e o bouquet selecionados
    const syncWithServer = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Token não encontrado. Faça login novamente.");
                setLoading(false);
                return;
            }

            // Construa o corpo da requisição
            const body = {
                selectedCategories,
                bouquetId: selectedBouquet,
            };

            const response = await fetch('https://api.ecosentry.cloud/v1/sync-m3u', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                setSyncSuccess(true); // Atualiza o estado para indicar sucesso
            } else {
                console.error("Erro na sincronização:", data.message);
            }
        } catch (error) {
            console.error("Erro ao sincronizar com o servidor:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="w-full mt-2">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Sincronize os filmes
                        </CardTitle>
                        <CardDescription>
                            Insira os detalhes abaixo e clique em "Sincronizar"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input 
                            placeholder="Provedor" 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)} 
                        />
                        <Input 
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                        <Input 
                            placeholder="Password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <Button className="mt-2" onClick={DownloadAndParse} disabled={loading}>
                            {loading ? "Sincronizando..." : "Sincronizar"}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Exibe mensagem de sucesso e contagem de filmes enviados */}
            {syncSuccess ? (
                <div className="w-full mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Sucesso na Sincronização!
                            </CardTitle>
                            <CardDescription>
                                {selectedCategories.length} categorias e {selectedCategories.reduce((acc, catId) => {
                                    const category = categories.find(cat => cat.id === catId);
                                    return acc + (category ? category.count : 0);
                                }, 0)} filmes enviados com sucesso.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            ) : (
                // Exibe as categorias e bouquets, se houver
                (categories.length > 0 || bouquets.length > 0) && (
                    <div className="w-full mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Resultados da Sincronização
                                </CardTitle>
                                <CardDescription>
                                    Categorias e bouquets encontrados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Exibe as categorias */}
                                <div>
                                    <h3 className="font-bold">Categorias:</h3>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {categories.map((cat) => (
                                            <Card key={cat.id}>
                                                <CardHeader>
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={selectedCategories.includes(cat.id)}
                                                            onCheckedChange={() => toggleCategory(cat.id)}
                                                        />
                                                        <div>
                                                            <strong>{cat.category}</strong>
                                                            <p className="text-sm text-muted-foreground">{cat.count} filmes</p>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Exibe os bouquets */}
                                <div className="mt-4">
                                    <h3 className="font-bold">Bouquets:</h3>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {bouquets.map((bq) => (
                                            <Card key={bq.id}>
                                                <CardHeader>
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            checked={selectedBouquet === bq.id}
                                                            onCheckedChange={() => selectBouquet(bq.id)}
                                                        />
                                                        <strong>{bq.bouquet_name}</strong>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Botão Sincronizar com o Servidor */}
                                <div className="mt-4">
                                    <Button onClick={syncWithServer} disabled={loading || selectedCategories.length === 0 || selectedBouquet === null}>
                                        {loading ? "Sincronizando..." : "Sincronizar com Servidor"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            )}
        </div>
    );
}
