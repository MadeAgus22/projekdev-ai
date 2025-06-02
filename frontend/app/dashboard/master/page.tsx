"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { UserResponseDTO, CreateUserRequestDTO, } from '@/types/dto';

// Dummy data for treatments
const dummyTreatments = [
  { id: "1", kode: "T001", nama: "Konsultasi", harga: 100000, kategori: "Umum" },
  { id: "2", kode: "T002", nama: "Scaling", harga: 200000, kategori: "Preventif" },
  { id: "3", kode: "T003", nama: "Tambal Amalgam", harga: 150000, kategori: "Restoratif" },
  { id: "4", kode: "T004", nama: "Tambal Composite", harga: 200000, kategori: "Restoratif" },
  { id: "5", kode: "T005", nama: "Ekstraksi Sederhana", harga: 250000, kategori: "Bedah" },
  { id: "6", kode: "T006", nama: "Ekstraksi Komplikasi", harga: 350000, kategori: "Bedah" },
  { id: "7", kode: "T007", nama: "Perawatan Saluran Akar", harga: 500000, kategori: "Endodontik" },
  { id: "8", kode: "T008", nama: "Mahkota Porcelain", harga: 1000000, kategori: "Prostodonti" },
  { id: "9", kode: "T009", nama: "Mahkota Metal", harga: 750000, kategori: "Prostodonti" },
  { id: "10", kode: "T010", nama: "Gigi Tiruan Sebagian", harga: 1500000, kategori: "Prostodonti" },
]

// Dummy data for medications
const dummyMedications = [
  { id: "1", kode: "O001", nama: "Paracetamol 500mg", harga: 2000, satuan: "Tablet", stok: 100 },
  { id: "2", kode: "O002", nama: "Ibuprofen 400mg", harga: 3000, satuan: "Tablet", stok: 80 },
  { id: "3", kode: "O003", nama: "Amoxicillin 500mg", harga: 5000, satuan: "Tablet", stok: 120 },
  { id: "4", kode: "O004", nama: "Metronidazole 500mg", harga: 4000, satuan: "Tablet", stok: 90 },
  { id: "5", kode: "O005", nama: "Asam Mefenamat 500mg", harga: 3000, satuan: "Tablet", stok: 75 },
  { id: "6", kode: "O006", nama: "Chlorhexidine 0.2% 100ml", harga: 25000, satuan: "Botol", stok: 30 },
  { id: "7", kode: "O007", nama: "Povidone Iodine 10% 60ml", harga: 20000, satuan: "Botol", stok: 25 },
  { id: "8", kode: "O008", nama: "Hydrogen Peroxide 3% 100ml", harga: 15000, satuan: "Botol", stok: 20 },
]

