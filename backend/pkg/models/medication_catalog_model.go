package models

// MedicationCatalog merepresentasikan data master untuk obat-obatan dan bahan medis
type MedicationCatalog struct {
	BaseModel
	Kode      string  `gorm:"type:varchar(50);uniqueIndex;not null" json:"kode"`
	Nama      string  `gorm:"type:varchar(255);not null" json:"nama"`
	Satuan    string  `gorm:"type:varchar(50)" json:"satuan"` // Contoh: Tablet, Kapsul, Botol, Tube
	HargaBeli float64 `json:"hargaBeli,omitempty"`            // Harga beli dari supplier (opsional)
	HargaJual float64 `gorm:"not null" json:"hargaJual"`      // Harga jual ke pasien
	Stok      int     `gorm:"default:0" json:"stok"`
	Deskripsi string  `gorm:"type:text" json:"deskripsi,omitempty"`
}
