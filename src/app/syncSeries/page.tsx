'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

interface Category {
  id: number;
  category: string;
  count: number;
}

interface Bouquet {
  id: number;
  bouquet_name: string;
}

const fetchWithTimeout = (url: string, options: RequestInit, timeout = 7200000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    ),
  ]);
};



export default function SyncSeries() {
  const [syncStartTime, setSyncStartTime] = useState<number | null>(null);
  const [showLongSyncMessage, setShowLongSyncMessage] = useState(false);
  const [provider, setProvider] = useState("");  // Estado para o provedor
  const [username, setUsername] = useState("");  // Estado para o username
  const [password, setPassword] = useState("");  // Estado para a senha
  const [categories, setCategories] = useState<Category[]>([]);
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBouquets, setSelectedBouquets] = useState<number[]>([]);  // Array de bouquets selecionados
  const [loading, setLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && syncStartTime) {
      timer = setTimeout(() => {
        const elapsedTime = Date.now() - syncStartTime;
        if (elapsedTime >= 300000) { // 5 minutos
          setShowLongSyncMessage(true);
        }
      }, 300000); // Verifica após 5 minutos
    }
    return () => clearTimeout(timer);
  }, [loading, syncStartTime]);

  const DownloadAndParse = async () => {
    setLoading(true);  // Ativa o carregamento
    try {
      if (!provider || !username || !password) {
        setError("Por favor, insira o provedor, username e password.");
        setLoading(false);
        return;
      }

      const type = 'm3u_plus'; // Tipo fixo
      const output = 'ts'; // Output fixo
      const m3uUrl = `http://${provider}/get.php?username=${username}&password=${password}&type=${type}&output=${output}`;

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      console.log(`URL da requisição: ${m3uUrl}`);
      const requestUrl = `https://api.blogsdf.uk/v1/download-and-parse-m3u?m3uUrl=${encodeURIComponent(m3uUrl)}&type=2`;

      const response = await fetch(requestUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.erro || "Erro ao processar o arquivo M3U.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setBouquets(data.bouquets || []);
      setError(null);
    } catch (error) {
      console.error("Erro ao fazer download e parsing do M3U:", error);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((catId) => catId !== id)
        : [...prevSelected, id]
    );
  };

  const toggleBouquet = (id: number) => {
    setSelectedBouquets((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((bqId) => bqId !== id)
        : [...prevSelected, id]
    );
  };


  const syncWithServer = async () => {
    setLoading(true);
    setShowLongSyncMessage(false);
    setSyncStartTime(Date.now());
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      const body = {
        selectedCategories,
        bouquetIds: selectedBouquets.length === 1 ? [selectedBouquets[0]] : selectedBouquets,
      };

      const response = await fetch('https://api.blogsdf.uk/v1/sync-m3u-series', {
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
        setSyncSuccess(true);
      } else {
        console.error("Erro na sincronização:", data.message);
        setError(data.message || 'Erro na sincronização.');
      }
    } catch (error: any) {
      console.error("Erro ao sincronizar com o servidor:", error.message || error);
      setError('Erro ao sincronizar com o servidor.');
    } finally {
      setLoading(false);
      setSyncStartTime(null);
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
              className="mt-2"
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <Input 
              className="mt-2"
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Button className="mt-2" onClick={DownloadAndParse} disabled={loading}>
              {loading ? "Sincronizando..." : "Sincronizar"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {showLongSyncMessage && (
        <div className="w-full mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Sincronização em Andamento
              </CardTitle>
              <CardDescription>
                A sincronização está demorando mais do que o esperado. Os arquivos continuarão sendo inseridos em segundo plano e todos estarão disponíveis em até 30 minutos.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

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
                }, 0)} séries enviadas com sucesso.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
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
                              <p className="text-sm text-muted-foreground">{cat.count} episodios</p>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold">Bouquets:</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bouquets.map((bq) => (
                      <Card key={bq.id}>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={selectedBouquets.includes(bq.id)}
                              onCheckedChange={() => toggleBouquet(bq.id)}
                            />
                            <strong>{bq.bouquet_name}</strong>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Button onClick={syncWithServer} disabled={loading || selectedCategories.length === 0 || selectedBouquets.length === 0}>
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