export default function MasterPage() {
  const [treatments, setTreatments] = useState(dummyTreatments)
  const [medications, setMedications] = useState(dummyMedications)
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false)
  const [isEditTreatmentModalOpen, setIsEditTreatmentModalOpen] = useState(false)
  const [isDeleteTreatmentModalOpen, setIsDeleteTreatmentModalOpen] = useState(false)
  const [isAddMedicationModalOpen, setIsAddMedicationModalOpen] = useState(false)
  const [isEditMedicationModalOpen, setIsEditMedicationModalOpen] = useState(false)
  const [isDeleteMedicationModalOpen, setIsDeleteMedicationModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("tindakan")
  const [treatmentForm, setTreatmentForm] = useState({
    kode: "",
    nama: "",
    harga: "",
    kategori: "Umum",
  })
  const [medicationForm, setMedicationForm] = useState({
    kode: "",
    nama: "",
    harga: "",
    satuan: "Tablet",
    stok: "",
  })
  const { toast } = useToast()

  // Treatment handlers
  const handleAddTreatment = () => {
    const newTreatment = {
      id: Date.now().toString(),
      kode: treatmentForm.kode,
      nama: treatmentForm.nama,
      harga: Number.parseInt(treatmentForm.harga),
      kategori: treatmentForm.kategori,
    }
    setTreatments([...treatments, newTreatment])
    setIsAddTreatmentModalOpen(false)
    resetTreatmentForm()
    toast({
      title: "Tindakan berhasil ditambahkan",
      description: `${newTreatment.nama} telah ditambahkan ke daftar tindakan.`,
    })
  }

  const handleEditTreatment = () => {
    const updatedTreatments = treatments.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            kode: treatmentForm.kode,
            nama: treatmentForm.nama,
            harga: Number.parseInt(treatmentForm.harga),
            kategori: treatmentForm.kategori,
          }
        : item,
    )
    setTreatments(updatedTreatments)
    setIsEditTreatmentModalOpen(false)
    resetTreatmentForm()
    toast({
      title: "Tindakan berhasil diperbarui",
      description: `${treatmentForm.nama} telah diperbarui.`,
    })
  }

  const handleDeleteTreatment = () => {
    setTreatments(treatments.filter((item) => item.id !== selectedItem.id))
    setIsDeleteTreatmentModalOpen(false)
    toast({
      title: "Tindakan berhasil dihapus",
      description: `${selectedItem.nama} telah dihapus dari daftar tindakan.`,
    })
  }

  // Medication handlers
  const handleAddMedication = () => {
    const newMedication = {
      id: Date.now().toString(),
      kode: medicationForm.kode,
      nama: medicationForm.nama,
      harga: Number.parseInt(medicationForm.harga),
      satuan: medicationForm.satuan,
      stok: Number.parseInt(medicationForm.stok),
    }
    setMedications([...medications, newMedication])
    setIsAddMedicationModalOpen(false)
    resetMedicationForm()
    toast({
      title: "Obat berhasil ditambahkan",
      description: `${newMedication.nama} telah ditambahkan ke daftar obat.`,
    })
  }

  const handleEditMedication = () => {
    const updatedMedications = medications.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            kode: medicationForm.kode,
            nama: medicationForm.nama,
            harga: Number.parseInt(medicationForm.harga),
            satuan: medicationForm.satuan,
            stok: Number.parseInt(medicationForm.stok),
          }
        : item,
    )
    setMedications(updatedMedications)
    setIsEditMedicationModalOpen(false)
    resetMedicationForm()
    toast({
      title: "Obat berhasil diperbarui",
      description: `${medicationForm.nama} telah diperbarui.`,
    })
  }

  const handleDeleteMedication = () => {
    setMedications(medications.filter((item) => item.id !== selectedItem.id))
    setIsDeleteMedicationModalOpen(false)
    toast({
      title: "Obat berhasil dihapus",
      description: `${selectedItem.nama} telah dihapus dari daftar obat.`,
    })
  }

  // Form handlers
  const handleTreatmentFormChange = (field: string, value: string) => {
    setTreatmentForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMedicationFormChange = (field: string, value: string) => {
    setMedicationForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetTreatmentForm = () => {
    setTreatmentForm({
      kode: "",
      nama: "",
      harga: "",
      kategori: "Umum",
    })
  }

  const resetMedicationForm = () => {
    setMedicationForm({
      kode: "",
      nama: "",
      harga: "",
      satuan: "Tablet",
      stok: "",
    })
  }

  const openEditTreatmentModal = (treatment: any) => {
    setSelectedItem(treatment)
    setTreatmentForm({
      kode: treatment.kode,
      nama: treatment.nama,
      harga: treatment.harga.toString(),
      kategori: treatment.kategori,
    })
    setIsEditTreatmentModalOpen(true)
  }

  const openEditMedicationModal = (medication: any) => {
    setSelectedItem(medication)
    setMedicationForm({
      kode: medication.kode,
      nama: medication.nama,
      harga: medication.harga.toString(),
      satuan: medication.satuan,
      stok: medication.stok.toString(),
    })
    setIsEditMedicationModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Master Data</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tindakan">Tindakan</TabsTrigger>
          <TabsTrigger value="obat">Obat & Bahan</TabsTrigger>
        </TabsList>

        <TabsContent value="tindakan" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Tindakan</CardTitle>
              <Button onClick={() => setIsAddTreatmentModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tindakan
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Tindakan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga (Rp)</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell>{treatment.kode}</TableCell>
                      <TableCell>{treatment.nama}</TableCell>
                      <TableCell>{treatment.kategori}</TableCell>
                      <TableCell>{treatment.harga.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditTreatmentModal(treatment)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(treatment)
                              setIsDeleteTreatmentModalOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obat" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Obat & Bahan</CardTitle>
              <Button onClick={() => setIsAddMedicationModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Obat
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Obat/Bahan</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Harga (Rp)</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((medication) => (
                    <TableRow key={medication.id}>
                      <TableCell>{medication.kode}</TableCell>
                      <TableCell>{medication.nama}</TableCell>
                      <TableCell>{medication.satuan}</TableCell>
                      <TableCell>{medication.harga.toLocaleString()}</TableCell>
                      <TableCell>{medication.stok}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditMedicationModal(medication)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(medication)
                              setIsDeleteMedicationModalOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Modal */}
      <Dialog open={isAddTreatmentModalOpen} onOpenChange={setIsAddTreatmentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Tindakan</DialogTitle>
            <DialogDescription>Tambahkan tindakan baru ke daftar tindakan</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Tindakan</Label>
              <Input
                id="kode"
                value={treatmentForm.kode}
                onChange={(e) => handleTreatmentFormChange("kode", e.target.value)}
                placeholder="Contoh: T011"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Tindakan</Label>
              <Input
                id="nama"
                value={treatmentForm.nama}
                onChange={(e) => handleTreatmentFormChange("nama", e.target.value)}
                placeholder="Nama tindakan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={treatmentForm.kategori}
                onValueChange={(value) => handleTreatmentFormChange("kategori", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Umum">Umum</SelectItem>
                  <SelectItem value="Preventif">Preventif</SelectItem>
                  <SelectItem value="Restoratif">Restoratif</SelectItem>
                  <SelectItem value="Bedah">Bedah</SelectItem>
                  <SelectItem value="Endodontik">Endodontik</SelectItem>
                  <SelectItem value="Prostodonti">Prostodonti</SelectItem>
                  <SelectItem value="Ortodonti">Ortodonti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="harga">Harga (Rp)</Label>
              <Input
                id="harga"
                type="number"
                value={treatmentForm.harga}
                onChange={(e) => handleTreatmentFormChange("harga", e.target.value)}
                placeholder="Harga tindakan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTreatmentModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddTreatment}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Treatment Modal */}
      <Dialog open={isEditTreatmentModalOpen} onOpenChange={setIsEditTreatmentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tindakan</DialogTitle>
            <DialogDescription>Edit informasi tindakan</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-kode">Kode Tindakan</Label>
              <Input
                id="edit-kode"
                value={treatmentForm.kode}
                onChange={(e) => handleTreatmentFormChange("kode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Tindakan</Label>
              <Input
                id="edit-nama"
                value={treatmentForm.nama}
                onChange={(e) => handleTreatmentFormChange("nama", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kategori">Kategori</Label>
              <Select
                value={treatmentForm.kategori}
                onValueChange={(value) => handleTreatmentFormChange("kategori", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Umum">Umum</SelectItem>
                  <SelectItem value="Preventif">Preventif</SelectItem>
                  <SelectItem value="Restoratif">Restoratif</SelectItem>
                  <SelectItem value="Bedah">Bedah</SelectItem>
                  <SelectItem value="Endodontik">Endodontik</SelectItem>
                  <SelectItem value="Prostodonti">Prostodonti</SelectItem>
                  <SelectItem value="Ortodonti">Ortodonti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-harga">Harga (Rp)</Label>
              <Input
                id="edit-harga"
                type="number"
                value={treatmentForm.harga}
                onChange={(e) => handleTreatmentFormChange("harga", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTreatmentModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditTreatment}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Treatment Modal */}
      <Dialog open={isDeleteTreatmentModalOpen} onOpenChange={setIsDeleteTreatmentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hapus Tindakan</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus tindakan {selectedItem?.nama}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTreatmentModalOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteTreatment}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medication Modal */}
      <Dialog open={isAddMedicationModalOpen} onOpenChange={setIsAddMedicationModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Obat</DialogTitle>
            <DialogDescription>Tambahkan obat baru ke daftar obat</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="med-kode">Kode Obat</Label>
              <Input
                id="med-kode"
                value={medicationForm.kode}
                onChange={(e) => handleMedicationFormChange("kode", e.target.value)}
                placeholder="Contoh: O009"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-nama">Nama Obat</Label>
              <Input
                id="med-nama"
                value={medicationForm.nama}
                onChange={(e) => handleMedicationFormChange("nama", e.target.value)}
                placeholder="Nama obat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-satuan">Satuan</Label>
              <Select
                value={medicationForm.satuan}
                onValueChange={(value) => handleMedicationFormChange("satuan", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Kapsul">Kapsul</SelectItem>
                  <SelectItem value="Botol">Botol</SelectItem>
                  <SelectItem value="Ampul">Ampul</SelectItem>
                  <SelectItem value="Tube">Tube</SelectItem>
                  <SelectItem value="Sachet">Sachet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-harga">Harga (Rp)</Label>
              <Input
                id="med-harga"
                type="number"
                value={medicationForm.harga}
                onChange={(e) => handleMedicationFormChange("harga", e.target.value)}
                placeholder="Harga obat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-stok">Stok</Label>
              <Input
                id="med-stok"
                type="number"
                value={medicationForm.stok}
                onChange={(e) => handleMedicationFormChange("stok", e.target.value)}
                placeholder="Jumlah stok"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMedicationModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddMedication}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medication Modal */}
      <Dialog open={isEditMedicationModalOpen} onOpenChange={setIsEditMedicationModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Obat</DialogTitle>
            <DialogDescription>Edit informasi obat</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-med-kode">Kode Obat</Label>
              <Input
                id="edit-med-kode"
                value={medicationForm.kode}
                onChange={(e) => handleMedicationFormChange("kode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-med-nama">Nama Obat</Label>
              <Input
                id="edit-med-nama"
                value={medicationForm.nama}
                onChange={(e) => handleMedicationFormChange("nama", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-med-satuan">Satuan</Label>
              <Select
                value={medicationForm.satuan}
                onValueChange={(value) => handleMedicationFormChange("satuan", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Kapsul">Kapsul</SelectItem>
                  <SelectItem value="Botol">Botol</SelectItem>
                  <SelectItem value="Ampul">Ampul</SelectItem>
                  <SelectItem value="Tube">Tube</SelectItem>
                  <SelectItem value="Sachet">Sachet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-med-harga">Harga (Rp)</Label>
              <Input
                id="edit-med-harga"
                type="number"
                value={medicationForm.harga}
                onChange={(e) => handleMedicationFormChange("harga", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-med-stok">Stok</Label>
              <Input
                id="edit-med-stok"
                type="number"
                value={medicationForm.stok}
                onChange={(e) => handleMedicationFormChange("stok", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMedicationModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditMedication}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Medication Modal */}
      <Dialog open={isDeleteMedicationModalOpen} onOpenChange={setIsDeleteMedicationModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hapus Obat</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus obat {selectedItem?.nama}?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteMedicationModalOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedication}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
