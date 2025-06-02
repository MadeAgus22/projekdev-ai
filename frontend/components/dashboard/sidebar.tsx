"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    Users, Database, FileText, Settings, User, Home, LogOut, Calendar, CreditCard, ListChecks 
} from "lucide-react" // Tambahkan ikon yang relevan
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import React, { useEffect, useState } from "react" // Tambahkan useEffect, useState
import { authService } from "@/services/api" // Untuk mengambil data user saat ini

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Definisikan tipe untuk route dengan tambahan permission
interface AppRoute {
  title: string;
  href: string;
  icon: React.ElementType;
  role?: string[]; // Role lama, bisa dipertimbangkan untuk dihapus jika permission sudah lengkap
  requiredPermission?: string; // Kode permission yang dibutuhkan untuk mengakses route ini
}

const ALL_APP_ROUTES: AppRoute[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    requiredPermission: "dashboard:view",
  },
  {
    title: "Registrasi Pasien",
    href: "/dashboard/registrasi",
    icon: Users,
    requiredPermission: "patient:view", // Atau kombinasi: patient:create, patient:update
  },
  {
    title: "Reservasi & Antrian", // Menggabungkan Reservasi dan Antrian ke satu menu
    href: "/dashboard/reservasi", // Arahkan ke halaman reservasi yang sudah ada
    icon: Calendar,
    requiredPermission: "reservation:view_all", // Atau "reservation:view_doctor_specific"
  },
  {
    title: "EMR",
    href: "/dashboard/emr",
    icon: FileText,
    requiredPermission: "emr:view",
  },
  {
    title: "Billing & Pembayaran",
    href: "/dashboard/billing",
    icon: CreditCard,
    requiredPermission: "billing:view",
  },
  {
    title: "Master Data",
    href: "/dashboard/master",
    icon: Database,
    requiredPermission: "master:view_treatments", // Atau permission yang lebih umum untuk master
  },
  {
    title: "Pengaturan",
    href: "/dashboard/pengaturan",
    icon: Settings,
    requiredPermission: "settings:view_users", // Atau settings:view_roles
  },
  // Contoh menu yang mungkin hanya untuk dokter
  // {
  //   title: "Jadwal Saya",
  //   href: "/dashboard/jadwal-dokter",
  //   icon: ListChecks,
  //   requiredPermission: "reservation:view_doctor_specific",
  // },
];

export function DashboardSidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<{
    namaLengkap?: string;
    username?: string;
    role?: string;
    permissions?: string[];
  } | null>(null);
  const [filteredRoutes, setFilteredRoutes] = useState<AppRoute[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Cek token dulu, jika tidak ada, jangan fetch
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Redirect ke login atau handle sesuai kebutuhan
            console.warn("Sidebar: Tidak ada token, user belum login.");
            // Anda mungkin ingin menambahkan redirect ke halaman login di sini
            // import { useRouter } from "next/navigation"; const router = useRouter(); router.push("/login");
            return;
        }

        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setCurrentUser({
            namaLengkap: response.data.namaLengkap,
            username: response.data.username,
            role: response.data.role,
            permissions: response.data.permissions || [], // Ambil permissions
          });
        } else {
          console.error("Sidebar: Gagal mengambil data user:", response.message);
          // Handle error, mungkin logout user
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          localStorage.removeItem('userFullName');
          localStorage.removeItem('userPermissions');
          // redirect to login
        }
      } catch (error) {
        console.error("Sidebar: Error fetching current user:", error);
        // Handle error, mungkin logout user
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser?.permissions) {
      const newFilteredRoutes = ALL_APP_ROUTES.filter(route => {
        if (!route.requiredPermission) return true; // Jika tidak butuh permission, tampilkan
        return currentUser.permissions?.includes(route.requiredPermission);
      });
      setFilteredRoutes(newFilteredRoutes);
      
      // Simpan user permissions ke localStorage untuk akses cepat di tempat lain jika perlu
      localStorage.setItem('userPermissions', JSON.stringify(currentUser.permissions));
    } else if (currentUser && !currentUser.permissions) {
      // Jika API /me belum mengembalikan permissions, fallback ke role based jika ada
      // ATAU tampilkan menu minimal / tidak ada menu sama sekali (lebih aman)
      // Untuk sekarang, kita anggap jika permissions tidak ada, menu juga terbatas/kosong
      // kecuali yang tidak butuh permission.
       const newFilteredRoutes = ALL_APP_ROUTES.filter(route => !route.requiredPermission);
       setFilteredRoutes(newFilteredRoutes);
       localStorage.removeItem('userPermissions');
    }

  }, [currentUser]);
  
  // Ambil nama dan role dari localStorage sebagai fallback atau tampilan awal
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userFullName') || currentUser?.namaLengkap || "Pengguna" : "Pengguna";
  const userRoleDisplay = typeof window !== 'undefined' ? localStorage.getItem('userRole') || currentUser?.role || "" : "";


  const SidebarContentComp = ({onLinkClick} : {onLinkClick?: () => void}) => (
     <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
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
                onClick={onLinkClick}
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
            <div className="text-sm">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">{userRoleDisplay.charAt(0).toUpperCase() + userRoleDisplay.slice(1)}</div>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => {
                localStorage.clear(); // Hapus semua data local storage
                window.location.href = '/login'; // Redirect ke login
                if(onLinkClick) onLinkClick();
            }}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
       <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SidebarContentComp onLinkClick={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
     <div className="hidden border-r bg-background md:block md:w-64">
        <SidebarContentComp />
    </div>
    </>
  )
}