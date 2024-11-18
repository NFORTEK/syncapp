'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Database, Server, Calendar, GraduationCap, Copy } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line react/no-unescaped-entities

export default function Dashboard() {
  const [copied, setCopied] = useState(false)
  const [host, setHost] = useState(""); // Estado para o Host
  const [user, setUser] = useState(""); // Estado para o Usuário
  const [adminPassword, setAdminPassword] = useState(""); // Estado para a Senha do administrador

  // Estados para o plano
  const [timeLeft, setTimeLeft] = useState(0); // Dias restantes no plano
  const [expirationDate, setExpirationDate] = useState(""); // Data de expiração
  const [progress, setProgress] = useState(0); // Progresso de tempo restante

  // Estados para o banco de dados
  const [dbStatus, setDbStatus] = useState("Desconectado");
  const [lastConnection, setLastConnection] = useState("Nunca");
  const [retries, setRetries] = useState(0);

  // Função para copiar texto
  const copyToClipboard = () => {
    navigator.clipboard.writeText("mysql -u root -p")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyToClipboard2 = () => {
    navigator.clipboard.writeText("CREATE USER 'novo_usuario'@'%' IDENTIFIED BY 'senha_segura';")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyToClipboard3 = () => {
    navigator.clipboard.writeText("GRANT ALL PRIVILEGES ON *.* TO 'novo_usuario'@'%' WITH GRANT OPTION;")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyToClipboard4 = () => {
    navigator.clipboard.writeText("FLUSH PRIVILEGES;")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Função para buscar os dados do plano
  const fetchPlanData = async () => {
    try {
      const response = await fetch('https://api.blogsdf.uk/v1/getPlan', {
        method: 'GET',
        credentials: 'include', // Para enviar os cookies de autenticação
      });
      const data = await response.json();

      if (response.ok) {
        setTimeLeft(data.timeLeft);
        const currentDate = new Date();
        const expiration = new Date(currentDate.getTime() + data.timeLeft * 24 * 60 * 60 * 1000);
        setExpirationDate(expiration.toLocaleDateString());
        setProgress((data.timeLeft / 90) * 100); // Supondo um plano de 90 dias
      } else {
        console.error("Erro ao buscar dados do plano:", data.message);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do plano:", error);
    }
  }

  // Função para buscar as conexões de banco de dados do usuário
  const fetchUserConnections = async () => {
    try {
      const response = await fetch('https://api.blogsdf.uk/v1/user-connections', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
  
      if (response.ok && data.connections.length > 0) {
        const latestConnection = data.connections[0];
  
        // Convertendo o formato da data corretamente
        const latestConnectionDate = new Date(latestConnection.createdAt);
        const formattedDate = latestConnectionDate.toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo", // Ajuste o fuso horário conforme necessário
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
  
        setDbStatus("Ativo");
        setLastConnection(formattedDate);
        setRetries(0);
      } else {
        setDbStatus("Desconectado");
        setRetries(3); // Exemplo de tentativas de reconexão sem sucesso
      }
    } catch (error) {
      console.error("Erro ao buscar conexões do banco de dados:", error);
      setDbStatus("Erro");
    }
  }
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUserConnections();
    }, 9000);

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []); // O array vazio [] garante que o efeito seja executado uma vez ao montar o componente


  // Função para salvar as credenciais do administrador
  const saveAdminCredentials = async () => {
    try {
      const response = await fetch('https://api.blogsdf.uk/v1/save-credentials', {
        method: 'POST',
        credentials: 'include', // Para enviar os cookies de autenticação
        headers: {
          'Content-Type': 'application/json',
        },
        // Aqui ajustamos o nome das propriedades para corresponder ao esperado pelo backend
        body: JSON.stringify({
          host,
          usuario: user, // Mapeia `user` para a chave `usuario`
          senha: adminPassword // Mapeia `adminPassword` para a chave `senha`
        }),
      });
      const data = await response.json();
  
      if (response.ok) {
        console.log("Credenciais do administrador salvas com sucesso:", data);
      } else {
        console.error("Erro ao salvar credenciais do administrador:", data.message);
      }
    } catch (error) {
      console.error("Erro ao salvar credenciais do administrador:", error);
    }
  }
  

  // Chama as funções ao carregar o componente
  useEffect(() => {
    fetchPlanData();
    fetchUserConnections();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 w-full">
        {/* Informações sobre o servidor de sincronização */}
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizador</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <CardDescription>Status</CardDescription>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="mt-3">
              <CardDescription>Última versão</CardDescription>
              <div className="text-2xl font-bold">v1.0</div>
            </div>

          </CardContent>
        </Card>

        {/* Informações sobre o servidor de banco de dados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <CardDescription>Status</CardDescription>
              <Badge variant={dbStatus === "Ativo" ? "default" : "destructive"}>{dbStatus}</Badge>
            </div>
            <div className="mt-3">
              <CardDescription>Última conexão</CardDescription>
              <div className="text-2xl font-bold">{lastConnection}</div>
            </div>
            <div className="mt-3">
              <CardDescription>Tentativas de reconexão</CardDescription>
              <div className="text-sm text-muted-foreground">{retries} de 5</div>
            </div>
          </CardContent>
        </Card>

        {/* Tempo de licença restante e data de expiração */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <CardDescription>Status</CardDescription>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="mt-3">
              <CardDescription>Tempo restante</CardDescription>
              <div className="text-2xl font-bold">{timeLeft} dias</div>
              {/* Animação no progresso */}
              <Progress value={progress} max={100} className="mt-2 transition-all duration-700" />
            </div>
            <div className="mt-3">
              <CardDescription>Data de expiração</CardDescription>
              <div className="text-sm text-muted-foreground">{expirationDate}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de duas colunas para os dois cards */}
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
        {/* Card de Criar usuário banco de dados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">Criar usuário banco de dados</CardTitle>
            <GraduationCap className="h-6 w-6 text-[#A7E92F]" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-slate-500">Siga estes passos para criar um novo usuário no seu banco de dados:</p>
            <p className="">1. Acesse sua máquina do XUI.ONE ou XTREME UI via terminal.</p>
            <div>
              <p>2. Execute o seguinte comando SQL:</p>
              <div className="mt-2 flex items-center space-x-2">
                <code className="flex-1 bg-slate-950 text-slate-50 p-2 rounded-md font-mono text-sm">
                  mysql -u root -p
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              {copied && <p className="text-sm text-green-500 mt-1">Copied to clipboard!</p>}
            </div>
            <div>
              <p>3. Agora execute esse para criar o usuario e senha:</p>
              <div className="mt-2 flex items-center space-x-2">
                <code className="flex-1 bg-slate-950 text-slate-50 p-2 rounded-md font-mono text-sm">
                CREATE USER 'novo_usuario'@'%' IDENTIFIED BY 'senha_segura';
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard2}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              {copied && <p className="text-sm text-green-500 mt-1">Copied to clipboard!</p>}
            </div>
            <div>
              <p>4. Em seguida, conceda privilégios ao usuário:</p>
              <div className="mt-2 flex items-center space-x-2">
                <code className="flex-1 bg-slate-950 text-slate-50 p-2 rounded-md font-mono text-sm">
                GRANT ALL PRIVILEGES ON *.* TO 'novo_usuario'@'%';
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard3}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              {copied && <p className="text-sm text-green-500 mt-1">Copied to clipboard!</p>}
            </div>
            <div>
              <p>5. Por fim, aplique as mudanças:</p>
              <div className="mt-2 flex items-center space-x-2">
                <code className="flex-1 bg-slate-950 text-slate-50 p-2 rounded-md font-mono text-sm">
                FLUSH PRIVILEGES;
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard4}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
              {copied && <p className="text-sm text-green-500 mt-1">Copied to clipboard!</p>}
            </div>
          </CardContent>
        </Card>

        {/* Card de Configurar banco de dados */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">Configurar banco de dados</CardTitle>
            <Database className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-slate-500">Após criar o usuário com privilégios no seu banco, informe os dados abaixo:</p>

            {/* Input para o Host */}
            <Input
              type="text"
              placeholder="Host"
              className="mb-2"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
            {/* Input para o Usuário */}
            <Input
              type="text"
              placeholder="Usuário"
              className="mb-2"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            {/* Input para a Senha do Administrador */}
            <Input
              type="password"
              placeholder="Senha de administrador"
              className="mb-2"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <Button variant="outline" onClick={saveAdminCredentials}>Sincronizar banco de dados</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
