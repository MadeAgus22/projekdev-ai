"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/api"; // Pastikan ini sudah ada dan benar

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("admin")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Frontend: Attempting login with:", { username, password, role }); // Untuk debugging

    try {
      const response = await authService.login({ username, password, role });
      console.log("Frontend: Response from backend:", response); // Untuk debugging

      if (response.success && response.data?.token) {
        // Simpan token (misalnya di localStorage atau context)
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRole', response.data.role); // Ambil role dari respons token
        localStorage.setItem('userName', response.data.username);
        localStorage.setItem('userFullName', response.data.namaLengkap);


        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${response.data.namaLengkap || response.data.username}!`,
        });
        router.push("/dashboard");
      } else {
        // Jika backend mengembalikan success: false atau tidak ada token
        toast({
          title: "Login Gagal",
          description: response.message || "Username, password, atau peran tidak sesuai.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Frontend: Login error:", error); // Log error detail
      toast({
        title: "Login Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan koneksi atau internal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="inline-block text-4xl mb-2">🦷</div>
          <CardTitle className="text-2xl">Sistem Klinik Gigi</CardTitle>
          <CardDescription>
            Masukkan username dan password untuk login.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Login Sebagai</Label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih peran Anda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="dokter">Dokter Gigi</SelectItem>
                  <SelectItem value="resepsionis">Resepsionis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Login"}
            </Button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Lupa password? Hubungi administrator sistem.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}