"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Database, FileText, Settings, User, Home, LogOut, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardSidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      role: ["admin", "dokter", "resepsionis"],
    },
    {
      title: "Registrasi",
      href: "/dashboard/registrasi",
      icon: Users,
      role: ["admin", "resepsionis"],
    },
    {
      title: "Reservasi",
      href: "/dashboard/reservasi",
      icon: Calendar,
      role: ["admin", "resepsionis"],
    },
    {
      title: "EMR",
      href: "/dashboard/emr",
      icon: FileText,
      role: ["admin", "dokter"],
    },
    {
      title: "Data Master",
      href: "/dashboard/master",
      icon: Database,
      role: ["admin"],
    },
    {
      title: "Pengaturan",
      href: "/dashboard/pengaturan",
      icon: Settings,
      role: ["admin"],
    },
  ]

  // For demo purposes, we'll assume the user is an admin
  const userRole = "admin"

  const filteredRoutes = routes.filter((route) => route.role.includes(userRole))

  return (
    <>
      {/* Mobile sidebar */}
       <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col"> {/* Tambahkan flex flex-col */}
          <SheetHeader className="border-b px-6 py-4"> {/* Pindahkan header ke sini */}
            <SheetTitle>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => onOpenChange(false)}>
                <span className="text-xl">🦷</span>
                <span>Klinik Gigi</span>
              </Link>
            </SheetTitle>
            {/* Anda bisa menambahkan SheetDescription di sini jika perlu */}
          </SheetHeader>
          {/* Sisa konten MobileSidebar dipindahkan ke sini atau tetap di komponen terpisah yang dipanggil dari sini */}
          <ScrollArea className="flex-1 py-2">
            <nav className="grid gap-1 px-2">
              {filteredRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                    pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => onOpenChange(false)} // Tutup sheet saat link diklik
                >
                  <route.icon className="h-4 w-4" />
                  {route.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="border-t p-4 mt-auto"> {/* mt-auto untuk mendorong ke bawah */}
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <User className="h-4 w-4" />
              <div className="text-sm font-medium">Admin</div>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
     <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">🦷</span>
            <span>Klinik Gigi</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <User className="h-4 w-4" />
            <div className="text-sm font-medium">Admin</div>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

function MobileSidebar({ routes, pathname }: { routes: any[]; pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🦷</span>
          <span>Klinik Gigi</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <User className="h-4 w-4" />
          <div className="text-sm font-medium">Admin</div>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
