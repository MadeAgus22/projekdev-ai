"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { DeleteConfirmation } from "@/components/ui/delete-confirmation"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dummy data for patients
const dummyPasien = [
  {
    id: "RM-001234",
    nama: "Ahmad Fauzi",
    tanggalLahir: "15-05-1985",
    jenisKelamin: "Laki-laki",
    telepon: "081234567890",
    alamat: "Jl. Merdeka No. 123, Jakarta",
    kunjunganTerakhir: "23-04-2023",
  },
  {
    id: "RM-001235",
    nama: "Budi Santoso",
    tanggalLahir: "22-08-1990",
    jenisKelamin: "Laki-laki",
    telepon: "081234567891",
    alamat: "Jl. Pahlawan No. 45, Bandung",
    kunjunganTerakhir: "24-04-2023",
  },
  {
    id: "RM-001236",
    nama: "Citra Dewi",
    tanggalLahir: "10-12-1988",
    jenisKelamin: "Perempuan",
    telepon: "081234567892",
    alamat: "Jl. Sudirman No. 78, Surabaya",
    kunjunganTerakhir: "24-04-2023",
  },
  {
    id: "RM-001237",
    nama: "Dian Purnama",
    tanggalLahir: "05-03-1995",
    jenisKelamin: "Perempuan",
    telepon: "081234567893",
    alamat: "Jl. Gatot Subroto No. 56, Jakarta",
    kunjunganTerakhir: "25-04-2023",
  },
  {
    id: "RM-001238",
    nama: "Eko Prasetyo",
    tanggalLahir: "18-07-1982",
    jenisKelamin: "Laki-laki",
    telepon: "081234567894",
    alamat: "Jl. Ahmad Yani No. 34, Semarang",
    kunjunganTerakhir: "25-04-2023",
  },
]

