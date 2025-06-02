"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Upload, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { OrthodontogramChart } from "@/components/orthodontogram-chart"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
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

// Define types
type Treatment = {
  id: string
  code: string
  name: string
  tooth: string
  price: number
  discount: number
  total: number
}

type Medication = {
  id: string
  code: string
  name: string
  quantity: number
  unit: string
  price: number
  total: number
}

type EMR = {
  id: string
  visitId: string
  patientName: string
  patientRm: string
  birthDate: string
  gender: string
  phone: string
  address: string
  examDate: string
  doctor: string
  visitType: string
  complaint: string
  examination: string
  diagnosis: string
  treatment: string
  notes: string
  treatments: Treatment[]
  medications: Medication[]
  orthodontogramData: Record<string, { status: string; notes: string }>
}

// Sample treatments and medications
const availableTreatments = [
  { code: "T001", name: "Konsultasi", price: 100000 },
  { code: "T002", name: "Scaling", price: 200000 },
  { code: "T003", name: "Tambal Amalgam", price: 150000 },
  { code: "T004", name: "Tambal Composite", price: 200000 },
  { code: "T005", name: "Ekstraksi Sederhana", price: 250000 },
  { code: "T006", name: "Ekstraksi Komplikasi", price: 350000 },
  { code: "T007", name: "Perawatan Saluran Akar", price: 500000 },
  { code: "T008", name: "Mahkota Porcelain", price: 1000000 },
  { code: "T009", name: "Mahkota Metal", price: 750000 },
  { code: "T010", name: "Gigi Tiruan Sebagian", price: 1500000 },
  { code: "T011", name: "Gigi Tiruan Penuh", price: 2500000 },
  { code: "T012", name: "Pemasangan Kawat Gigi", price: 3500000 },
  { code: "T013", name: "Kontrol Kawat Gigi", price: 200000 },
  { code: "T014", name: "Bleaching", price: 1000000 },
  { code: "T015", name: "Trepanasi", price: 250000 },
]

const availableMedications = [
  { code: "O001", name: "Paracetamol 500mg", price: 2000, unit: "Tablet" },
  { code: "O002", name: "Ibuprofen 400mg", price: 3000, unit: "Tablet" },
  { code: "O003", name: "Amoxicillin 500mg", price: 5000, unit: "Tablet" },
  { code: "O004", name: "Metronidazole 500mg", price: 4000, unit: "Tablet" },
  { code: "O005", name: "Asam Mefenamat 500mg", price: 3000, unit: "Tablet" },
  { code: "O006", name: "Chlorhexidine 0.2% 100ml", price: 25000, unit: "Botol" },
  { code: "O007", name: "Povidone Iodine 10% 60ml", price: 20000, unit: "Botol" },
  { code: "O008", name: "Hydrogen Peroxide 3% 100ml", price: 15000, unit: "Botol" },
  { code: "O009", name: "Lidocaine Gel 2% 15g", price: 30000, unit: "Tube" },
  { code: "O010", name: "Benzocaine Gel 20% 15g", price: 35000, unit: "Tube" },
]

// Sample EMR data
const sampleEmr: EMR = {
  id: "1",
  visitId: "KJ-001001",
  patientName: "Ahmad Fauzi",
  patientRm: "RM-001234",
  birthDate: "15-05-1985",
  gender: "Laki-laki",
  phone: "081234567890",
  address: "Jl. Merdeka No. 123, Jakarta",
  examDate: "23-04-2023",
  doctor: "drg. Siti Aisyah",
  visitType: "Pemeriksaan Rutin",
  complaint:
    "Sakit gigi bagian belakang kanan atas sejak 3 hari yang lalu. Nyeri terutama saat makan makanan dingin atau panas.",
  examination:
    "Terdapat karies pada gigi 16 dengan kedalaman mencapai pulpa. Tes termal positif. Perkusi vertikal positif.",
  diagnosis: "Karies gigi dengan pulpitis irreversibel pada gigi 16.",
  treatment: "1. Perawatan saluran akar pada gigi 16\n2. Restorasi dengan mahkota porcelain fused to metal",
  notes: "Pasien memiliki riwayat hipertensi, sedang mengonsumsi obat Captopril 25mg 2x sehari.",
  treatments: [
    {
      id: "1",
      code: "T001",
      name: "Konsultasi",
      tooth: "-",
      price: 100000,
      discount: 0,
      total: 100000,
    },
    {
      id: "2",
      code: "T015",
      name: "Trepanasi",
      tooth: "16",
      price: 250000,
      discount: 10,
      total: 225000,
    },
  ],
  medications: [
    {
      id: "1",
      code: "O003",
      name: "Amoxicillin 500mg",
      quantity: 10,
      unit: "Tablet",
      price: 5000,
      total: 50000,
    },
    {
      id: "2",
      code: "O005",
      name: "Asam Mefenamat 500mg",
      quantity: 10,
      unit: "Tablet",
      price: 3000,
      total: 30000,
    },
  ],
  orthodontogramData: {},
}

