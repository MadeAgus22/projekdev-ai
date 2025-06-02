"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
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
import { useToast } from "@/components/ui/use-toast"

// Define the MedicalRecord type
type MedicalRecord = {
  id: string
  visitId: string
  patientName: string
  patientRm: string
  examDate: string
  doctor: string
  diagnosis: string
}

// Sample data
const initialMedicalRecords: MedicalRecord[] = [
  {
    id: "1",
    visitId: "KJ-001001",
    patientName: "Ahmad Fauzi",
    patientRm: "RM-001234",
    examDate: "23-04-2023",
    doctor: "drg. Siti Aisyah",
    diagnosis: "Karies gigi",
  },
  {
    id: "2",
    visitId: "KJ-001002",
    patientName: "Budi Santoso",
    patientRm: "RM-001235",
    examDate: "24-04-2023",
    doctor: "drg. Hadi Wijaya",
    diagnosis: "Maloklusi",
  },
  {
    id: "3",
    visitId: "KJ-001003",
    patientName: "Citra Dewi",
    patientRm: "RM-001236",
    examDate: "24-04-2023",
    doctor: "drg. Siti Aisyah",
    diagnosis: "Gingivitis",
  },
  {
    id: "4",
    visitId: "KJ-001004",
    patientName: "Dian Purnama",
    patientRm: "RM-001237",
    examDate: "25-04-2023",
    doctor: "drg. Hadi Wijaya",
    diagnosis: "Pulpitis",
  },
  {
    id: "5",
    visitId: "KJ-001005",
    patientName: "Eko Prasetyo",
    patientRm: "RM-001238",
    examDate: "25-04-2023",
    doctor: "drg. Siti Aisyah",
    diagnosis: "Periodontitis",
  },
]

export default function RekamMedisPage() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(initialMedicalRecords)
  const router = useRouter()
  const { toast } = useToast()

  // Function to delete a medical record
  const deleteMedicalRecord = (id: string) => {
    const recordToDelete = medicalRecords.find((r) => r.id === id)
    setMedicalRecords(medicalRecords.filter((r) => r.id !== id))
    toast({
      title: "Rekam medis berhasil dihapus",
      description: `Rekam medis untuk ${recordToDelete?.patientName} telah dihapus.`,
      variant: "destructive",
    })
  }

  // Define the columns for the data table
  const columns: ColumnDef<MedicalRecord>[] = [
    {
      accessorKey: "visitId",
      header: "ID Kunjungan",
    },
    {
      accessorKey: "patientName",
      header: "Nama Pasien",
    },
    {
      accessorKey: "patientRm",
      header: "No. RM",
    },
    {
      accessorKey: "examDate",
      header: "Tanggal Periksa",
    },
    {
      accessorKey: "doctor",
      header: "Dokter",
    },
    {
      accessorKey: "diagnosis",
      header: "Diagnosa",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const record = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/rekam-medis/${record.id}`)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Lihat</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/rekam-medis/${record.id}?edit=true`)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Hapus</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Rekam Medis</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus rekam medis untuk {record.patientName}? Tindakan ini tidak dapat
                    dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMedicalRecord(record.id)}
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
          <h1 className="text-xl font-semibold">Rekam Medis Elektronik</h1>
          <p className="text-sm text-muted-foreground">Kelola rekam medis elektronik pasien</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekam Medis</CardTitle>
          <CardDescription>Daftar rekam medis pasien yang telah diperiksa</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={medicalRecords}
            searchColumn="patientName"
            searchPlaceholder="Cari rekam medis..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
