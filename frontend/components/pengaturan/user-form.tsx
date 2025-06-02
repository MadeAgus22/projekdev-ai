"use client"

import React, { useState, useEffect } from "react" // Hanya import yang dibutuhkan
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast" // Import useToast jika ingin menampilkan toast dari form ini

// Tipe untuk data yang diterima dan dikirim oleh form ini
// Sesuaikan dengan field yang benar-benar ada di form dan dibutuhkan oleh backend
export interface UserFormData {
  id?: number | string; // Opsional, ada saat edit
  nama: string; // Di `initialData` dari page.tsx adalah `namaLengkap`
  username: string;
  email: string;
  role: "admin" | "dokter" | "resepsionis";
  password?: string; // Opsional, terutama saat edit
  confirmPassword?: string; // Hanya untuk validasi di form ini
  status: "aktif" | "nonaktif";
  phoneNumber?: string; // Tambahkan jika ada di form
}

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<UserFormData>; // Buat initialData opsional dan partial
  onSubmit: (data: UserFormData) => void; // onSubmit menerima UserFormData
  isLoading?: boolean; // Opsional: untuk men-disable form saat parent sedang loading
}

// PASTIKAN INI ADALAH NAMED EXPORT
export function UserForm({ open, onOpenChange, initialData, onSubmit, isLoading }: UserFormProps) {
  const { toast } = useToast(); // Untuk pesan error validasi password jika diperlukan
  const [formData, setFormData] = useState<UserFormData>({
    nama: "",
    username: "",
    email: "",
    role: "resepsionis",
    password: "",
    confirmPassword: "",
    status: "aktif",
    phoneNumber: "",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          nama: initialData.nama || "",
          username: initialData.username || "",
          email: initialData.email || "",
          role: initialData.role || "resepsionis",
          password: "", // Selalu kosongkan password untuk edit
          confirmPassword: "",
          status: initialData.status || "aktif",
          phoneNumber: initialData.phoneNumber || "",
        });
      } else {
        // Reset form untuk mode tambah pengguna baru
        setFormData({
          nama: "",
          username: "",
          email: "",
          role: "resepsionis",
          password: "",
          confirmPassword: "",
          status: "aktif",
          phoneNumber: "",
        });
      }
    }
  }, [open, initialData]); // Re-initialize form saat dialog dibuka atau initialData berubah

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password || initialData == null) { // Validasi password jika diisi ATAU jika ini form tambah baru
        if (formData.password !== formData.confirmPassword) {
            toast({ // Gunakan toast untuk error, bukan alert
                title: "Password Tidak Cocok",
                description: "Password dan konfirmasi password harus sama.",
                variant: "destructive",
            });
            return;
        }
        // Validasi panjang minimal password jika diperlukan
        if (formData.password && formData.password.length < 6 && !initialData) { // Hanya untuk tambah baru, atau jika password diisi saat edit
            toast({
                title: "Password Terlalu Pendek",
                description: "Password minimal harus 6 karakter.",
                variant: "destructive",
            });
            return;
        }
    }
    
    // Buat objek data yang akan dikirim, tanpa confirmPassword
    const dataToSubmit: UserFormData = { ...formData };
    delete dataToSubmit.confirmPassword; // Hapus confirmPassword sebelum submit

    // Jika mode edit dan password tidak diisi, jangan kirim field password
    if (initialData && !formData.password) {
        delete dataToSubmit.password;
    }

    onSubmit(dataToSubmit);
    // onOpenChange(false); // Pindahkan ini ke parent setelah onSubmit (API call) selesai
  };

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "dokter", label: "Dokter Gigi" },
    { value: "resepsionis", label: "Resepsionis" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData?.id ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
            <DialogDescription>
              {initialData?.id ? "Edit data pengguna yang sudah ada." : "Tambahkan pengguna baru ke sistem."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2"> {/* Tambahkan max-height dan overflow */}
            <div className="space-y-2">
              <Label htmlFor="user-form-nama">Nama Lengkap</Label>
              <Input id="user-form-nama" value={formData.nama} onChange={(e) => handleChange("nama", e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-form-username">Username</Label>
                <Input
                  id="user-form-username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-form-email">Email</Label>
                <Input
                  id="user-form-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="user-form-phoneNumber">Nomor Telepon</Label>
              <Input 
                id="user-form-phoneNumber" 
                type="tel"
                value={formData.phoneNumber || ""} 
                onChange={(e) => handleChange("phoneNumber", e.target.value)} 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-form-role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value as UserFormData["role"])} disabled={isLoading}>
                <SelectTrigger id="user-form-role">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-form-password">Password</Label>
                <Input
                  id="user-form-password"
                  type="password"
                  placeholder={initialData?.id ? "Kosongkan jika tidak ingin ganti" : "Minimal 6 karakter"}
                  value={formData.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required={!initialData?.id} // Wajib untuk tambah baru
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-form-confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="user-form-confirmPassword"
                  type="password"
                  placeholder={initialData?.id ? "Kosongkan jika tidak ingin ganti" : "Ulangi password"}
                  value={formData.confirmPassword || ""}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required={!initialData?.id || !!formData.password} // Wajib jika password diisi atau tambah baru
                  disabled={isLoading}
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="user-form-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value as UserFormData["status"])} disabled={isLoading}>
                <SelectTrigger id="user-form-status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
