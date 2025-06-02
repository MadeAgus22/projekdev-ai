"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReservasiFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
  onSubmit: (data: any) => void
  isWalkin?: boolean
}

export function ReservasiForm({ open, onOpenChange, initialData, onSubmit, isWalkin = false }: ReservasiFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      pasienId: "",
      pasienNama: "",
      dokter: "",
      tanggal: new Date(),
      waktu: "09:00",
      keluhan: "",
      catatan: "",
    },
  )

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  // Dummy data for doctors
  const dokterOptions = [
    { id: "1", nama: "drg. Siti Aisyah" },
    { id: "2", nama: "drg. Hadi Wijaya" },
    { id: "3", nama: "drg. Maya Putri" },
  ]

  // Dummy data for time slots
  const waktuOptions = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isWalkin ? "Tambah Pasien Walk-in" : initialData ? "Edit Reservasi" : "Tambah Reservasi"}
            </DialogTitle>
            <DialogDescription>
              {isWalkin
                ? "Tambahkan pasien walk-in ke antrian hari ini"
                : initialData
                  ? "Edit data reservasi yang sudah ada"
                  : "Buat reservasi baru untuk pasien"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pasienId">ID Pasien</Label>
                <Input
                  id="pasienId"
                  placeholder="Masukkan No. RM"
                  value={formData.pasienId}
                  onChange={(e) => handleChange("pasienId", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pasienNama">Nama Pasien</Label>
                <Input
                  id="pasienNama"
                  placeholder="Nama akan muncul otomatis"
                  value={formData.pasienNama}
                  onChange={(e) => handleChange("pasienNama", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dokter">Dokter</Label>
              <Select value={formData.dokter} onValueChange={(value) => handleChange("dokter", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dokter" />
                </SelectTrigger>
                <SelectContent>
                  {dokterOptions.map((dokter) => (
                    <SelectItem key={dokter.id} value={dokter.id}>
                      {dokter.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.tanggal && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.tanggal ? (
                        format(formData.tanggal, "dd MMMM yyyy", {
                          locale: id,
                        })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.tanggal}
                      onSelect={(date) => handleChange("tanggal", date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktu">Waktu</Label>
                <Select value={formData.waktu} onValueChange={(value) => handleChange("waktu", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    {waktuOptions.map((waktu) => (
                      <SelectItem key={waktu} value={waktu}>
                        {waktu}
                      </SelectItem>
                    ))}
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
                onChange={(e) => handleChange("keluhan", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan Tambahan</Label>
              <Textarea
                id="catatan"
                placeholder="Catatan tambahan (opsional)"
                value={formData.catatan}
                onChange={(e) => handleChange("catatan", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{isWalkin ? "Tambah ke Antrian" : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
