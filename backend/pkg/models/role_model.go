package models

// Role merepresentasikan peran pengguna dalam sistem
type Role struct {
	BaseModel
	Nama      string `gorm:"type:varchar(100);uniqueIndex;not null" json:"nama"`
	Kode      string `gorm:"type:varchar(50);uniqueIndex;not null" json:"kode"` // e.g., "admin", "dokter", "resepsionis"
	Deskripsi string `gorm:"type:text" json:"deskripsi,omitempty"`

	// Relasi Many-to-Many dengan Permission
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}
