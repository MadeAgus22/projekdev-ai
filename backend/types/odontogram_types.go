package types

// ToothCondition merepresentasikan kondisi gigi.
type ToothCondition string

// Definisi konstanta untuk ToothCondition.
const (
	Normal    ToothCondition = "normal"
	Caries    ToothCondition = "caries"
	Filling   ToothCondition = "filling"
	Missing   ToothCondition = "missing"
	Crown     ToothCondition = "crown"
	RootCanal ToothCondition = "root-canal"
	Implant   ToothCondition = "implant"
)

// ToothHistoryEntry merepresentasikan satu entri dalam riwayat kondisi gigi.
type ToothHistoryEntry struct {
	Date   string         `json:"date" gorm:"type:date"`
	Doctor string         `json:"doctor"`
	From   ToothCondition `json:"from" gorm:"type:varchar(50)"`
	To     ToothCondition `json:"to" gorm:"type:varchar(50)"`
	Note   string         `json:"note" gorm:"type:text"`
}

// ToothData merepresentasikan data sebuah gigi, termasuk kondisi dan riwayatnya.
// Ini akan menjadi bagian dari OdontogramData di model EMR.
type ToothData struct {
	Condition ToothCondition      `json:"condition" gorm:"type:varchar(50)"`
	Treatment *string             `json:"treatment,omitempty" gorm:"type:varchar(255)"` // Deskripsi perawatan singkat
	Surfaces  *string             `json:"surfaces,omitempty"`                           // Bisa string JSON dari array: ["O", "M"]
	History   []ToothHistoryEntry `json:"history,omitempty" gorm:"-"`                   // Tidak disimpan langsung di sini, tapi melalui relasi di OdontogramDetail
}