export default function RekamMedisDetailPage({ params }: { params: { id: string } }) {
  const [emr, setEmr] = useState<EMR>(sampleEmr)
  const [isEditing, setIsEditing] = useState(false)
  const [addingTreatment, setAddingTreatment] = useState(false)
  const [addingMedication, setAddingMedication] = useState(false)
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([])
  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Check if we should be in edit mode
  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditing(true)
    }
  }, [searchParams])

  // Function to save EMR changes
  const saveEmr = () => {
    // In a real app, this would send data to the backend
    toast({
      title: "Rekam medis berhasil disimpan",
      description: `Perubahan pada rekam medis ${emr.patientName} telah disimpan.`,
    })
    setIsEditing(false)
  }

  // Function to add a new treatment
  const addTreatment = (treatment: Omit<Treatment, "id">) => {
    const newTreatment: Treatment = {
      id: (emr.treatments.length + 1).toString(),
      ...treatment,
    }

    setEmr({
      ...emr,
      treatments: [...emr.treatments, newTreatment],
    })

    setAddingTreatment(false)
    toast({
      title: "Tindakan berhasil ditambahkan",
      description: `${newTreatment.name} telah ditambahkan ke daftar tindakan.`,
    })
  }

  // Function to add a new medication
  const addMedication = (medication: Omit<Medication, "id">) => {
    const newMedication: Medication = {
      id: (emr.medications.length + 1).toString(),
      ...medication,
    }

    setEmr({
      ...emr,
      medications: [...emr.medications, newMedication],
    })

    setAddingMedication(false)
    toast({
      title: "Obat berhasil ditambahkan",
      description: `${newMedication.name} telah ditambahkan ke daftar obat.`,
    })
  }

  // Function to remove a treatment
  const removeTreatment = (id: string) => {
    setEmr({
      ...emr,
      treatments: emr.treatments.filter((t) => t.id !== id),
    })

    toast({
      title: "Tindakan berhasil dihapus",
      description: "Tindakan telah dihapus dari daftar.",
    })
  }

  // Function to remove a medication
  const removeMedication = (id: string) => {
    setEmr({
      ...emr,
      medications: emr.medications.filter((m) => m.id !== id),
    })

    toast({
      title: "Obat berhasil dihapus",
      description: "Obat telah dihapus dari daftar.",
    })
  }

  // Function to toggle treatment selection
  const toggleTreatmentSelection = (id: string) => {
    setSelectedTreatments((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Function to toggle medication selection
  const toggleMedicationSelection = (id: string) => {
    setSelectedMedications((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Calculate totals
  const treatmentsTotal = emr.treatments.reduce((sum, t) => sum + t.total, 0)
  const medicationsTotal = emr.medications.reduce((sum, m) => sum + m.total, 0)
  const discountTotal = emr.treatments.reduce((sum, t) => sum + (t.price * t.discount) / 100, 0)
  const grandTotal = treatmentsTotal + medicationsTotal

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/rekam-medis">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Detail Rekam Medis</h1>
          <p className="text-sm text-muted-foreground">ID Kunjungan: {emr.visitId}</p>
        </div>
        {isEditing ? (
          <Button className="ml-auto" onClick={saveEmr}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Perubahan
          </Button>
        ) : (
          <Button className="ml-auto" onClick={() => setIsEditing(true)}>
            Edit Rekam Medis
          </Button>
        )}
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
                <div className="font-medium">{emr.patientName}</div>
              </div>
              <div>
                <Label>No. RM</Label>
                <div className="font-medium">{emr.patientRm}</div>
              </div>
              <div>
                <Label>Tanggal Lahir</Label>
                <div className="font-medium">{emr.birthDate}</div>
              </div>
              <div>
                <Label>Jenis Kelamin</Label>
                <div className="font-medium">{emr.gender}</div>
              </div>
              <div>
                <Label>No. Telepon</Label>
                <div className="font-medium">{emr.phone}</div>
              </div>
              <div>
                <Label>Alamat</Label>
                <div className="font-medium">{emr.address}</div>
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
                <div className="font-medium">{emr.examDate}</div>
              </div>
              <div>
                <Label>Dokter</Label>
                <div className="font-medium">{emr.doctor}</div>
              </div>
              <div>
                <Label>Jenis Kunjungan</Label>
                <div className="font-medium">{emr.visitType}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="emr" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emr">Rekam Medis</TabsTrigger>
          <TabsTrigger value="orthodontogram">Orthodontogram</TabsTrigger>
          <TabsTrigger value="tindakan">Tindakan & Obat</TabsTrigger>
          <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
        </TabsList>
        <TabsContent value="emr" className="space-y-4">
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
                  value={emr.complaint}
                  onChange={(e) => setEmr({ ...emr, complaint: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemeriksaan">Hasil Pemeriksaan</Label>
                <Textarea
                  id="pemeriksaan"
                  placeholder="Masukkan hasil pemeriksaan"
                  value={emr.examination}
                  onChange={(e) => setEmr({ ...emr, examination: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosa">Diagnosa</Label>
                <Textarea
                  id="diagnosa"
                  placeholder="Masukkan diagnosa"
                  value={emr.diagnosis}
                  onChange={(e) => setEmr({ ...emr, diagnosis: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rencana">Rencana Perawatan</Label>
                <Textarea
                  id="rencana"
                  placeholder="Masukkan rencana perawatan"
                  value={emr.treatment}
                  onChange={(e) => setEmr({ ...emr, treatment: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
                <Textarea
                  id="catatan"
                  placeholder="Masukkan catatan tambahan"
                  value={emr.notes}
                  onChange={(e) => setEmr({ ...emr, notes: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orthodontogram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orthodontogram</CardTitle>
              <CardDescription>Diagram kondisi gigi pasien</CardDescription>
            </CardHeader>
            <CardContent>
              <OrthodontogramChart
                initialData={emr.orthodontogramData}
                readOnly={!isEditing}
                onDataChange={(data) => setEmr({ ...emr, orthodontogramData: data })}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tindakan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tindakan & Obat</CardTitle>
              <CardDescription>Daftar tindakan dan obat yang diberikan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Tindakan</h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setAddingTreatment(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Tindakan
                    </Button>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">{isEditing && <Checkbox />}</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Tindakan</TableHead>
                      <TableHead>Gigi</TableHead>
                      <TableHead>Harga (Rp)</TableHead>
                      <TableHead>Diskon (%)</TableHead>
                      <TableHead>Total (Rp)</TableHead>
                      {isEditing && <TableHead className="text-right">Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emr.treatments.map((treatment) => (
                      <TableRow key={treatment.id}>
                        <TableCell>
                          {isEditing && (
                            <Checkbox
                              checked={selectedTreatments.includes(treatment.id)}
                              onCheckedChange={() => toggleTreatmentSelection(treatment.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>{treatment.code}</TableCell>
                        <TableCell>{treatment.name}</TableCell>
                        <TableCell>{treatment.tooth}</TableCell>
                        <TableCell>{treatment.price.toLocaleString()}</TableCell>
                        <TableCell>{treatment.discount}</TableCell>
                        <TableCell>{treatment.total.toLocaleString()}</TableCell>
                        {isEditing && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => removeTreatment(treatment.id)}>
                              Hapus
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Obat & Bahan</h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setAddingMedication(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Obat
                    </Button>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">{isEditing && <Checkbox />}</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Obat/Bahan</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Harga (Rp)</TableHead>
                      <TableHead>Total (Rp)</TableHead>
                      {isEditing && <TableHead className="text-right">Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emr.medications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell>
                          {isEditing && (
                            <Checkbox
                              checked={selectedMedications.includes(medication.id)}
                              onCheckedChange={() => toggleMedicationSelection(medication.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>{medication.code}</TableCell>
                        <TableCell>{medication.name}</TableCell>
                        <TableCell>{medication.quantity}</TableCell>
                        <TableCell>{medication.unit}</TableCell>
                        <TableCell>{medication.price.toLocaleString()}</TableCell>
                        <TableCell>{medication.total.toLocaleString()}</TableCell>
                        {isEditing && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => removeMedication(medication.id)}>
                              Hapus
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <div className="w-72 space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span>Subtotal Tindakan:</span>
                    <span>Rp {treatmentsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Obat:</span>
                    <span>Rp {medicationsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon:</span>
                    <span>Rp {discountTotal.toLocaleString()}</span>
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
        <TabsContent value="lampiran" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lampiran</CardTitle>
              <CardDescription>Foto rontgen dan lampiran lainnya</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex items-center justify-center border-2 border-dashed p-8 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium">Upload File</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop file di sini, atau klik untuk memilih file
                    </p>
                    <Input type="file" className="hidden" id="file-upload" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                      Pilih File
                    </Button>
                    <p className="text-xs text-muted-foreground">Format yang didukung: JPG, PNG, PDF. Maksimal 5MB</p>
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <img
                        src="/placeholder.svg?height=200&width=200"
                        alt="Foto Rontgen"
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Foto Rontgen Panoramik</h4>
                        <p className="text-xs text-muted-foreground">Diupload pada: 23-04-2023</p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <img
                        src="/placeholder.svg?height=200&width=200"
                        alt="Foto Intraoral"
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Foto Intraoral</h4>
                        <p className="text-xs text-muted-foreground">Diupload pada: 23-04-2023</p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Dialog */}
      {addingTreatment && (
        <Dialog open={addingTreatment} onOpenChange={setAddingTreatment}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Tindakan</DialogTitle>
              <DialogDescription>Tambahkan tindakan baru ke rekam medis.</DialogDescription>
            </DialogHeader>
            <TreatmentForm onSubmit={addTreatment} />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Medication Dialog */}
      {addingMedication && (
        <Dialog open={addingMedication} onOpenChange={setAddingMedication}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Obat</DialogTitle>
              <DialogDescription>Tambahkan obat baru ke rekam medis.</DialogDescription>
            </DialogHeader>
            <MedicationForm onSubmit={addMedication} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Treatment Form Component
interface TreatmentFormProps {
  treatment?: Treatment
  onSubmit: (data: Omit<Treatment, "id">) => void
}

function TreatmentForm({ treatment, onSubmit }: TreatmentFormProps) {
  const [selectedTreatment, setSelectedTreatment] = useState(treatment?.code || "")
  const [tooth, setTooth] = useState(treatment?.tooth || "")
  const [discount, setDiscount] = useState(treatment?.discount.toString() || "0")

  const selectedTreatmentData = availableTreatments.find((t) => t.code === selectedTreatment)
  const price = selectedTreatmentData?.price || 0
  const discountValue = Number.parseInt(discount) || 0
  const total = price - (price * discountValue) / 100

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTreatmentData) return

    onSubmit({
      code: selectedTreatmentData.code,
      name: selectedTreatmentData.name,
      tooth,
      price,
      discount: discountValue,
      total,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="treatment">Tindakan</Label>
          <Select value={selectedTreatment} onValueChange={setSelectedTreatment} required>
            <SelectTrigger id="treatment">
              <SelectValue placeholder="Pilih tindakan" />
            </SelectTrigger>
            <SelectContent>
              {availableTreatments.map((treatment) => (
                <SelectItem key={treatment.code} value={treatment.code}>
                  {treatment.name} - Rp {treatment.price.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tooth">Gigi</Label>
          <Input
            id="tooth"
            value={tooth}
            onChange={(e) => setTooth(e.target.value)}
            placeholder="Masukkan nomor gigi (opsional)"
          />
        </div>
        <div className="grid gap-2">
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
          <div>
            <Label>Harga</Label>
            <div className="font-medium">Rp {price.toLocaleString()}</div>
          </div>
          <div>
            <Label>Total Setelah Diskon</Label>
            <div className="font-medium">Rp {total.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!selectedTreatmentData}>
          Simpan
        </Button>
      </DialogFooter>
    </form>
  )
}

// Medication Form Component
interface MedicationFormProps {
  medication?: Medication
  onSubmit: (data: Omit<Medication, "id">) => void
}

function MedicationForm({ medication, onSubmit }: MedicationFormProps) {
  const [selectedMedication, setSelectedMedication] = useState(medication?.code || "")
  const [quantity, setQuantity] = useState(medication?.quantity.toString() || "1")

  const selectedMedicationData = availableMedications.find((m) => m.code === selectedMedication)
  const price = selectedMedicationData?.price || 0
  const unit = selectedMedicationData?.unit || ""
  const quantityValue = Number.parseInt(quantity) || 1
  const total = price * quantityValue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMedicationData) return

    onSubmit({
      code: selectedMedicationData.code,
      name: selectedMedicationData.name,
      quantity: quantityValue,
      unit,
      price,
      total,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="medication">Obat</Label>
          <Select value={selectedMedication} onValueChange={setSelectedMedication} required>
            <SelectTrigger id="medication">
              <SelectValue placeholder="Pilih obat" />
            </SelectTrigger>
            <SelectContent>
              {availableMedications.map((medication) => (
                <SelectItem key={medication.code} value={medication.code}>
                  {medication.name} - Rp {medication.price.toLocaleString()}/{medication.unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quantity">Jumlah</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Satuan</Label>
            <div className="font-medium">{unit}</div>
          </div>
          <div>
            <Label>Harga Satuan</Label>
            <div className="font-medium">Rp {price.toLocaleString()}</div>
          </div>
          <div>
            <Label>Total</Label>
            <div className="font-medium">Rp {total.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!selectedMedicationData}>
          Simpan
        </Button>
      </DialogFooter>
    </form>
  )
}
