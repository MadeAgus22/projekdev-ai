"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Printer, Eye, Pencil, Trash2, CreditCard } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { UserResponseDTO, CreateUserRequestDTO, } from '@/types/dto';


// Define the Billing type
type Billing = {
  id: string
  visitId: string
  patientName: string
  date: string
  subtotal: number
  discount: number
  total: number
  status: "Lunas" | "Belum Lunas"
}

// Sample data
const initialBillings: Billing[] = [
  {
    id: "1",
    visitId: "KJ-001001",
    patientName: "Ahmad Fauzi",
    date: "23-04-2023",
    subtotal: 405000,
    discount: 25000,
    total: 380000,
    status: "Lunas",
  },
  {
    id: "2",
    visitId: "KJ-001002",
    patientName: "Budi Santoso",
    date: "24-04-2023",
    subtotal: 750000,
    discount: 0,
    total: 750000,
    status: "Lunas",
  },
  {
    id: "3",
    visitId: "KJ-001003",
    patientName: "Citra Dewi",
    date: "24-04-2023",
    subtotal: 320000,
    discount: 20000,
    total: 300000,
    status: "Lunas",
  },
  {
    id: "4",
    visitId: "KJ-001004",
    patientName: "Dian Purnama",
    date: "25-04-2023",
    subtotal: 500000,
    discount: 50000,
    total: 450000,
    status: "Belum Lunas",
  },
  {
    id: "5",
    visitId: "KJ-001005",
    patientName: "Eko Prasetyo",
    date: "25-04-2023",
    subtotal: 600000,
    discount: 0,
    total: 600000,
    status: "Belum Lunas",
  },
]

