import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien Hari Ini</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                +20% dari kemarin
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunjungan Aktif</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />2 dalam pemeriksaan
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservasi Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />5 sudah hadir
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 3.250.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 flex items-center">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                -5% dari kemarin
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="antrian" className="space-y-4">
        <TabsList>
          <TabsTrigger value="antrian">Antrian Pasien</TabsTrigger>
          <TabsTrigger value="jadwal">Jadwal Dokter</TabsTrigger>
        </TabsList>
        <TabsContent value="antrian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antrian Pasien Hari Ini</CardTitle>
              <CardDescription>Daftar pasien yang sedang menunggu atau dalam pemeriksaan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">No</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1</TableCell>
                    <TableCell>Ahmad Fauzi</TableCell>
                    <TableCell>drg. Siti Aisyah</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Menunggu
                      </span>
                    </TableCell>
                    <TableCell>08:30</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">2</TableCell>
                    <TableCell>Budi Santoso</TableCell>
                    <TableCell>drg. Hadi Wijaya</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Pemeriksaan
                      </span>
                    </TableCell>
                    <TableCell>09:00</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">3</TableCell>
                    <TableCell>Citra Dewi</TableCell>
                    <TableCell>drg. Siti Aisyah</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Pemeriksaan
                      </span>
                    </TableCell>
                    <TableCell>09:15</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">4</TableCell>
                    <TableCell>Dian Purnama</TableCell>
                    <TableCell>drg. Hadi Wijaya</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Menunggu
                      </span>
                    </TableCell>
                    <TableCell>09:30</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">5</TableCell>
                    <TableCell>Eko Prasetyo</TableCell>
                    <TableCell>drg. Siti Aisyah</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Menunggu
                      </span>
                    </TableCell>
                    <TableCell>10:00</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jadwal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Praktik Dokter Hari Ini</CardTitle>
              <CardDescription>Jadwal praktik dokter yang tersedia hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Dokter</TableHead>
                    <TableHead>Spesialisasi</TableHead>
                    <TableHead>Jam Mulai</TableHead>
                    <TableHead>Jam Selesai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pasien Hari Ini</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">drg. Siti Aisyah</TableCell>
                    <TableCell>Umum</TableCell>
                    <TableCell>08:00</TableCell>
                    <TableCell>14:00</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Aktif
                      </span>
                    </TableCell>
                    <TableCell className="text-right">7</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">drg. Hadi Wijaya</TableCell>
                    <TableCell>Orthodonti</TableCell>
                    <TableCell>09:00</TableCell>
                    <TableCell>15:00</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Aktif
                      </span>
                    </TableCell>
                    <TableCell className="text-right">5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">drg. Maya Putri</TableCell>
                    <TableCell>Endodonti</TableCell>
                    <TableCell>13:00</TableCell>
                    <TableCell>19:00</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Belum Mulai
                      </span>
                    </TableCell>
                    <TableCell className="text-right">4</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
