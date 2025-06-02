"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, History, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dummy data for patients in queue
const dummyAntrian = [
  {
    id: 1,
    nama: "Ahmad Fauzi",
    noRM: "RM-001234",
    dokter: "drg. Siti Aisyah",
    status: "Menunggu",
    waktuDaftar: "08:30",
    keluhan: "Sakit gigi belakang kanan atas",
  },
  {
    id: 2,
    nama: "Budi Santoso",
    noRM: "RM-001235",
    dokter: "drg. Hadi Wijaya",
    status: "Pemeriksaan",
    waktuDaftar: "09:00",
    keluhan: "Kontrol kawat gigi",
  },
  {
    id: 3,
    nama: "Citra Dewi",
    noRM: "RM-001236",
    dokter: "drg. Siti Aisyah",
    status: "Pemeriksaan",
    waktuDaftar: "09:15",
    keluhan: "Gusi bengkak dan berdarah",
  },
  {
    id: 4,
    nama: "Dian Purnama",
    noRM: "RM-001237",
    dokter: "drg. Hadi Wijaya",
    status: "Menunggu",
    waktuDaftar: "09:30",
    keluhan: "Sakit gigi depan bawah",
  },
  {
    id: 5,
    nama: "Eko Prasetyo",
    noRM: "RM-001238",
    dokter: "drg. Siti Aisyah",
    status: "Menunggu",
    waktuDaftar: "10:00",
    keluhan: "Kontrol pasca pencabutan gigi",
  },
]

// Dummy data for medical records
const dummyRekamMedis = [
  {
    id: "KJ-001001",
    pasienNama: "Ahmad Fauzi",
    pasienRM: "RM-001234",
    tanggalPeriksa: "23-04-2023",
    dokter: "drg. Siti Aisyah",
    diagnosa: "Karies gigi",
  },
  {
    id: "KJ-001002",
    pasienNama: "Budi Santoso",
    pasienRM: "RM-001235",
    tanggalPeriksa: "24-04-2023",
    dokter: "drg. Hadi Wijaya",
    diagnosa: "Maloklusi",
  },
  {
    id: "KJ-001003",
    pasienNama: "Citra Dewi",
    pasienRM: "RM-001236",
    tanggalPeriksa: "24-04-2023",
    dokter: "drg. Siti Aisyah",
    diagnosa: "Gingivitis",
  },
  {
    id: "KJ-001004",
    pasienNama: "Dian Purnama",
    pasienRM: "RM-001237",
    tanggalPeriksa: "25-04-2023",
    dokter: "drg. Hadi Wijaya",
    diagnosa: "Pulpitis",
  },
  {
    id: "KJ-001005",
    pasienNama: "Eko Prasetyo",
    pasienRM: "RM-001238",
    tanggalPeriksa: "25-04-2023",
    dokter: "drg. Siti Aisyah",
    diagnosa: "Periodontitis",
  },
]

export default function EmrPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // Filter patients based on search term
  const filteredAntrian = dummyAntrian.filter(
    (antrian) =>
      antrian.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      antrian.noRM.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter medical records based on search term
  const filteredRekamMedis = dummyRekamMedis.filter(
    (rekamMedis) =>
      rekamMedis.pasienNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rekamMedis.pasienRM.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rekamMedis.diagnosa.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rekam Medis Elektronik</h1>
          <p className="text-sm text-muted-foreground">Kelola rekam medis elektronik pasien</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari pasien atau rekam medis..."
            className="pl-8 w-[250px] md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="antrian" className="space-y-4">
        <TabsList>
          <TabsTrigger value="antrian">Antrian Pasien</TabsTrigger>
          <TabsTrigger value="rekam-medis">Riwayat Rekam Medis</TabsTrigger>
        </TabsList>
        <TabsContent value="antrian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antrian Pasien Hari Ini</CardTitle>
              <CardDescription>Daftar pasien yang menunggu pemeriksaan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">No</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAntrian.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Tidak ada data antrian yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAntrian.map((antrian) => (
                      <TableRow key={antrian.id}>
                        <TableCell className="font-medium">{antrian.id}</TableCell>
                        <TableCell>{antrian.nama}</TableCell>
                        <TableCell>{antrian.noRM}</TableCell>
                        <TableCell>{antrian.dokter}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              antrian.status === "Menunggu"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-green-100 text-green-800 hover:bg-green-100"
                            }
                          >
                            {antrian.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{antrian.keluhan}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/emr/periksa/${antrian.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Periksa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rekam-medis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Rekam Medis</CardTitle>
              <CardDescription>Daftar rekam medis pasien yang telah diperiksa</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Kunjungan</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>Tanggal Periksa</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Diagnosa</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRekamMedis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Tidak ada data rekam medis yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRekamMedis.map((rekamMedis) => (
                      <TableRow key={rekamMedis.id}>
                        <TableCell className="font-medium">{rekamMedis.id}</TableCell>
                        <TableCell>{rekamMedis.pasienNama}</TableCell>
                        <TableCell>{rekamMedis.pasienRM}</TableCell>
                        <TableCell>{rekamMedis.tanggalPeriksa}</TableCell>
                        <TableCell>{rekamMedis.dokter}</TableCell>
                        <TableCell>{rekamMedis.diagnosa}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/emr/${rekamMedis.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Lihat</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/dashboard/emr/riwayat/${rekamMedis.pasienRM}`)}
                            >
                              <History className="h-4 w-4" />
                              <span className="sr-only">Riwayat</span>
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
    </div>
  )
}
