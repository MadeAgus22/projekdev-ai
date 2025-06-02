"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Odontogram } from "@/components/odontogram/odontogram"
import type { ToothData } from "@/types/odontogram"
import type { UserResponseDTO, CreateUserRequestDTO, } from '@/types/dto';

// Dummy data for available treatments
const availableTreatments = [
  { id: "1", kode: "T001", nama: "Konsultasi", harga: 100000 },
  { id: "2", kode: "T002", nama: "Scaling", harga: 200000 },
  { id: "3", kode: "T003", nama: "Tambal Amalgam", harga: 150000 },
  { id: "4", kode: "T004", nama: "Tambal Composite", harga: 200000 },
  { id: "5", kode: "T005", nama: "Ekstraksi Sederhana", harga: 250000 },
  { id: "6", kode: "T006", nama: "Ekstraksi Komplikasi", harga: 350000 },
  { id: "7", kode: "T007", nama: "Perawatan Saluran Akar", harga: 500000 },
  { id: "8", kode: "T008", nama: "Mahkota Porcelain", harga: 1000000 },
  { id: "9", kode: "T009", nama: "Mahkota Metal", harga: 750000 },
  { id: "10", kode: "T010", nama: "Gigi Tiruan Sebagian", harga: 1500000 },
]

// Dummy data for available medications
const availableMedications = [
  { id: "1", kode: "O001", nama: "Paracetamol 500mg", harga: 2000, satuan: "Tablet" },
  { id: "2", kode: "O002", nama: "Ibuprofen 400mg", harga: 3000, satuan: "Tablet" },
  { id: "3", kode: "O003", nama: "Amoxicillin 500mg", harga: 5000, satuan: "Tablet" },
  { id: "4", kode: "O004", nama: "Metronidazole 500mg", harga: 4000, satuan: "Tablet" },
  { id: "5", kode: "O005", nama: "Asam Mefenamat 500mg", harga: 3000, satuan: "Tablet" },
  { id: "6", kode: "O006", nama: "Chlorhexidine 0.2% 100ml", harga: 25000, satuan: "Botol" },
  { id: "7", kode: "O007", nama: "Povidone Iodine 10% 60ml", harga: 20000, satuan: "Botol" },
  { id: "8", kode: "O008", nama: "Hydrogen Peroxide 3% 100ml", harga: 15000, satuan: "Botol" },
]

