"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash2, Check } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dummy data for today's queue
const dummyAntrian = [
  {
    id: 1,
    nama: "Ahmad Fauzi",
    noRM: "RM-001234",
    dokter: "drg. Siti Aisyah",
    jenis: "Reservasi",
    status: "Menunggu",
    waktuDaftar: "08:30",
  },
  {
    id: 2,
    nama: "Budi Santoso",
    noRM: "RM-001235",
    dokter: "drg. Hadi Wijaya",
    jenis: "Walk-in",
    status: "Pemeriksaan",
    waktuDaftar: "09:00",
  },
  {
    id: 3,
    nama: "Citra Dewi",
    noRM: "RM-001236",
    dokter: "drg. Siti Aisyah",
    jenis: "Reservasi",
    status: "Pemeriksaan",
    waktuDaftar: "09:15",
  },
  {
    id: 4,
    nama: "Dian Purnama",
    noRM: "RM-001237",
    dokter: "drg. Hadi Wijaya",
    jenis: "Walk-in",
    status: "Menunggu",
    waktuDaftar: "09:30",
  },
  {
    id: 5,
    nama: "Eko Prasetyo",
    noRM: "RM-001238",
    dokter: "drg. Siti Aisyah",
    jenis: "Reservasi",
    status: "Menunggu",
    waktuDaftar: "10:00",
  },
]

// Dummy data for upcoming reservations
const dummyReservasi = [
  {
    id: 1,
    nama: "Fira Rahmawati",
    noRM: "RM-001239",
    dokter: "drg. Siti Aisyah",
    tanggal: "26-04-2023",
    waktu: "09:00",
    keluhan: "Sakit gigi belakang",
  },
  {
    id: 2,
    nama: "Gunawan Wibowo",
    noRM: "RM-001240",
    dokter: "drg. Hadi Wijaya",
    tanggal: "26-04-2023",
    waktu: "10:30",
    keluhan: "Kontrol kawat gigi",
  },
  {
    id: 3,
    nama: "Hana Permata",
    noRM: "RM-001241",
    dokter: "drg. Maya Putri",
    tanggal: "26-04-2023",
    waktu: "14:00",
    keluhan: "Perawatan saluran akar",
  },
  {
    id: 4,
    nama: "Irfan Hakim",
    noRM: "RM-001242",
    dokter: "drg. Siti Aisyah",
    tanggal: "27-04-2023",
    waktu: "09:30",
    keluhan: "Pembersihan karang gigi",
  },
  {
    id: 5,
    nama: "Joko Susilo",
    noRM: "RM-001243",
    dokter: "drg. Hadi Wijaya",
    tanggal: "27-04-2023",
    waktu: "11:00",
    keluhan: "Konsultasi pemasangan kawat gigi",
  },
]

