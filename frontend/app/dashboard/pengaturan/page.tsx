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
import { Plus, Pencil, Trash2, Search, ShieldCheck, Loader2 } from "lucide-react" // Tambahkan Loader2
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
import { UserForm, type UserFormData } from "@/components/pengaturan/user-form"
import { DeleteConfirmation } from "@/components/ui/delete-confirmation"
import { useToast } from "@/hooks/use-toast"
import { userService, roleService, permissionService } from "@/services/api"

import type {
  UserResponseDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
  RoleResponseDTO,
  PermissionResponseDTO,
  CreateRoleRequestDTO,
  UpdateRoleRequestDTO,
  PermissionSimpleDTO, // Pastikan ini diimpor jika RoleResponseDTO menggunakannya
} from '@/types/dto';

interface User extends UserResponseDTO {}
interface Role extends RoleResponseDTO {} // Role sekarang akan memiliki field 'permissions' dari tipe PermissionSimpleDTO[]
interface Permission extends PermissionResponseDTO {}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export default function PengaturanPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])

  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false); // State untuk loading simpan permission


  const [searchTermUsers, setSearchTermUsers] = useState("")
  // const [searchTermRoles, setSearchTermRoles] = useState("")
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
  
  const [roleForm, setRoleForm] = useState<CreateRoleRequestDTO>({ nama: "", kode: "", deskripsi: "", permissionKodes: [] });
  const [currentRolePermissions, setCurrentRolePermissions] = useState<string[]>([]);

  const { toast } = useToast()

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setIsLoadingUsers(true);
    try {
      const response = await userService.getAll(page, itemsPerPage, search);
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
        setPagination(response.pagination || {
            currentPage: page,
            totalPages: Math.ceil((response.data.length || 0) / itemsPerPage) || 1,
            totalRecords: response.data.length || 0,
            pageSize: itemsPerPage,
        });
      } else {
        setUsers([]);
        setPagination(null);
        if(response.message) toast({ title: "Info Pengguna", description: response.message, variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Gagal Memuat Pengguna", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
      setUsers([]); setPagination(null);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [toast, itemsPerPage]);

  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const response = await roleService.getAll();
      if (response.success && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        setRoles([]);
        if(response.message) toast({ title: "Info Role", description: response.message, variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({ title: "Gagal Memuat Role", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
      setRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  }, [toast]);

  const fetchPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    try {
      const response = await permissionService.getAll();
      if (response.success && Array.isArray(response.data)) {
        setPermissions(response.data);
      } else {
        setPermissions([]);
         if(response.message) toast({ title: "Info Permission", description: response.message, variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({ title: "Gagal Memuat Permission", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [toast]);

  useEffect(() => {
    if (activeTab === "pengguna") {
      fetchUsers(currentPage, searchTermUsers);
    } else if (activeTab === "hak-akses") {
      fetchRoles();
      if (permissions.length === 0) { // Hanya fetch jika belum ada
        fetchPermissions();
      }
    }
  }, [activeTab, fetchUsers, fetchRoles, fetchPermissions, currentPage, searchTermUsers, permissions.length]);


  const handleAddUserSubmit = async (formDataFromUserForm: UserFormData) => {
    setIsLoadingUsers(true);
    try {
      const payload: CreateUserRequestDTO = {
        namaLengkap: formDataFromUserForm.nama,
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
        fetchUsers(1, ""); setCurrentPage(1); setSearchTermUsers("");
        setIsAddUserModalOpen(false);
      } else {
        toast({ title: "Gagal Menambah Pengguna", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Saat Menambah Pengguna", description: error instanceof Error ? error.message : "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleEditUserSubmit = async (formDataFromUserForm: UserFormData) => {
    if (!selectedUser || !formDataFromUserForm.id) return;
    setIsLoadingUsers(true);
    try {
      const payloadToUpdate: UpdateUserRequestDTO = {
        namaLengkap: formDataFromUserForm.nama,
        username: formDataFromUserForm.username,
        email: formDataFromUserForm.email,
        role: formDataFromUserForm.role,
        status: formDataFromUserForm.status,
        phoneNumber: formDataFromUserForm.phoneNumber,
      };
      if (formDataFromUserForm.password) payloadToUpdate.password = formDataFromUserForm.password;
      const response = await userService.update(formDataFromUserForm.id.toString(), payloadToUpdate);
      if (response.success && response.data) {
        toast({ title: "Sukses", description: `Data pengguna ${response.data.namaLengkap} berhasil diperbarui.` });
        fetchUsers(currentPage, searchTermUsers);
        setIsEditUserModalOpen(false); setSelectedUser(null);
      } else {
        toast({ title: "Gagal Memperbarui Pengguna", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Saat Memperbarui Pengguna", description: error instanceof Error ? error.message : "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsLoadingUsers(true);
    try {
      const response = await userService.delete(selectedUser.id.toString());
      if (response.success !== false) {
        toast({ title: "Sukses", description: `Pengguna ${selectedUser.namaLengkap} berhasil dihapus.` });
        fetchUsers(currentPage, searchTermUsers);
        setIsDeleteUserModalOpen(false); setSelectedUser(null);
      } else {
        toast({ title: "Gagal Menghapus Pengguna", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Gagal menghubungi server.", variant: "destructive" });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const resetRoleForm = () => setRoleForm({ nama: "", kode: "", deskripsi: "", permissionKodes: [] });

  const handleAddRole = async () => {
    if (!roleForm.nama || !roleForm.kode) {
      toast({ title: "Validasi Gagal", description: "Nama dan Kode Role wajib diisi.", variant: "destructive" }); return;
    }
    setIsLoadingRoles(true);
    try {
      const response = await roleService.create(roleForm); // roleForm sudah termasuk permissionKodes jika ada
      if (response.success && response.data) {
        toast({ title: "Sukses", description: `Role ${response.data.nama} berhasil ditambahkan.` });
        fetchRoles(); setIsAddRoleModalOpen(false); resetRoleForm();
      } else {
        toast({ title: "Gagal Menambah Role", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !roleForm.nama || !roleForm.kode) {
      toast({ title: "Validasi Gagal", description: "Nama dan Kode Role wajib diisi.", variant: "destructive" }); return;
    }
    setIsLoadingRoles(true);
    const payload: UpdateRoleRequestDTO = {
        nama: roleForm.nama,
        kode: roleForm.kode,
        deskripsi: roleForm.deskripsi,
        // permissionKodes tidak diupdate di sini, tapi di modal terpisah
    };
    try {
      const response = await roleService.update(selectedRole.id.toString(), payload);
      if (response.success && response.data) {
        toast({ title: "Sukses", description: `Role ${response.data.nama} berhasil diperbarui.` });
        fetchRoles(); setIsEditRoleModalOpen(false);
      } else {
        toast({ title: "Gagal Memperbarui Detail Role", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setIsLoadingRoles(true);
    try {
      const response = await roleService.delete(selectedRole.id.toString());
      if (response.success !== false) {
        toast({ title: "Sukses", description: `Role ${selectedRole.nama} berhasil dihapus.` });
        fetchRoles(); setIsDeleteRoleModalOpen(false); setSelectedRole(null);
      } else {
        toast({ title: "Gagal Menghapus Role", description: response.message || "Role mungkin masih digunakan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSavingPermissions(true); // Gunakan state loading spesifik
    const payload: UpdateRoleRequestDTO = {
      permissionKodes: currentRolePermissions,
      // Sertakan field lain dari role jika API update mengharapkannya,
      // atau pastikan API bisa update partial (hanya permissionKodes)
      nama: selectedRole.nama, // Kirim nama & kode agar backend tidak error jika validasi mewajibkan
      kode: selectedRole.kode,
      deskripsi: selectedRole.deskripsi
    };
    try {
      const response = await roleService.update(selectedRole.id.toString(), payload);
      if (response.success && response.data) {
        toast({ title: "Sukses", description: `Hak akses untuk role ${selectedRole.nama} berhasil diperbarui.` });
        fetchRoles(); // Refresh data roles
        setIsEditPermissionsModalOpen(false);
      } else {
        toast({ title: "Gagal Memperbarui Hak Akses", description: response.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Terjadi kesalahan server.", variant: "destructive" });
    } finally {
      setIsSavingPermissions(false);
    }
  };
  
  const handleRoleFormChange = (field: keyof CreateRoleRequestDTO, value: string | string[]) => {
    setRoleForm(prev => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permissionKode: string) => {
    setCurrentRolePermissions((prev) =>
      prev.includes(permissionKode) ? prev.filter((p) => p !== permissionKode) : [...prev, permissionKode]
    );
  };
  
  const openEditRoleModal = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({ nama: role.nama, kode: role.kode, deskripsi: role.deskripsi || "", permissionKodes: role.permissions?.map(p => p.kode) || [] });
    setIsEditRoleModalOpen(true);
  };

  const openDeleteRoleModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteRoleModalOpen(true);
  };

  const openEditPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    // `role.permissions` adalah PermissionSimpleDTO[], jadi kita map kodenya
    setCurrentRolePermissions(role.permissions?.map(p => p.kode) || []);
    if (permissions.length === 0 && !isLoadingPermissions) { // Ambil permissions jika belum ada
        fetchPermissions();
    }
    setIsEditPermissionsModalOpen(true);
  };

  const getRoleName = (roleCode?: User["role"]) => {
    if (!roleCode) return '-';
    const roleDetail = roles.find((r) => r.kode === roleCode);
    return roleDetail ? roleDetail.nama : String(roleCode).charAt(0).toUpperCase() + String(roleCode).slice(1);
  };

  const openAddUserModal = () => {
      setSelectedUser(null);
      setIsAddUserModalOpen(true);
  };
  
  const openEditUserModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const openDeleteUserModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ... (Bagian Judul Halaman) ... */}
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
                            value={searchTermUsers}
                            onChange={(e) => {
                                setSearchTermUsers(e.target.value);
                                setCurrentPage(1); 
                            }}
                            disabled={isLoadingUsers}
                        />
                    </div>
                    <Button onClick={openAddUserModal} disabled={isLoadingUsers}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers && <div className="text-center py-4"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />Memuat data pengguna...</div>}
              {!isLoadingUsers && users.length === 0 && (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>Tidak ada data pengguna ditemukan.</p>
                    {searchTermUsers && <p>Coba kata kunci pencarian yang lain atau kosongkan pencarian.</p>}
                </div>
              )}
              {!isLoadingUsers && users.length > 0 && (
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
                          <TableCell>{getRoleName(user.role as User["role"])}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "aktif" ? "default" : "outline"}
                                   className={user.status === "aktif" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-700/20 dark:text-green-400 dark:border-green-600/50" : "bg-red-100 text-red-700 border-red-200 dark:bg-red-700/20 dark:text-red-400 dark:border-red-600/50"}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditUserModal(user)} disabled={isLoadingUsers} className="hover:text-blue-600">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteUserModal(user)} disabled={isLoadingUsers} className="hover:text-red-600">
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
              {pagination && pagination.totalPages > 1 && !isLoadingUsers && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Halaman {pagination.currentPage} dari {pagination.totalPages}. Total {pagination.totalRecords} pengguna.
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.currentPage === 1 || isLoadingUsers}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={pagination.currentPage === pagination.totalPages || isLoadingUsers}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Hak Akses & Role */}
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
                disabled={isLoadingRoles}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Role
              </Button>
            </CardHeader>
            <CardContent>
             {isLoadingRoles && <div className="text-center py-4"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />Memuat data role...</div>}
             {!isLoadingRoles && roles.length === 0 && <p className="text-center py-4 text-muted-foreground">Tidak ada data role.</p>}
             {!isLoadingRoles && roles.length > 0 && (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nama Role</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Hak Akses</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.nama}</TableCell>
                        <TableCell>{role.kode}</TableCell>
                        <TableCell>{role.deskripsi || "-"}</TableCell>
                        <TableCell>
                            {role.permissions && role.permissions.length > 0 
                                ? role.permissions.slice(0,3).map(p => p.nama).join(', ') + (role.permissions.length > 3 ? '...' : '') 
                                : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEditPermissionsModal(role)} disabled={isLoadingRoles || isLoadingPermissions}>
                                <ShieldCheck className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Hak Akses</span>
                                <span className="sm:hidden">Akses</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditRoleModal(role)} disabled={isLoadingRoles} className="hover:text-blue-600">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Role</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteRoleModal(role)} disabled={isLoadingRoles} className="hover:text-red-600">
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

      {/* === MODALS === */}
      {isAddUserModalOpen && (
         <UserForm
            open={isAddUserModalOpen}
            onOpenChange={setIsAddUserModalOpen}
            onSubmit={handleAddUserSubmit}
            isLoading={isLoadingUsers}
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
            role: selectedUser.role as UserFormData["role"],
            status: selectedUser.status as UserFormData["status"],
            phoneNumber: selectedUser.phoneNumber || "",
          }}
          onSubmit={handleEditUserSubmit}
          isLoading={isLoadingUsers}
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
      
      {/* Add Role Modal */}
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
                          <Input id="role-nama-add" value={roleForm.nama} onChange={(e) => handleRoleFormChange("nama", e.target.value)} required disabled={isLoadingRoles}/>
                      </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-kode-add">Kode Role</Label>
                          <Input id="role-kode-add" value={roleForm.kode} onChange={(e) => handleRoleFormChange("kode", e.target.value)} required disabled={isLoadingRoles} placeholder="e.g., staf_keuangan"/>
                      </div>
                        <div className="space-y-2">
                          <Label htmlFor="role-deskripsi-add">Deskripsi</Label>
                          <Input id="role-deskripsi-add" value={roleForm.deskripsi} onChange={(e) => handleRoleFormChange("deskripsi", e.target.value)} disabled={isLoadingRoles}/>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddRoleModalOpen(false)} disabled={isLoadingRoles}>Batal</Button>
                      <Button type="submit" disabled={isLoadingRoles}>
                        {isLoadingRoles ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

     {/* Edit Role Modal */}
     {selectedRole && (
       <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
               <form onSubmit={(e) => { e.preventDefault(); handleEditRole(); }}>
                  <DialogHeader>
                      <DialogTitle>Edit Role - {roleForm.nama || selectedRole.nama}</DialogTitle>
                      <DialogDescription>Edit detail untuk role ini.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="role-nama-edit">Nama Role</Label>
                          <Input id="role-nama-edit" value={roleForm.nama} onChange={(e) => handleRoleFormChange("nama", e.target.value)} required disabled={isLoadingRoles}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="role-kode-edit">Kode Role</Label>
                          <Input id="role-kode-edit" value={roleForm.kode} onChange={(e) => handleRoleFormChange("kode", e.target.value)} required disabled={isLoadingRoles}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="role-deskripsi-edit">Deskripsi</Label>
                          <Input id="role-deskripsi-edit" value={roleForm.deskripsi} onChange={(e) => handleRoleFormChange("deskripsi", e.target.value)} disabled={isLoadingRoles}/>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditRoleModalOpen(false)} disabled={isLoadingRoles}>Batal</Button>
                       <Button type="submit" disabled={isLoadingRoles}>
                        {isLoadingRoles ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
     )}

      {/* Edit Permissions Modal */}
      {selectedRole && (
          <Dialog open={isEditPermissionsModalOpen} onOpenChange={setIsEditPermissionsModalOpen}>
              <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                      <DialogTitle>Kelola Hak Akses - {selectedRole.nama}</DialogTitle>
                      <DialogDescription>Pilih hak akses yang diberikan untuk role ini.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 max-h-[60vh] overflow-y-auto">
                      {isLoadingPermissions && <div className="text-center py-4"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />Memuat daftar hak akses...</div>}
                      {!isLoadingPermissions && permissions.length === 0 && <p className="text-center py-4 text-muted-foreground">Tidak ada hak akses tersedia.</p>}
                      {!isLoadingPermissions && permissions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent/50 dark:hover:bg-accent/20">
                                    <Checkbox
                                        id={`perm-${permission.id}-${permission.kode}`}
                                        checked={currentRolePermissions.includes(permission.kode)}
                                        onCheckedChange={() => togglePermission(permission.kode)}
                                        className="mt-1"
                                        disabled={isSavingPermissions}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`perm-${permission.id}-${permission.kode}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {permission.nama} ({permission.grup || "Lainnya"})
                                        </label>
                                        <p className="text-xs text-muted-foreground">{permission.deskripsi}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                      )}
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditPermissionsModalOpen(false)} disabled={isSavingPermissions}>Batal</Button>
                      <Button onClick={handleSavePermissions} disabled={isSavingPermissions || isLoadingPermissions}>
                        {isSavingPermissions ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Hak Akses"}
                      </Button>
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