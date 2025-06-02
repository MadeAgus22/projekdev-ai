import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Sistem Klinik Gigi</h1>
        <p className="text-lg text-muted-foreground">Sistem manajemen klinik gigi berbasis web</p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/dashboard">Masuk ke Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