export default function PeriksaPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    keluhan:
      "Sakit gigi belakang kanan atas sejak 3 hari yang lalu. Nyeri terutama saat makan makanan dingin atau panas.",
    pemeriksaan: "",
    diagnosa: "",
    rencana: "",
    catatan: "",
  })
  const [treatments, setTreatments] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false)
  const [isAddMedicationModalOpen, setIsAddMedicationModalOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState("")
  const [selectedMedication, setSelectedMedication] = useState("")
  const [treatmentQuantity, setTreatmentQuantity] = useState("1")
  const [medicationQuantity, setMedicationQuantity] = useState("1")
  const [selectedTooth, setSelectedTooth] = useState("")
  const [discount, setDiscount] = useState("0")
  const [teethData, setTeethData] = useState<Record<string, ToothData>>({})
  const { toast } = useToast()

  // Handle form change
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle add treatment
  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault()
    const treatment = availableTreatments.find((t) => t.id === selectedTreatment)
    if (!treatment) return

    const discountValue = Number.parseInt(discount) || 0
    const discountAmount = (treatment.harga * Number.parseInt(treatmentQuantity) * discountValue) / 100
    const totalAfterDiscount = treatment.harga * Number.parseInt(treatmentQuantity) - discountAmount

    const newTreatment = {
      id: Date.now().toString(),
      kode: treatment.kode,
      nama: treatment.nama,
      gigi: selectedTooth,
      harga: treatment.harga,
      jumlah: Number.parseInt(treatmentQuantity),
      diskon: discountValue,
      diskonNominal: discountAmount,
      total: totalAfterDiscount,
    }

    setTreatments([...treatments, newTreatment])
    setIsAddTreatmentModalOpen(false)
    setSelectedTreatment("")
    setTreatmentQuantity("1")
    setSelectedTooth("")
    setDiscount("0")

    // Update tooth status if a tooth was selected
    if (selectedTooth && selectedTooth !== "-") {
      const treatmentCondition = getTreatmentCondition(treatment.nama)

      setTeethData((prev) => {
        const updatedData = { ...prev }
        const oldCondition = updatedData[selectedTooth]?.condition || "normal"

        // Initialize tooth data if it doesn't exist
        if (!updatedData[selectedTooth]) {
          updatedData[selectedTooth] = {
            condition: "normal",
            history: [],
          }
        }

        updatedData[selectedTooth].condition = treatmentCondition

        // Add to history
        if (!updatedData[selectedTooth].history) {
          updatedData[selectedTooth].history = []
        }

        updatedData[selectedTooth].history!.push({
          date: new Date().toISOString().split("T")[0],
          doctor: "drg. Siti Aisyah",
          from: oldCondition,
          to: treatmentCondition,
          note: `${treatment.nama} dilakukan`,
        })

        return updatedData
      })
    }

    toast({
      title: "Tindakan berhasil ditambahkan",
      description: `${treatment.nama} telah ditambahkan ke daftar tindakan.`,
    })
  }

  // Get tooth condition based on treatment
  const getTreatmentCondition = (treatmentName: string) => {
    if (treatmentName.includes("Tambal")) return "filling"
    if (treatmentName.includes("Ekstraksi")) return "missing"
    if (treatmentName.includes("Saluran Akar")) return "root-canal"
    if (treatmentName.includes("Mahkota")) return "crown"
    if (treatmentName.includes("Implan")) return "implant"
    if (treatmentName.includes("Karies")) return "caries"
    return "normal"
  }

  // Handle add medication
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault()
    const medication = availableMedications.find((m) => m.id === selectedMedication)
    if (!medication) return

    const newMedication = {
      id: Date.now().toString(),
      kode: medication.kode,
      nama: medication.nama,
      harga: medication.harga,
      jumlah: Number.parseInt(medicationQuantity),
      satuan: medication.satuan,
      total: medication.harga * Number.parseInt(medicationQuantity),
    }

    setMedications([...medications, newMedication])
    setIsAddMedicationModalOpen(false)
    setSelectedMedication("")
    setMedicationQuantity("1")

    toast({
      title: "Obat berhasil ditambahkan",
      description: `${medication.nama} telah ditambahkan ke daftar obat.`,
    })
  }

  // Handle remove treatment
  const handleRemoveTreatment = (id: string, toothNumber?: string) => {
    const treatment = treatments.find((t) => t.id === id)
    setTreatments(treatments.filter((t) => t.id !== id))

    // Reset tooth status if this treatment was associated with a tooth
    if (treatment && treatment.gigi && treatment.gigi !== "-") {
      setTeethData((prev) => {
        const updatedData = { ...prev }
        const oldCondition = updatedData[treatment.gigi]?.condition || "normal"

        updatedData[treatment.gigi] = {
          condition: "normal",
          history: [
            ...(updatedData[treatment.gigi]?.history || []),
            {
              date: new Date().toISOString().split("T")[0],
              doctor: "drg. Siti Aisyah",
              from: oldCondition,
              to: "normal",
              note: `${treatment.nama} dibatalkan`,
            },
          ],
        }

        return updatedData
      })
    }

    toast({
      title: "Tindakan berhasil dihapus",
      description: "Tindakan telah dihapus dari daftar.",
    })
  }

  // Handle remove medication
  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id))
    toast({
      title: "Obat berhasil dihapus",
      description: "Obat telah dihapus dari daftar.",
    })
  }

  // Handle save EMR
  const handleSaveEmr = () => {
    // In a real app, this would save the EMR to the database
    toast({
      title: "Rekam medis berhasil disimpan",
      description: "Data rekam medis telah disimpan.",
    })
  }

  // Handle odontogram save
  const handleOdontogramSave = (data: Record<string, ToothData>) => {
    setTeethData(data)
    // In a real app, this would save the odontogram data to the database
  }

  // Calculate totals
  const treatmentsTotal = treatments.reduce((sum, t) => sum + t.total, 0)
  const medicationsTotal = medications.reduce((sum, m) => sum + m.total, 0)
  const discountTotal = treatments.reduce((sum, t) => sum + (t.diskonNominal || 0), 0)
  const grandTotal = treatmentsTotal + medicationsTotal

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/emr">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Pemeriksaan Pasien</h1>
          <p className="text-sm text-muted-foreground">No. Antrian: {params.id}</p>
        </div>
        <Button className="ml-auto" onClick={handleSaveEmr}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Rekam Medis
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informasi Pasien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Pasien</Label>
                <div className="font-medium">Ahmad Fauzi</div>
              </div>
              <div>
                <Label>No. RM</Label>
                <div className="font-medium">RM-001234</div>
              </div>
              <div>
                <Label>Tanggal Lahir</Label>
                <div className="font-medium">15-05-1985</div>
              </div>
              <div>
                <Label>Jenis Kelamin</Label>
                <div className="font-medium">Laki-laki</div>
              </div>
              <div>
                <Label>No. Telepon</Label>
                <div className="font-medium">081234567890</div>
              </div>
              <div>
                <Label>Alamat</Label>
                <div className="font-medium">Jl. Merdeka No. 123, Jakarta</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Kunjungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <Label>Tanggal Periksa</Label>
                <div className="font-medium">{new Date().toLocaleDateString("id-ID")}</div>
              </div>
              <div>
                <Label>Dokter</Label>
                <div className="font-medium">drg. Siti Aisyah</div>
              </div>
              <div>
                <Label>Jenis Kunjungan</Label>
                <div className="font-medium">Pemeriksaan Rutin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rekam Medis Elektronik</CardTitle>
          <CardDescription>Detail rekam medis pasien</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keluhan">Keluhan Utama</Label>
            <Textarea
              id="keluhan"
              placeholder="Masukkan keluhan utama pasien"
              value={formData.keluhan}
              onChange={(e) => handleFormChange("keluhan", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pemeriksaan">Hasil Pemeriksaan</Label>
            <Textarea
              id="pemeriksaan"
              placeholder="Masukkan hasil pemeriksaan"
              value={formData.pemeriksaan}
              onChange={(e) => handleFormChange("pemeriksaan", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosa">Diagnosa</Label>
            <Textarea
              id="diagnosa"
              placeholder="Masukkan diagnosa"
              value={formData.diagnosa}
              onChange={(e) => handleFormChange("diagnosa", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rencana">Rencana Perawatan</Label>
            <Textarea
              id="rencana"
              placeholder="Masukkan rencana perawatan"
              value={formData.rencana}
              onChange={(e) => handleFormChange("rencana", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan</Label>
            <Textarea
              id="catatan"
              placeholder="Masukkan catatan tambahan"
              value={formData.catatan}
              onChange={(e) => handleFormChange("catatan", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="odontogram" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="odontogram">Odontogram</TabsTrigger>
          <TabsTrigger value="tindakan">Tindakan & Obat</TabsTrigger>
        </TabsList>
        <TabsContent value="odontogram">
          <Card>
            <CardHeader>
              <CardTitle>Odontogram</CardTitle>
              <CardDescription>Pilih gigi untuk menandai kondisinya</CardDescription>
            </CardHeader>
            <CardContent>
              <Odontogram initialData={teethData} onSave={handleOdontogramSave} doctorName="drg. Siti Aisyah" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tindakan">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tindakan & Obat</CardTitle>
                <CardDescription>Daftar tindakan dan obat yang diberikan</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTooth("-")
                    setIsAddTreatmentModalOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Tindakan
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAddMedicationModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Obat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Tindakan</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Tindakan</TableHead>
                      <TableHead>Gigi</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Harga (Rp)</TableHead>
                      <TableHead>Diskon (%)</TableHead>
                      <TableHead>Total (Rp)</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Belum ada tindakan yang ditambahkan
                        </TableCell>
                      </TableRow>
                    ) : (
                      treatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell>{treatment.kode}</TableCell>
                          <TableCell>{treatment.nama}</TableCell>
                          <TableCell>{treatment.gigi || "-"}</TableCell>
                          <TableCell>{treatment.jumlah}</TableCell>
                          <TableCell>{treatment.harga.toLocaleString()}</TableCell>
                          <TableCell>{treatment.diskon}%</TableCell>
                          <TableCell>{treatment.total.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTreatment(treatment.id, treatment.gigi)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Obat & Bahan</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Obat/Bahan</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Harga (Rp)</TableHead>
                      <TableHead>Total (Rp)</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          Belum ada obat yang ditambahkan
                        </TableCell>
                      </TableRow>
                    ) : (
                      medications.map((medication) => (
                        <TableRow key={medication.id}>
                          <TableCell>{medication.kode}</TableCell>
                          <TableCell>{medication.nama}</TableCell>
                          <TableCell>{medication.jumlah}</TableCell>
                          <TableCell>{medication.satuan}</TableCell>
                          <TableCell>{medication.harga.toLocaleString()}</TableCell>
                          <TableCell>{medication.total.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveMedication(medication.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <div className="w-72 space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span>Subtotal Tindakan:</span>
                    <span>Rp {(treatmentsTotal + discountTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon Tindakan:</span>
                    <span>Rp {discountTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Obat:</span>
                    <span>Rp {medicationsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>Rp {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Modal */}
      <Dialog open={isAddTreatmentModalOpen} onOpenChange={setIsAddTreatmentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddTreatment}>
            <DialogHeader>
              <DialogTitle>Tambah Tindakan</DialogTitle>
              <DialogDescription>
                {selectedTooth && selectedTooth !== "-"
                  ? `Tambahkan tindakan untuk gigi ${selectedTooth}`
                  : "Tambahkan tindakan baru ke rekam medis"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="treatment">Tindakan</Label>
                <Select value={selectedTreatment} onValueChange={setSelectedTreatment} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tindakan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTreatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.nama} - Rp {treatment.harga.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!selectedTooth || selectedTooth === "-" ? (
                <div className="space-y-2">
                  <Label htmlFor="tooth">Gigi</Label>
                  <Select value={selectedTooth} onValueChange={setSelectedTooth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nomor gigi (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      {Array.from({ length: 32 }, (_, i) => {
                        const toothNumber =
                          i < 8 ? 18 - i : i < 16 ? 21 + (i - 8) : i < 24 ? 48 - (i - 16) : 31 + (i - 24)
                        return (
                          <SelectItem key={toothNumber} value={toothNumber.toString()}>
                            {toothNumber}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Gigi</Label>
                  <div className="font-medium">{selectedTooth}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={treatmentQuantity}
                  onChange={(e) => setTreatmentQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Diskon (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga</Label>
                  <div className="font-medium">
                    Rp{" "}
                    {selectedTreatment
                      ? (
                          (availableTreatments.find((t) => t.id === selectedTreatment)?.harga || 0) *
                          Number.parseInt(treatmentQuantity || "1")
                        ).toLocaleString()
                      : "0"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Setelah Diskon</Label>
                  <div className="font-medium">
                    Rp{" "}
                    {selectedTreatment
                      ? (
                          (availableTreatments.find((t) => t.id === selectedTreatment)?.harga || 0) *
                          Number.parseInt(treatmentQuantity || "1") *
                          (1 - Number.parseInt(discount || "0") / 100)
                        ).toLocaleString()
                      : "0"}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!selectedTreatment}>
                Tambah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Medication Modal */}
      <Dialog open={isAddMedicationModalOpen} onOpenChange={setIsAddMedicationModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAddMedication}>
            <DialogHeader>
              <DialogTitle>Tambah Obat</DialogTitle>
              <DialogDescription>Tambahkan obat baru ke rekam medis</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Obat</Label>
                <Select value={selectedMedication} onValueChange={setSelectedMedication} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih obat" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMedications.map((medication) => (
                      <SelectItem key={medication.id} value={medication.id}>
                        {medication.nama} - Rp {medication.harga.toLocaleString()}/{medication.satuan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={medicationQuantity}
                  onChange={(e) => setMedicationQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <div className="font-medium">
                    {selectedMedication ? availableMedications.find((m) => m.id === selectedMedication)?.satuan : "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Harga Satuan</Label>
                  <div className="font-medium">
                    Rp{" "}
                    {selectedMedication
                      ? (availableMedications.find((m) => m.id === selectedMedication)?.harga || 0).toLocaleString()
                      : "0"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="font-medium">
                    Rp{" "}
                    {selectedMedication
                      ? (
                          (availableMedications.find((m) => m.id === selectedMedication)?.harga || 0) *
                          Number.parseInt(medicationQuantity || "1")
                        ).toLocaleString()
                      : "0"}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!selectedMedication}>
                Tambah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
