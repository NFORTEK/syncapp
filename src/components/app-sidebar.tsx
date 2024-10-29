import { Clapperboard, Film, Home, LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useRouter } from "next/navigation" // Importando useRouter para redirecionamento

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Filmes",
    url: "/syncMovies",
    icon: Clapperboard,
  },
  {
    title: "Séries",
    url: "/syncSeries",
    icon: Film,
  },
]

export function AppSidebar() {
  const router = useRouter() // Inicializando o router

  const handleLogout = () => {
    localStorage.removeItem("token") // Remove o token do localStorage
    router.push("/") // Redireciona para a página de login
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Image
              src="/logo.svg"
              alt=""
              width={120}
              height={100}
              className=""
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Separator className="my-4" />
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <a onClick={handleLogout}> {/* Modifica para usar o evento onClick */}
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
