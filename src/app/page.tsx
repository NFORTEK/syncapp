'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("https://api.blogsdf.uk/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname, password }),
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Login failed");
      }
  
      const data = await response.json();
      // Armazena o token JWT no localStorage, caso seja retornado
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("Token stored:", data.token); // Exibe o token no console
        router.push("/dashboard");
      } else {
        throw new Error("Token not found in response");
      }
    } catch (error) {
      console.error("Error:", error);
      setShowAlert(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <Image
        src="/logo.svg"
        alt="Vercel Logo"
        width={320}
        height={16}
        className="mb-5"
      />
      
      <Input
        type="text"
        placeholder="Usuário de acesso"
        className="w-72 mb-2"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Senha"
        className="w-72 mb-5"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button className="w-16" onClick={handleLogin}>
        Acessar
      </Button>
      
      {showAlert && (
        <div className="absolute top-4 right-4">
          <Alert className="border-red-500">
            <AlertTitle className="font-bold">Opps! Temos um problema!</AlertTitle>
            <AlertDescription>O seu login falhou. Verifique seu usuário e senha.</AlertDescription>
          </Alert>
        </div>
      )}

      <footer className="absolute bottom-0 right-0 p-4 text-[12px] text-slate-500">
        Todos direitos reservados a SyncBox &copy; 2024
      </footer>
    </div>
  );
}


// P2FMPRCyWDtbzFhG