export default function RegistrasiPage() {
  const [pasienData, setPasienData] = useState(dummyPasien)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [selectedPasien, setSelectedPasien] = useState<any>(null)
  const [formData, setFormData] = useState({
    nama: "",
    tanggalLahir: "",
    jenisKelamin: "laki-laki",
    telepon: "",
    alamat: "",
    email: "",
    alergi: "",
    riwayatPenyakit: "",
  })
  const [registerData, setRegisterData] = useState({
    dokter: "",
    keluhan: "",
    catatan: "",
  })
  const { toast } = useToast()

  // Filter patients based on search term
  const filteredPasien = pasienData.filter(
    (pasien) =>
      pasien.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pasien.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle register form change
  const handleRegisterChange = (field: string, value: any) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle add new patient
  const handleAddPasien = (e: React.FormEvent) => {
    e.preventDefault()
    const newPasien = {
      id: `RM-${Math.floor(Math.random() * 900000) + 100000}`,
      nama: formData.nama,
      tanggalLahir: formData.tanggalLahir,
      jenisKelamin: formData.jenisKelamin === "laki-laki" ? "Laki-laki" : "Perempuan",
      telepon: formData.telepon,
      alamat: formData.alamat,
      kunjunganTerakhir: "-",
    }
    setPasienData([...pasienData, newPasien])
    setIsAddModalOpen(false)
    toast({
      title: "Pasien berhasil ditambahkan",
      description: `${newPasien.nama} telah ditambahkan ke database.`,
    })
  }

  // Handle edit patient
  const handleEditPasien = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedPasien = pasienData.map((pasien) =>
      pasien.id === selectedPasien.id
        ? {
            ...pasien,
            nama: formData.nama,
            tanggalLahir: formData.tanggalLahir,
            jenisKelamin: formData.jenisKelamin === "laki-laki" ? "Laki-laki" : "Perempuan",
            telepon: formData.telepon,
            alamat: formData.alamat,
          }
        : pasien,
    )
    setPasienData(updatedPasien)
    setIsEditModalOpen(false)
    toast({
      title: "Pasien berhasil diperbarui",
      description: `Data ${selectedPasien?.nama} telah diperbarui.`,
    })
  }

  // Handle delete patient
  const handleDeletePasien = () => {
    const patientToDelete = pasienData.find((p) => p.id === selectedPasien.id)
    const updatedPasien = pasienData.filter((pasien) => pasien.id !== selectedPasien.id)
    setPasienData(updatedPasien)
    setIsDeleteModalOpen(false)
    toast({
      title: "Pasien berhasil dihapus",
      description: `${patientToDelete?.nama} telah dihapus dari database.`,
      variant: "destructive",
    })
  }

  // Handle register patient
  const handleRegisterPasien = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would create a new appointment/visit
    setIsRegisterModalOpen(false)
    toast({
      title: "Pasien berhasil didaftarkan",
      description: `${selectedPasien?.nama} telah didaftarkan untuk kunjungan hari ini.`,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Registrasi Pasien</h1>
          <p className="text-sm text-muted-foreground">Kelola data pasien dan registrasi kunjungan</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              nama: "",
              tanggalLahir: "",
              jenisKelamin: "laki-laki",
              telepon: "",
              alamat: "",
              email: "",
              alergi: "",
              riwayatPenyakit: "",
            })
            setIsAddModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pasien Baru
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Pasien</CardTitle>
              <CardDescription>Daftar seluruh pasien yang terdaftar di klinik</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari pasien..."
                  className="pl-8 w-[250px] md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. RM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Kunjungan Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPasien.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Tidak ada data pasien yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredPasien.map((pasien) => (
                  <TableRow key={pasien.id}>
                    <TableCell className="font-medium">{pasien.id}</TableCell>
                    <TableCell>{pasien.nama}</TableCell>
                    <TableCell>{pasien.tanggalLahir}</TableCell>
                    <TableCell>{pasien.jenisKelamin}</TableCell>
                    <TableCell>{pasien.telepon}</TableCell>
                    <TableCell>{pasien.kunjunganTerakhir}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPasien(pasien)
                            setRegisterData({
                              dokter: "",
                              keluhan: "",
                              catatan: "",
                            })
                            setIsRegisterModalOpen(true)
                          }}
                        >
                          Registrasi
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPasien(pasien)
                            setFormData({
                              nama: pasien.nama,
                              tanggalLahir: pasien.tanggalLahir,
                              jenisKelamin: pasien.jenisKelamin === "Laki-laki" ? "laki-laki" : "perempuan",
                              telepon: pasien.telepon,
                              alamat: pasien.alamat,
                              email: "",
                              alergi: "",
                              riwayatPenyakit: "",
                            })
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPasien(pasien)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Patient Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleAddPasien}>
            <DialogHeader>
              <DialogTitle>Tambah Pasien Baru</DialogTitle>
              <DialogDescription>Tambahkan data pasien baru ke sistem</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => handleFormChange("nama", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => handleFormChange("tanggalLahir", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <RadioGroup
                  value={formData.jenisKelamin}
                  onValueChange={(value) => handleFormChange("jenisKelamin", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="laki-laki" id="laki-laki" />
                    <Label htmlFor="laki-laki">Laki-laki</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="perempuan" id="perempuan" />
                    <Label htmlFor="perempuan">Perempuan</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => handleFormChange("alamat", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telepon">No. Telepon</Label>
                  <Input
                    id="telepon"
                    value={formData.telepon}
                    onChange={(e) => handleFormChange("telepon", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alergi">Alergi</Label>
                <Textarea
                  id="alergi"
                  placeholder="Alergi obat, makanan, dll."
                  value={formData.alergi}
                  onChange={(e) => handleFormChange("alergi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riwayatPenyakit">Riwayat Penyakit</Label>
                <Textarea
                  id="riwayatPenyakit"
                  placeholder="Riwayat penyakit yang diderita"
                  value={formData.riwayatPenyakit}
                  onChange={(e) => handleFormChange("riwayatPenyakit", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleEditPasien}>
            <DialogHeader>
              <DialogTitle>Edit Pasien</DialogTitle>
              <DialogDescription>Edit data pasien yang sudah ada</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => handleFormChange("nama", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => handleFormChange("tanggalLahir", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <RadioGroup
                  value={formData.jenisKelamin}
                  onValueChange={(value) => handleFormChange("jenisKelamin", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="laki-laki" id="edit-laki-laki" />
                    <Label htmlFor="edit-laki-laki">Laki-laki</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="perempuan" id="edit-perempuan" />
                    <Label htmlFor="edit-perempuan">Perempuan</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => handleFormChange("alamat", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telepon">No. Telepon</Label>
                  <Input
                    id="telepon"
                    value={formData.telepon}
                    onChange={(e) => handleFormChange("telepon", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alergi">Alergi</Label>
                <Textarea
                  id="alergi"
                  placeholder="Alergi obat, makanan, dll."
                  value={formData.alergi}
                  onChange={(e) => handleFormChange("alergi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riwayatPenyakit">Riwayat Penyakit</Label>
                <Textarea
                  id="riwayatPenyakit"
                  placeholder="Riwayat penyakit yang diderita"
                  value={formData.riwayatPenyakit}
                  onChange={(e) => handleFormChange("riwayatPenyakit", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Patient Modal */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleRegisterPasien}>
            <DialogHeader>
              <DialogTitle>Registrasi Kunjungan</DialogTitle>
              <DialogDescription>Daftarkan pasien untuk kunjungan hari ini</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Pasien</Label>
                <div className="font-medium">{selectedPasien?.nama}</div>
              </div>
              <div className="space-y-2">
                <Label>No. RM</Label>
                <div className="font-medium">{selectedPasien?.id}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dokter">Dokter</Label>
                <Select
                  value={registerData.dokter}
                  onValueChange={(value) => handleRegisterChange("dokter", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">drg. Siti Aisyah</SelectItem>
                    <SelectItem value="2">drg. Hadi Wijaya</SelectItem>
                    <SelectItem value="3">drg. Maya Putri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keluhan">Keluhan</Label>
                <Textarea
                  id="keluhan"
                  placeholder="Deskripsikan keluhan pasien"
                  value={registerData.keluhan}
                  onChange={(e) => handleRegisterChange("keluhan", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan (opsional)"
                  value={registerData.catatan}
                  onChange={(e) => handleRegisterChange("catatan", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Daftarkan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeletePasien}
        title="Hapus Pasien"
        description={`Apakah Anda yakin ingin menghapus data pasien ${selectedPasien?.nama}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  )
}
