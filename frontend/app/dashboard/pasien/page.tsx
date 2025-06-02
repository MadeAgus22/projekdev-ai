"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, FileText, Plus, Search, Trash2 } from "lucide-react"
import { PasienForm } from "@/components/pasien/pasien-form"
import { DeleteConfirmation } from "@/components/ui/delete-confirmation"
import { useToast } from "@/components/ui/use-toast"

// Dummy data for patients
const dummyPasien = [
  {
    id: "RM-001234",
    nama: "Ahmad Fauzi",
    tanggalLahir: "15-05-1985",
    jenisKelamin: "Laki-laki",
    telepon: "081234567890",
    kunjunganTerakhir: "23-04-2023",
  },
  {
    id: "RM-001235",
    nama: "Budi Santoso",
    tanggalLahir: "22-08-1990",
    jenisKelamin: "Laki-laki",
    telepon: "081234567891",
    kunjunganTerakhir: "24-04-2023",
  },
  {
    id: "RM-001236",
    nama: "Citra Dewi",
    tanggalLahir: "10-12-1988",
    jenisKelamin: "Perempuan",
    telepon: "081234567892",
    kunjunganTerakhir: "24-04-2023",
  },
  {
    id: "RM-001237",
    nama: "Dian Purnama",
    tanggalLahir: "05-03-1995",
    jenisKelamin: "Perempuan",
    telepon: "081234567893",
    kunjunganTerakhir: "25-04-2023",
  },
  {
    id: "RM-001238",
    nama: "Eko Prasetyo",
    tanggalLahir: "18-07-1982",
    jenisKelamin: "Laki-laki",
    telepon: "081234567894",
    kunjunganTerakhir: "25-04-2023",
  },
]

export default function PasienPage() {
  const [pasienData, setPasienData] = useState(dummyPasien)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPasien, setSelectedPasien] = useState<any>(null)
  const { toast } = useToast()

  // Filter patients based on search term
  const filteredPasien = pasienData.filter(
    (pasien) =>
      pasien.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pasien.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle add new patient
  const handleAddPasien = (data: any) => {
    const newPasien = {
      id: `RM-${Math.floor(Math.random() * 900000) + 100000}`,
      nama: data.nama,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir).toLocaleDateString("id-ID") : "",
      jenisKelamin: data.jenisKelamin === "laki-laki" ? "Laki-laki" : "Perempuan",
      telepon: data.telepon,
      kunjunganTerakhir: "-",
    }
    setPasienData([...pasienData, newPasien])
    toast({
      title: "Pasien berhasil ditambahkan",
      description: `${newPasien.nama} telah ditambahkan ke database.`,
    })
  }

  // Handle edit patient
  const handleEditPasien = (data: any) => {
    const updatedPasien = pasienData.map((pasien) =>
      pasien.id === selectedPasien.id
        ? {
            ...pasien,
            nama: data.nama,
            tanggalLahir: data.tanggalLahir
              ? new Date(data.tanggalLahir).toLocaleDateString("id-ID")
              : pasien.tanggalLahir,
            jenisKelamin: data.jenisKelamin === "laki-laki" ? "Laki-laki" : "Perempuan",
            telepon: data.telepon,
          }
        : pasien,
    )
    setPasienData(updatedPasien)
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manajemen Pasien</h1>
          <p className="text-sm text-muted-foreground">Kelola data pasien klinik</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pasien
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
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Detail</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPasien(pasien)
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
      <PasienForm open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSubmit={handleAddPasien} />

      {/* Edit Patient Modal */}
      {selectedPasien && (
        <PasienForm
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initialData={{
            nama: selectedPasien.nama,
            tanggalLahir: new Date(),
            jenisKelamin: selectedPasien.jenisKelamin === "Laki-laki" ? "laki-laki" : "perempuan",
            alamat: "",
            telepon: selectedPasien.telepon,
            email: "",
            alergi: "",
            riwayatPenyakit: "",
          }}
          onSubmit={handleEditPasien}
        />
      )}

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
