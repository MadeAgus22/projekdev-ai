package models

// Permission merepresentasikan izin untuk tindakan tertentu dalam sistem
type Permission struct {
	BaseModel
	Nama      string `gorm:"type:varchar(100);uniqueIndex;not null" json:"nama"` // e.g., "Kelola Pasien", "Lihat Laporan Keuangan"
	Kode      string `gorm:"type:varchar(100);uniqueIndex;not null" json:"kode"` // e.g., "patient:create", "patient:read", "report:finance"
	Deskripsi string `gorm:"type:text" json:"deskripsi,omitempty"`
	Grup      string `gorm:"type:varchar(50)" json:"grup,omitempty"` // Untuk mengelompokkan permission, e.g., "Pasien", "EMR"

	// Roles []Role `gorm:"many2many:role_permissions;" json:"-"` // Balik relasi jika perlu, tapi biasanya tidak untuk response dasar
}
