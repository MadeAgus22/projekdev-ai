"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash2 } from "lucide-react"

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

export default function AntrianPage() {
  const [antrianData, setAntrianData] = useState(dummyAntrian)
  const [reservasiData, setReservasiData] = useState(dummyReservasi)
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false)
  const [isReservasiModalOpen, setIsReservasiModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("antrian")

  // Handle add new walk-in
  const handleAddWalkin = (data: any) => {
    const newAntrian = {
      id: antrianData.length + 1,
      nama: data.pasienNama,
      noRM: data.pasienId,
      dokter: data.dokter === "1" ? "drg. Siti Aisyah" : data.dokter === "2" ? "drg. Hadi Wijaya" : "drg. Maya Putri",
      jenis: "Walk-in",
      status: "Menunggu",
      waktuDaftar: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    }
    setAntrianData([...antrianData, newAntrian])
  }

  // Handle add new reservation
  const handleAddReservasi = (data: any) => {
    const newReservasi = {
      id: reservasiData.length + 1,
      nama: data.pasienNama,
      noRM: data.pasienId,
      dokter: data.dokter === "1" ? "drg. Siti Aisyah" : data.dokter === "2" ? "drg. Hadi Wijaya" : "drg. Maya Putri",
      tanggal: data.tanggal ? new Date(data.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : "",
      waktu: data.waktu,
      keluhan: data.keluhan,
    }
    setReservasiData([...reservasiData, newReservasi])
  }

  // Handle edit reservation
  const handleEditReservasi = (data: any) => {
    if (activeTab === "antrian") {
      const updatedAntrian = antrianData.map((antrian) =>
        antrian.id === selectedItem.id
          ? {
              ...antrian,
              nama: data.pasienNama,
              noRM: data.pasienId,
              dokter: data.dokter === "1" ? "drg. Siti Aisyah" : data.dokter === "2" ? "drg. Hadi Wijaya" : "drg. Maya Putri",
            }
          : antrian
      )
      setAntrianData(updatedAntrian)
    } else {
      const updatedReservasi = reservasiData.map((reservasi) =>
        reservasi.id === selectedItem.id
          ? {
              ...reservasi,
              nama: data.pasienNama,
              noRM: data.pasienId,
              dokter: data.dokter === "1" ? "drg. Siti Aisyah" : data.dokter === "2" ? "drg. Hadi Wijaya" : "drg. Maya Putri",
              tanggal: data.tanggal ? new Date(data.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : reservasi.tanggal,
              waktu: data.waktu,
              keluhan: data.keluhan,
            }
          : reservasi
      )
      setReservasiData(updatedReservasi)
    }
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
  }

  // Handle call patient
  const handleCallPatient = (id: number) => {
    const updatedAntrian = antrianData.map((antrian) =>
      antrian.id === id
        ? {
            ...antrian,
            status: "Pemeriksaan",
          }
        : antrian
    )
    setAntrianData(updatedAntrian)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reservasi & Antrian</h1>
          <p className="text-sm text-muted-foreground">Kelola reservasi dan antrian pasien</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsWalkinModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Walk-in
          </Button>
          <Button variant="outline" onClick={() => setIsReservasiModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Reservasi
          </Button>
        </div>
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
                    <TableHea\
