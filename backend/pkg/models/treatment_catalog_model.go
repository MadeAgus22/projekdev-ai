package models

// TreatmentCatalog merepresentasikan data master untuk jenis-jenis tindakan/layanan
type TreatmentCatalog struct {
	BaseModel
	Kode      string  `gorm:"type:varchar(50);uniqueIndex;not null" json:"kode"`
	Nama      string  `gorm:"type:varchar(255);not null" json:"nama"`
	Kategori  string  `gorm:"type:varchar(100)" json:"kategori,omitempty"` // Contoh: Umum, Bedah, Restoratif
	Harga     float64 `gorm:"not null" json:"harga"`
	Deskripsi string  `gorm:"type:text" json:"deskripsi,omitempty"`
}
