"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserForm, type UserFormData } from "@/components/pengaturan/user-form" // Import UserForm dan UserFormData
import { DeleteConfirmation } from "@/components/ui/delete-confirmation"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/services/api"

import type { UserResponseDTO, CreateUserRequestDTO, } from '@/types/dto';

interface User {
  id: number | string;
  namaLengkap: string;
  username: string;
  email: string;
  role: "admin" | "dokter" | "resepsionis";
  status: "aktif" | "nonaktif";
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Role {
  id: string | number;
  nama: string;
  kode: "admin" | "dokter" | "resepsionis" | string;
  deskripsi: string;
}

interface Permission {
  id: string | number;
  kode: string;
  nama: string;
  deskripsi: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

const DUMMY_ROLES_DATA: Role[] = [
  { id: "1", nama: "Administrator", kode: "admin", deskripsi: "Akses penuh ke seluruh sistem" },
  { id: "2", nama: "Dokter Gigi", kode: "dokter", deskripsi: "Akses ke rekam medis" },
  { id: "3", nama: "Resepsionis", kode: "resepsionis", deskripsi: "Akses ke pendaftaran" },
];

const DUMMY_PERMISSIONS_DATA: Permission[] = [
  { id: "1", kode: "dashboard_view", nama: "Lihat Dashboard", deskripsi: "Akses ke halaman dashboard" },
  { id: "2", kode: "patient_manage", nama: "Kelola Pasien", deskripsi: "CRUD data pasien" },
  { id: "3", kode: "emr_manage", nama: "Kelola EMR", deskripsi: "CRUD data EMR" },
  { id: "4", kode: "user_manage", nama: "Kelola Pengguna", deskripsi: "CRUD data pengguna" },
];

const DUMMY_ROLE_PERMISSIONS_DATA: Record<string, string[]> = {
  admin: ["dashboard_view", "patient_manage", "emr_manage", "user_manage"],
  dokter: ["dashboard_view", "emr_manage"],
  resepsionis: ["dashboard_view", "patient_manage"],
};

export default function PengaturanPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>(DUMMY_ROLES_DATA)
  const [permissions, setPermissions] = useState<Permission[]>(DUMMY_PERMISSIONS_DATA)
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(DUMMY_ROLE_PERMISSIONS_DATA);

  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pengguna")
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false)
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false)
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false)
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState<{nama: string; kode: Role["kode"]; deskripsi: string}>({ nama: "", kode: "resepsionis", deskripsi: "" });
  const [currentRolePermissions, setCurrentRolePermissions] = useState<string[]>([]);

  const { toast } = useToast()

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const response = await userService.getAll(page, itemsPerPage, search);
      if (response.success && Array.isArray(response.data)) {
        const fetchedUsers: User[] = response.data.map((userFromApi: any): User => ({
            id: userFromApi.id,
            namaLengkap: userFromApi.namaLengkap || userFromApi.nama,
            username: userFromApi.username,
            email: userFromApi.email,
            role: userFromApi.role,
            status: userFromApi.status,
            phoneNumber: userFromApi.phoneNumber,
            createdAt: userFromApi.createdAt,
            updatedAt: userFromApi.updatedAt,
        }));
        setUsers(fetchedUsers);
        if (response.pagination) {
            setPagination(response.pagination);
        } else {
             setPagination({
                currentPage: page,
                totalPages: Math.ceil((fetchedUsers.length || 0) / itemsPerPage) || 1,
                totalRecords: fetchedUsers.length || 0,
                pageSize: itemsPerPage,
            });
        }
      } else {
        setUsers([]);
        setPagination(null);
        // Tidak perlu toast jika data kosong, UI akan menampilkannya
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Gagal Memuat Pengguna",
        description: error instanceof Error ? error.message : "Terjadi kesalahan server.",
        variant: "destructive",
      });
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast, itemsPerPage]);

  useEffect(() => {
    if (activeTab === "pengguna") {
      fetchUsers(currentPage, searchTerm);
    }
  }, [activeTab, fetchUsers, currentPage, searchTerm]);

  const handleAddUserSubmit = async (formDataFromUserForm: UserFormData) => {
    setIsLoading(true);
    try {
      const payload = { // Pastikan ini sesuai dengan dto.CreateUserRequest
        namaLengkap: formDataFromUserForm.nama, // Pastikan UserFormData punya 'nama' bukan 'namaLengkap' jika UserForm mengirim 'nama'
        username: formDataFromUserForm.username,
        email: formDataFromUserForm.email,
        password: formDataFromUserForm.password,
        role: formDataFromUserForm.role,
        status: formDataFromUserForm.status,
        phoneNumber: formDataFromUserForm.phoneNumber,
      };

      const response = await userService.create(payload);
      if (response.success && response.data) {
        toast({ title: "Sukses", description: `Pengguna ${response.data.namaLengkap} berhasil ditambahkan.` });
        fetchUsers(1, "");
        setCurrentPage(1);
        setSearchTerm("");
        setIsAddUserModalOpen(false);
      } else {
        toast({ title: "Gagal Menambah Pengguna", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({ title: "Error Saat Menambah Pengguna", description: error instanceof Error ? error.message : "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUserSubmit = async (formDataFromUserForm: UserFormData) => {
    if (!selectedUser || !formDataFromUserForm.id) return;
    setIsLoading(true);
    try {
      const payloadToUpdate: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> & { password?: string } = {
        namaLengkap: formDataFromUserForm.nama,
        username: formDataFromUserForm.username,
        email: formDataFromUserForm.email,
        role: formDataFromUserForm.role,
        status: formDataFromUserForm.status,
        phoneNumber: formDataFromUserForm.phoneNumber,
      };
      if (formDataFromUserForm.password) {
        payloadToUpdate.password = formDataFromUserForm.password;
      }

      const response = await userService.update(formDataFromUserForm.id.toString(), payloadToUpdate);
      if (response.success && response.data) {
        toast({ title: "Sukses", description: `Data pengguna ${response.data.namaLengkap} berhasil diperbarui.` });
        fetchUsers(currentPage, searchTerm);
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
      } else {
        toast({ title: "Gagal Memperbarui Pengguna", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error editing user:", error);
      toast({ title: "Error Saat Memperbarui Pengguna", description: error instanceof Error ? error.message : "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const response = await userService.delete(selectedUser.id.toString());
      if (response.success !== false) {
        toast({ title: "Sukses", description: `Pengguna ${selectedUser.namaLengkap} berhasil dihapus.` });
        const newTotalRecords = (pagination?.totalRecords || users.length) - 1;
        const newTotalPages = Math.ceil(newTotalRecords / itemsPerPage) || 1;
        if (users.length === 1 && currentPage > 1) {
          fetchUsers(currentPage - 1, searchTerm);
          setCurrentPage(prev => prev - 1);
        } else if (currentPage > newTotalPages && newTotalPages > 0) {
            fetchUsers(newTotalPages, searchTerm);
            setCurrentPage(newTotalPages);
        } else {
          fetchUsers(currentPage, searchTerm);
        }
        setIsDeleteUserModalOpen(false);
        setSelectedUser(null);
      } else {
        toast({ title: "Gagal Menghapus Pengguna", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Gagal menghubungi server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleName = (roleCode?: User["role"]) => {
    if (!roleCode) return '-';
    const role = roles.find((r) => r.kode === roleCode);
    return role ? role.nama : roleCode.charAt(0).toUpperCase() + roleCode.slice(1);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserModalOpen(true);
  };

  const resetRoleForm = () => setRoleForm({ nama: "", kode: "resepsionis", deskripsi: "" });
  const handleAddRole = () => { console.log("Add Role (Simulasi):", roleForm); resetRoleForm(); setIsAddRoleModalOpen(false); toast({title: "Simulasi: Role Ditambahkan"})};
  const handleEditRole = () => { console.log("Edit Role (Simulasi):", selectedRole?.id, roleForm); setIsEditRoleModalOpen(false);toast({title: "Simulasi: Role Diperbarui"}) };
  const handleDeleteRole = () => {
    if(!selectedRole) return;
    const roleInUse = users.some(user => user.role === selectedRole.kode);
    if (roleInUse) {
        toast({ title: "Gagal", description: "Role masih digunakan oleh pengguna.", variant: "destructive" });
        setIsDeleteRoleModalOpen(false);
        return;
    }
    console.log("Delete Role (Simulasi):", selectedRole?.id); setIsDeleteRoleModalOpen(false); toast({title: "Simulasi: Role Dihapus"})
  };
  const handleSavePermissions = () => { console.log("Save Permissions for (Simulasi)", selectedRole?.kode, currentRolePermissions); setIsEditPermissionsModalOpen(false); toast({title: "Simulasi: Hak Akses Disimpan"})};
  const handleRoleFormChange = (field: keyof typeof roleForm, value: string | Role["kode"]) => {
    setRoleForm(prev => ({ ...prev, [field]: value }));
  };
  const togglePermission = (permissionCode: string) => {
    setCurrentRolePermissions((prev) =>
      prev.includes(permissionCode) ? prev.filter((p) => p !== permissionCode) : [...prev, permissionCode]
    );
  };
  const openEditRoleModal = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({ nama: role.nama, kode: role.kode, deskripsi: role.deskripsi });
    setIsEditRoleModalOpen(true);
  };
  const openDeleteRoleModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteRoleModalOpen(true);
  };
   const openEditPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setCurrentRolePermissions(rolePermissions[role.kode] || []);
    setIsEditPermissionsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pengaturan Sistem</h1>
          <p className="text-sm text-muted-foreground">Kelola pengguna, hak akses, dan pengaturan lainnya.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pengguna">Manajemen Pengguna</TabsTrigger>
          <TabsTrigger value="hak-akses">Hak Akses & Role</TabsTrigger>
        </TabsList>

        <TabsContent value="pengguna" className="mt-4 space-y-4">
           <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="w-full sm:w-auto">
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>Pengguna yang terdaftar dalam sistem.</CardDescription>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari pengguna..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); 
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={() => {setSelectedUser(null); setIsAddUserModalOpen(true)}} disabled={isLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <div className="text-center py-4">Memuat data pengguna...</div>}
              {!isLoading && users.length === 0 && (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>Tidak ada data pengguna ditemukan.</p>
                    {searchTerm && <p>Coba kata kunci pencarian yang lain atau kosongkan pencarian.</p>}
                </div>
              )}
              {!isLoading && users.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.namaLengkap}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleName(user.role)}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "aktif" ? "default" : "outline"}
                                   className={user.status === "aktif" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-700 dark:text-green-100 dark:border-green-600" : "bg-red-100 text-red-700 border-red-200 dark:bg-red-700 dark:text-red-100 dark:border-red-600"}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} disabled={isLoading} className="hover:text-blue-600">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteModal(user)} disabled={isLoading} className="hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Hapus</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {pagination && pagination.totalPages > 1 && !isLoading && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Halaman {pagination.currentPage} dari {pagination.totalPages}. Total {pagination.totalRecords} pengguna.
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.currentPage === 1 || isLoading}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={pagination.currentPage === pagination.totalPages || isLoading}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hak-akses" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manajemen Role</CardTitle>
                <CardDescription>Kelola role dan hak akses pengguna</CardDescription>
              </div>
              <Button
                onClick={() => {
                  resetRoleForm(); 
                  setIsAddRoleModalOpen(true);
                }}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Role
              </Button>
            </CardHeader>
            <CardContent>
             {isLoading && activeTab === "hak-akses" && <div className="text-center py-4">Memuat data role...</div>}
             {!isLoading && roles.length === 0 && activeTab === "hak-akses" && <p className="text-center py-4 text-muted-foreground">Tidak ada data role.</p>}
             {!isLoading && roles.length > 0 && activeTab === "hak-akses" && (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nama Role</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.nama}</TableCell>
                        <TableCell>{role.kode}</TableCell>
                        <TableCell>{role.deskripsi}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEditPermissionsModal(role)} disabled={isLoading}>
                                <ShieldCheck className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Hak Akses</span>
                                <span className="sm:hidden">Akses</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditRoleModal(role)} disabled={isLoading} className="hover:text-blue-600">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Role</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteRoleModal(role)} disabled={isLoading} className="hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus Role</span>
                            </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
             )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAddUserModalOpen && (
         <UserForm
            open={isAddUserModalOpen}
            onOpenChange={setIsAddUserModalOpen}
            onSubmit={handleAddUserSubmit}
            initialData={{ 
                nama: "", 
                username: "", 
                email: "", 
                role: "resepsionis", 
                password: "", 
                status: "aktif",
                phoneNumber: ""
            }}
            isLoading={isLoading}
        />
      )}

      {isEditUserModalOpen && selectedUser && (
        <UserForm
          open={isEditUserModalOpen}
          onOpenChange={setIsEditUserModalOpen}
          initialData={{
            id: selectedUser.id,
            nama: selectedUser.namaLengkap,
            username: selectedUser.username,
            email: selectedUser.email,
            role: selectedUser.role,
            status: selectedUser.status,
            phoneNumber: selectedUser.phoneNumber || "",
            password: "", 
          }}
          onSubmit={handleEditUserSubmit}
          isLoading={isLoading}
        />
      )}

      {selectedUser && (
        <DeleteConfirmation
          open={isDeleteUserModalOpen}
          onOpenChange={setIsDeleteUserModalOpen}
          onConfirm={handleDeleteUser}
          title="Hapus Pengguna"
          description={`Apakah Anda yakin ingin menghapus pengguna ${selectedUser.namaLengkap} (Username: ${selectedUser.username})? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}
      
      <Dialog open={isAddRoleModalOpen} onOpenChange={setIsAddRoleModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={(e) => { e.preventDefault(); handleAddRole(); }}>
                  <DialogHeader>
                      <DialogTitle>Tambah Role Baru</DialogTitle>
                      <DialogDescription>Tambahkan role baru ke sistem.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="role-nama-add">Nama Role</Label>
                          <Input id="role-nama-add" value={roleForm.nama} onChange={(e) => handleRoleFormChange("nama", e.target.value)} required disabled={isLoading}/>
                      </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-kode-add">Kode Role</Label>
                          <Input id="role-kode-add" value={roleForm.kode} onChange={(e) => handleRoleFormChange("kode", e.target.value as Role["kode"])} required disabled={isLoading}/>
                      </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-deskripsi-add">Deskripsi</Label>
                          <Input id="role-deskripsi-add" value={roleForm.deskripsi} onChange={(e) => handleRoleFormChange("deskripsi", e.target.value)} disabled={isLoading}/>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddRoleModalOpen(false)} disabled={isLoading}>Batal</Button>
                      <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

     {selectedRole && (
       <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
               <form onSubmit={(e) => { e.preventDefault(); handleEditRole(); }}>
                  <DialogHeader>
                      <DialogTitle>Edit Role - {selectedRole.nama}</DialogTitle>
                      <DialogDescription>Edit detail untuk role ini.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="role-nama-edit">Nama Role</Label>
                          <Input id="role-nama-edit" value={roleForm.nama} onChange={(e) => handleRoleFormChange("nama", e.target.value)} required disabled={isLoading}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="role-kode-edit">Kode Role</Label>
                          <Input id="role-kode-edit" value={roleForm.kode} onChange={(e) => handleRoleFormChange("kode", e.target.value as Role["kode"])} required disabled={isLoading}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="role-deskripsi-edit">Deskripsi</Label>
                          <Input id="role-deskripsi-edit" value={roleForm.deskripsi} onChange={(e) => handleRoleFormChange("deskripsi", e.target.value)} disabled={isLoading}/>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditRoleModalOpen(false)} disabled={isLoading}>Batal</Button>
                      <Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Perubahan"}</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
     )}

      {selectedRole && (
          <Dialog open={isEditPermissionsModalOpen} onOpenChange={setIsEditPermissionsModalOpen}>
              <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                      <DialogTitle>Kelola Hak Akses - {selectedRole.nama}</DialogTitle>
                      <DialogDescription>Pilih hak akses yang diberikan untuk role ini.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50 dark:hover:bg-accent/20">
                                  <Checkbox
                                      id={`perm-${permission.id}-${permission.kode}`}
                                      checked={currentRolePermissions.includes(permission.kode)}
                                      onCheckedChange={() => togglePermission(permission.kode)}
                                      className="mt-1"
                                      disabled={isLoading}
                                  />
                                  <div className="grid gap-1.5 leading-none">
                                      <label
                                          htmlFor={`perm-${permission.id}-${permission.kode}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                      >
                                          {permission.nama}
                                      </label>
                                      <p className="text-xs text-muted-foreground">{permission.deskripsi}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditPermissionsModalOpen(false)} disabled={isLoading}>Batal</Button>
                      <Button onClick={handleSavePermissions} disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan Hak Akses"}</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      )}

       {selectedRole && (
          <DeleteConfirmation
              open={isDeleteRoleModalOpen}
              onOpenChange={setIsDeleteRoleModalOpen}
              onConfirm={handleDeleteRole}
              title="Hapus Role"
              description={`Apakah Anda yakin ingin menghapus role ${selectedRole.nama}? Pengguna dengan role ini mungkin akan kehilangan akses. Pastikan tidak ada pengguna yang masih menggunakan role ini.`}
          />
      )}
    </div>
  )
}