export default function BillingPage() {
  const [billings, setBillings] = useState<Billing[]>(initialBillings)
  const [viewingBilling, setViewingBilling] = useState<Billing | null>(null)
  const [editingBilling, setEditingBilling] = useState<Billing | null>(null)
  const [processingPayment, setProcessingPayment] = useState<Billing | null>(null)
  const { toast } = useToast()

  // Function to update a billing
  const updateBilling = (updatedBilling: Billing) => {
    setBillings(billings.map((b) => (b.id === updatedBilling.id ? updatedBilling : b)))
    toast({
      title: "Pembayaran berhasil diperbarui",
      description: `Data pembayaran untuk ${updatedBilling.patientName} telah diperbarui.`,
    })
  }

  // Function to delete a billing
  const deleteBilling = (id: string) => {
    const billingToDelete = billings.find((b) => b.id === id)
    setBillings(billings.filter((b) => b.id !== id))
    toast({
      title: "Pembayaran berhasil dihapus",
      description: `Pembayaran untuk ${billingToDelete?.patientName} telah dihapus.`,
      variant: "destructive",
    })
  }

  // Function to process a payment
  const processPayment = (id: string, paymentMethod: string) => {
    const updatedBillings = billings.map((b) => {
      if (b.id === id) {
        return { ...b, status: "Lunas" as const }
      }
      return b
    })

    setBillings(updatedBillings)
    setProcessingPayment(null)

    toast({
      title: "Pembayaran berhasil diproses",
      description: `Pembayaran telah diproses menggunakan ${paymentMethod}.`,
    })
  }

  // Function to print a receipt
  const printReceipt = (billing: Billing) => {
    toast({
      title: "Mencetak kwitansi",
      description: `Kwitansi untuk ${billing.patientName} sedang dicetak.`,
    })
    // In a real app, this would trigger a print function
  }

  // Define the columns for the data table
  const columns: ColumnDef<Billing>[] = [
    {
      accessorKey: "visitId",
      header: "ID Kunjungan",
    },
    {
      accessorKey: "patientName",
      header: "Nama Pasien",
    },
    {
      accessorKey: "date",
      header: "Tanggal",
    },
    {
      accessorKey: "subtotal",
      header: "Total (Rp)",
      cell: ({ row }) => {
        return row.original.subtotal.toLocaleString()
      },
    },
    {
      accessorKey: "discount",
      header: "Diskon (Rp)",
      cell: ({ row }) => {
        return row.original.discount.toLocaleString()
      },
    },
    {
      accessorKey: "total",
      header: "Grand Total (Rp)",
      cell: ({ row }) => {
        return row.original.total.toLocaleString()
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status

        return (
          <Badge
            className={
              status === "Lunas"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const billing = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => setViewingBilling(billing)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Lihat</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => printReceipt(billing)}>
              <Printer className="h-4 w-4" />
              <span className="sr-only">Cetak</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setEditingBilling(billing)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            {billing.status === "Belum Lunas" && (
              <Button variant="outline" size="sm" onClick={() => setProcessingPayment(billing)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proses Pembayaran
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Hapus</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Pembayaran</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus pembayaran untuk {billing.patientName}? Tindakan ini tidak dapat
                    dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteBilling(billing.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Billing & Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Kelola pembayaran pasien</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>Daftar pembayaran pasien</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={billings}
            searchColumn="patientName"
            searchPlaceholder="Cari pembayaran..."
          />
        </CardContent>
      </Card>

      {/* View Billing Dialog */}
      {viewingBilling && (
        <Dialog open={!!viewingBilling} onOpenChange={(open) => !open && setViewingBilling(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detail Pembayaran</DialogTitle>
              <DialogDescription>Informasi lengkap pembayaran untuk {viewingBilling.patientName}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID Kunjungan</Label>
                  <div className="font-medium">{viewingBilling.visitId}</div>
                </div>
                <div>
                  <Label>Nama Pasien</Label>
                  <div className="font-medium">{viewingBilling.patientName}</div>
                </div>
                <div>
                  <Label>Tanggal</Label>
                  <div className="font-medium">{viewingBilling.date}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="font-medium">
                    <Badge
                      className={
                        viewingBilling.status === "Lunas"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {viewingBilling.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {viewingBilling.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diskon:</span>
                  <span>Rp {viewingBilling.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>Rp {viewingBilling.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => printReceipt(viewingBilling)}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak Kwitansi
              </Button>
              <DialogClose asChild>
                <Button>Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Billing Dialog */}
      {editingBilling && (
        <Dialog open={!!editingBilling} onOpenChange={(open) => !open && setEditingBilling(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Pembayaran</DialogTitle>
              <DialogDescription>Edit informasi pembayaran untuk {editingBilling.patientName}.</DialogDescription>
            </DialogHeader>
            <BillingForm
              billing={editingBilling}
              onSubmit={(data) => {
                updateBilling({
                  ...editingBilling,
                  ...data,
                })
                setEditingBilling(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Process Payment Dialog */}
      {processingPayment && (
        <Dialog open={!!processingPayment} onOpenChange={(open) => !open && setProcessingPayment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Proses Pembayaran</DialogTitle>
              <DialogDescription>Proses pembayaran untuk {processingPayment.patientName}.</DialogDescription>
            </DialogHeader>
            <PaymentForm
              billing={processingPayment}
              onSubmit={(paymentMethod) => {
                processPayment(processingPayment.id, paymentMethod)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Billing Form Component
interface BillingFormProps {
  billing: Billing
  onSubmit: (data: Pick<Billing, "subtotal" | "discount" | "total" | "status">) => void
}

function BillingForm({ billing, onSubmit }: BillingFormProps) {
  const [subtotal, setSubtotal] = useState(billing.subtotal.toString())
  const [discount, setDiscount] = useState(billing.discount.toString())
  const [status, setStatus] = useState<"Lunas" | "Belum Lunas">(billing.status)

  const subtotalValue = Number.parseInt(subtotal) || 0
  const discountValue = Number.parseInt(discount) || 0
  const total = subtotalValue - discountValue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      subtotal: subtotalValue,
      discount: discountValue,
      total,
      status,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="subtotal">Subtotal (Rp)</Label>
          <Input
            id="subtotal"
            type="number"
            min="0"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="discount">Diskon (Rp)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max={subtotalValue}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="total">Total (Rp)</Label>
          <Input id="total" type="number" value={total} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as "Lunas" | "Belum Lunas")} required>
            <SelectTrigger id="status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lunas">Lunas</SelectItem>
              <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit">Simpan</Button>
      </DialogFooter>
    </form>
  )
}

// Payment Form Component
interface PaymentFormProps {
  billing: Billing
  onSubmit: (paymentMethod: string) => void
}

function PaymentForm({ billing, onSubmit }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(paymentMethod)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex justify-between">
            <span>ID Kunjungan:</span>
            <span>{billing.visitId}</span>
          </div>
          <div className="flex justify-between">
            <span>Nama Pasien:</span>
            <span>{billing.patientName}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{billing.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {billing.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span>Rp {billing.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>Rp {billing.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tunai">Tunai</SelectItem>
              <SelectItem value="Kartu Debit">Kartu Debit</SelectItem>
              <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
              <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
              <SelectItem value="QRIS">QRIS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!paymentMethod}>
          Proses Pembayaran
        </Button>
      </DialogFooter>
    </form>
  )
}