export default function ReservasiPage() {
  const [antrianData, setAntrianData] = useState(dummyAntrian)
  const [reservasiData, setReservasiData] = useState(dummyReservasi)
  const [isReservasiModalOpen, setIsReservasiModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("antrian")
  const [formData, setFormData] = useState({
    pasienId: "",
    pasienNama: "",
    dokter: "",
    tanggal: "",
    waktu: "",
    keluhan: "",
    catatan: "",
  })
  const { toast } = useToast()

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle add new reservation
  const handleAddReservasi = (e: React.FormEvent) => {
    e.preventDefault()
    const newReservasi = {
      id: reservasiData.length + 1,
      nama: formData.pasienNama,
      noRM: formData.pasienId,
      dokter:
        formData.dokter === "1" ? "drg. Siti Aisyah" : formData.dokter === "2" ? "drg. Hadi Wijaya" : "drg. Maya Putri",
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      keluhan: formData.keluhan,
    }
    setReservasiData([...reservasiData, newReservasi])
    setIsReservasiModalOpen(false)
    toast({
      title: "Reservasi berhasil ditambahkan",
      description: `Reservasi untuk ${newReservasi.nama} telah dibuat.`,
    })
  }

  // Handle edit reservation
  const handleEditReservasi = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === "antrian") {
      const updatedAntrian = antrianData.map((antrian) =>
        antrian.id === selectedItem.id
          ? {
              ...antrian,
              dokter:
                formData.dokter === "1"
                  ? "drg. Siti Aisyah"
                  : formData.dokter === "2"
                    ? "drg. Hadi Wijaya"
                    : "drg. Maya Putri",
            }
          : antrian,
      )
      setAntrianData(updatedAntrian)
    } else {
      const updatedReservasi = reservasiData.map((reservasi) =>
        reservasi.id === selectedItem.id
          ? {
              ...reservasi,
              dokter:
                formData.dokter === "1"
                  ? "drg. Siti Aisyah"
                  : formData.dokter === "2"
                    ? "drg. Hadi Wijaya"
                    : "drg. Maya Putri",
              tanggal: formData.tanggal,
              waktu: formData.waktu,
              keluhan: formData.keluhan,
            }
          : reservasi,
      )
      setReservasiData(updatedReservasi)
    }
    setIsEditModalOpen(false)
    toast({
      title: activeTab === "antrian" ? "Antrian berhasil diperbarui" : "Reservasi berhasil diperbarui",
      description: `Data untuk ${selectedItem?.nama} telah diperbarui.`,
    })
  }

  // Handle delete item
  const handleDeleteItem = () => {
    if (activeTab === "antrian") {
      const updatedAntrian = antrianData.filter((antrian) => antrian.id !== selectedItem.id)
      setAntrianData(updatedAntrian)
    } else {
      const updatedReservasi = reservasiData.filter((reservasi) => reservasi.id !== selectedItem.id)
      setReservasiData(updatedReservasi)
    }
    setIsDeleteModalOpen(false)
    toast({
      title: activeTab === "antrian" ? "Antrian berhasil dihapus" : "Reservasi berhasil dihapus",
      description: `Data untuk ${selectedItem?.nama} telah dihapus.`,
      variant: "destructive",
    })
  }

  // Handle call patient
  const handleCallPatient = (id: number) => {
    const updatedAntrian = antrianData.map((antrian) =>
      antrian.id === id
        ? {
            ...antrian,
            status: "Pemeriksaan",
          }
        : antrian,
    )
    setAntrianData(updatedAntrian)
    toast({
      title: "Pasien dipanggil",
      description: `Pasien telah dipanggil untuk pemeriksaan.`,
    })
  }

  // Handle confirm reservation
  const handleConfirmReservation = (id: number) => {
    // Find the reservation
    const reservation = reservasiData.find((r) => r.id === id)
    if (!reservation) return

    // Add to today's queue
    const newAntrian = {
      id: antrianData.length + 1,
      nama: reservation.nama,
      noRM: reservation.noRM,
      dokter: reservation.dokter,
      jenis: "Reservasi",
      status: "Menunggu",
      waktuDaftar: reservation.waktu,
    }
    setAntrianData([...antrianData, newAntrian])

    // Remove from reservations if it's today's reservation
    if (
      reservation.tanggal ===
      new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")
    ) {
      const updatedReservasi = reservasiData.filter((r) => r.id !== id)
      setReservasiData(updatedReservasi)
    }

    toast({
      title: "Reservasi dikonfirmasi",
      description: `${reservation.nama} telah ditambahkan ke antrian hari ini.`,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reservasi & Antrian</h1>
          <p className="text-sm text-muted-foreground">Kelola reservasi dan antrian pasien</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              pasienId: "",
              pasienNama: "",
              dokter: "",
              tanggal: "",
              waktu: "",
              keluhan: "",
              catatan: "",
            })
            setIsReservasiModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Reservasi
        </Button>
      </div>
      <Tabs defaultValue="antrian" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="antrian">Antrian Hari Ini</TabsTrigger>
          <TabsTrigger value="reservasi">Reservasi Mendatang</TabsTrigger>
        </TabsList>
        <TabsContent value="antrian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antrian Pasien Hari Ini</CardTitle>
              <CardDescription>Daftar pasien yang terdaftar untuk kunjungan hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">No</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {antrianData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Tidak ada data antrian yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    antrianData.map((antrian) => (
                      <TableRow key={antrian.id}>
                        <TableCell className="font-medium">{antrian.id}</TableCell>
                        <TableCell>{antrian.nama}</TableCell>
                        <TableCell>{antrian.noRM}</TableCell>
                        <TableCell>{antrian.dokter}</TableCell>
                        <TableCell>{antrian.jenis}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              antrian.status === "Menunggu"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {antrian.status}
                          </span>
                        </TableCell>
                        <TableCell>{antrian.waktuDaftar}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={antrian.status === "Pemeriksaan"}
                              onClick={() => handleCallPatient(antrian.id)}
                            >
                              Panggil
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(antrian)
                                setFormData({
                                  pasienId: antrian.noRM,
                                  pasienNama: antrian.nama,
                                  dokter:
                                    antrian.dokter === "drg. Siti Aisyah"
                                      ? "1"
                                      : antrian.dokter === "drg. Hadi Wijaya"
                                        ? "2"
                                        : "3",
                                  tanggal: "",
                                  waktu: antrian.waktuDaftar,
                                  keluhan: "",
                                  catatan: "",
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
                                setSelectedItem(antrian)
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
        </TabsContent>
        <TabsContent value="reservasi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reservasi Mendatang</CardTitle>
              <CardDescription>Daftar reservasi pasien untuk kunjungan di masa mendatang</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservasiData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Tidak ada data reservasi yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservasiData.map((reservasi) => (
                      <TableRow key={reservasi.id}>
                        <TableCell className="font-medium">{reservasi.nama}</TableCell>
                        <TableCell>{reservasi.noRM}</TableCell>
                        <TableCell>{reservasi.dokter}</TableCell>
                        <TableCell>{reservasi.tanggal}</TableCell>
                        <TableCell>{reservasi.waktu}</TableCell>
                        <TableCell>{reservasi.keluhan}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleConfirmReservation(reservasi.id)}>
                              <Check className="mr-2 h-4 w-4" />
                              Konfirmasi
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(reservasi)
                                setFormData({
                                  pasienId: reservasi.noRM,
                                  pasienNama: reservasi.nama,
                                  dokter:
                                    reservasi.dokter === "drg. Siti Aisyah"
                                      ? "1"
                                      : reservasi.dokter === "drg. Hadi Wijaya"
                                        ? "2"
                                        : "3",
                                  tanggal: reservasi.tanggal,
                                  waktu: reservasi.waktu,
                                  keluhan: reservasi.keluhan,
                                  catatan: "",
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
                                setSelectedItem(reservasi)
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
        </TabsContent>
      </Tabs>

      {/* Add Reservation Modal */}
      <Dialog open={isReservasiModalOpen} onOpenChange={setIsReservasiModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleAddReservasi}>
            <DialogHeader>
              <DialogTitle>Tambah Reservasi</DialogTitle>
              <DialogDescription>Buat reservasi baru untuk pasien</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pasienId">ID Pasien</Label>
                  <Input
                    id="pasienId"
                    placeholder="Masukkan No. RM"
                    value={formData.pasienId}
                    onChange={(e) => handleFormChange("pasienId", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pasienNama">Nama Pasien</Label>
                  <Input
                    id="pasienNama"
                    placeholder="Nama akan muncul otomatis"
                    value={formData.pasienNama}
                    onChange={(e) => handleFormChange("pasienNama", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dokter">Dokter</Label>
                <Select value={formData.dokter} onValueChange={(value) => handleFormChange("dokter", value)} required>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleFormChange("tanggal", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waktu">Waktu</Label>
                  <Select value={formData.waktu} onValueChange={(value) => handleFormChange("waktu", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="08:30">08:30</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="09:30">09:30</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="10:30">10:30</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="11:30">11:30</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="13:30">13:30</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="14:30">14:30</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="15:30">15:30</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="16:30">16:30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keluhan">Keluhan</Label>
                <Textarea
                  id="keluhan"
                  placeholder="Deskripsikan keluhan pasien"
                  value={formData.keluhan}
                  onChange={(e) => handleFormChange("keluhan", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan (opsional)"
                  value={formData.catatan}
                  onChange={(e) => handleFormChange("catatan", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReservasiModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleEditReservasi}>
            <DialogHeader>
              <DialogTitle>{activeTab === "antrian" ? "Edit Antrian" : "Edit Reservasi"}</DialogTitle>
              <DialogDescription>
                Edit data {activeTab === "antrian" ? "antrian" : "reservasi"} yang sudah ada
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Pasien</Label>
                  <div className="font-medium">{formData.pasienId}</div>
                </div>
                <div className="space-y-2">
                  <Label>Nama Pasien</Label>
                  <div className="font-medium">{formData.pasienNama}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dokter">Dokter</Label>
                <Select value={formData.dokter} onValueChange={(value) => handleFormChange("dokter", value)} required>
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
              {activeTab === "reservasi" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tanggal">Tanggal</Label>
                      <Input
                        id="tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => handleFormChange("tanggal", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waktu">Waktu</Label>
                      <Select
                        value={formData.waktu}
                        onValueChange={(value) => handleFormChange("waktu", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">08:00</SelectItem>
                          <SelectItem value="08:30">08:30</SelectItem>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="09:30">09:30</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="10:30">10:30</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="11:30">11:30</SelectItem>
                          <SelectItem value="13:00">13:00</SelectItem>
                          <SelectItem value="13:30">13:30</SelectItem>
                          <SelectItem value="14:00">14:00</SelectItem>
                          <SelectItem value="14:30">14:30</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="15:30">15:30</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="16:30">16:30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keluhan">Keluhan</Label>
                    <Textarea
                      id="keluhan"
                      placeholder="Deskripsikan keluhan pasien"
                      value={formData.keluhan}
                      onChange={(e) => handleFormChange("keluhan", e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteItem}
        title={activeTab === "antrian" ? "Hapus Antrian" : "Hapus Reservasi"}
        description={`Apakah Anda yakin ingin menghapus data ${activeTab === "antrian" ? "antrian" : "reservasi"} untuk ${selectedItem?.nama}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  )
}
