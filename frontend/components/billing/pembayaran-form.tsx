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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface PembayaranFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
  onSubmit: (data: any) => void
}

export function PembayaranForm({ open, onOpenChange, initialData, onSubmit }: PembayaranFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      metodePembayaran: "tunai",
      jumlahBayar: "",
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

  // Dummy data for payment methods
  const metodePembayaranOptions = [
    { value: "tunai", label: "Tunai" },
    { value: "debit", label: "Kartu Debit" },
    { value: "kredit", label: "Kartu Kredit" },
    { value: "transfer", label: "Transfer Bank" },
    { value: "qris", label: "QRIS" },
    { value: "asuransi", label: "Asuransi" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Proses Pembayaran</DialogTitle>
            <DialogDescription>Proses pembayaran untuk kunjungan pasien</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="metodePembayaran">Metode Pembayaran</Label>
              <Select
                value={formData.metodePembayaran}
                onValueChange={(value) => handleChange("metodePembayaran", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  {metodePembayaranOptions.map((metode) => (
                    <SelectItem key={metode.value} value={metode.value}>
                      {metode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlahBayar">Jumlah Bayar (Rp)</Label>
              <Input
                id="jumlahBayar"
                type="number"
                min="0"
                step="1000"
                value={formData.jumlahBayar}
                onChange={(e) => handleChange("jumlahBayar", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
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
            <Button type="submit">Proses Pembayaran</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
