'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
  id: number;
  category: string;
  count: number;
}

interface Bouquet {
  id: number;
  bouquet_name: string;
}

export default function SyncSeries() {
  const [provider, setProvider] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBouquets, setSelectedBouquets] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const DownloadAndParse = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!provider || !username || !password) {
        setError("Por favor, insira o provedor, username e password.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/m3u", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          username,
          password,
          type: "m3u_plus",
          output: "ts",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Erro no processamento:", data);
        setError(data.message || "Erro ao processar o arquivo M3U.");
        return;
      }

      setCategories(data.categories || []);
      setBouquets(data.bouquets || []);
      setError(null);
    } catch (err) {
      console.error("❗ Erro ao conectar com o servidor:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cat => cat !== id) : [...prev, id]
    );
  };

  const toggleBouquet = (id: number) => {
    setSelectedBouquets(prev =>
      prev.includes(id) ? prev.filter(bq => bq !== id) : [...prev, id]
    );
  };

  const syncWithServer = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/sync-series', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCategories,
          bouquetIds: selectedBouquets,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncSuccess(true);
        setError(null);
      } else {
        setError(data.message || 'Erro na sincronização.');
      }
    } catch (error) {
      console.error("❗ Erro ao sincronizar:", error);
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
            <CardTitle>Sincronize as séries</CardTitle>
            <CardDescription>Insira os detalhes abaixo e clique em "Sincronizar"</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Provedor" value={provider} onChange={(e) => setProvider(e.target.value)} />
            <Input className="mt-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input className="mt-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button className="mt-2" onClick={DownloadAndParse} disabled={loading}>
              {loading ? "Sincronizando..." : "Sincronizar"}
            </Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>

      {syncSuccess ? (
        <div className="w-full mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sucesso na Sincronização!</CardTitle>
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
                <CardTitle>Resultados da Sincronização</CardTitle>
                <CardDescription>Categorias e bouquets encontrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-bold">Categorias:</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat) => (
                      <Card key={cat.id}>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <Checkbox checked={selectedCategories.includes(cat.id)} onCheckedChange={() => toggleCategory(cat.id)} />
                            <div>
                              <strong>{cat.category}</strong>
                              <p className="text-sm text-muted-foreground">{cat.count} episódios</p>
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
                            <Checkbox checked={selectedBouquets.includes(bq.id)} onCheckedChange={() => toggleBouquet(bq.id)} />
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
