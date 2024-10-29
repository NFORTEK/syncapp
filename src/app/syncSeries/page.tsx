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

export default function syncSeries() {
    const [url, setUrl] = useState("");  // Estado para o URL do input
    const [categories, setCategories] = useState<Category[]>([]); // Estado para armazenar as categorias
    const [bouquets, setBouquets] = useState<Bouquet[]>([]); // Estado para armazenar os bouquets
    const [error, setError] = useState<string | null>(null); // Estado para armazenar erros (string ou null)
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // Estado para as categorias selecionadas
    const [selectedBouquet, setSelectedBouquet] = useState<number | null>(null); // Estado para o bouquet selecionado
    const [loading, setLoading] = useState(false); // Estado para controle de loading
    const [syncSuccess, setSyncSuccess] = useState(false); // Estado para saber se a sincronização foi bem-sucedida

    const DownloadAndParse = async () => {
        setLoading(true); // Ativa o loading quando a requisição começa
        try {
            // Verifica se o URL foi fornecido
            if (!url) {
                setError("Por favor, insira o URL da fonte.");
                setLoading(false); // Desativa o loading
                return;
            }
    
            const type = 2; // 2 para séries
    
            // Recupera o token do localStorage
            const token = localStorage.getItem("token");
    
            // Verifica se o token está disponível
            if (!token) {
                setError("Token não encontrado. Faça login novamente.");
                setLoading(false); // Desativa o loading
                return;
            }
    
            // Construa a URL com os parâmetros de consulta (query params) sem codificar o `url`
            const requestUrl = `http://localhost:5000/v1/download-and-parse-m3u?m3uUrl=${url}&type=${type}`;
    
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
      
          const body = {
            selectedCategories,  // IDs das categorias selecionadas
            bouquetId: selectedBouquet,  // ID do bouquet selecionado
          };
      
          const response = await fetch('http://localhost:5000/v1/sync-m3u-series', {
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
            setError(data.message || 'Erro na sincronização.');
          }
        } catch (error) {
          console.error("Erro ao sincronizar com o servidor:", error);
          setError('Erro ao sincronizar com o servidor.');
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
                            Sincronize as séries
                        </CardTitle>
                        <CardDescription>
                            Insira o URL da fonte que deseja sincronizar ao servidor e clique em "Sincronizar"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="URL da fonte"
                            value={url} onChange={(e) => setUrl(e.target.value)} />
                        <Button className="mt-2" onClick={DownloadAndParse} disabled={loading}>
                            {loading ? "Sincronizando..." : "Sincronizar"}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Exibe as categorias e bouquets, se houver */}
            {(categories.length > 0 || bouquets.length > 0) && (
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
                                                        <p className="text-sm text-muted-foreground">{cat.count} séries</p>
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
            )}
        </div>
    );
}
