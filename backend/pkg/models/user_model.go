package models

import (
	"time"
	// "golang.org/x/crypto/bcrypt" // Fungsi hash dipindah ke utils
)

type User struct {
	BaseModel                // Meng-embed ID, CreatedAt, UpdatedAt, DeletedAt
	NamaLengkap   string     `gorm:"type:varchar(255);not null" json:"namaLengkap"`
	Username      string     `gorm:"type:varchar(100);uniqueIndex;not null" json:"username"`
	Email         string     `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash  string     `gorm:"type:varchar(255);not null" json:"-"`            // Tidak dikirim dalam JSON response standar
	Role          string     `gorm:"type:varchar(50);not null" json:"role"`          // e.g., "admin", "dokter", "resepsionis"
	Status        string     `gorm:"type:varchar(20);default:'aktif'" json:"status"` // e.g., "aktif", "nonaktif"
	LastLogin     *time.Time `json:"lastLogin,omitempty"`
	PhoneNumber   string     `gorm:"type:varchar(20)" json:"phoneNumber,omitempty"`
	ProfilePicURL string     `gorm:"type:varchar(255)" json:"profilePicUrl,omitempty"`
}

// Anda mungkin ingin menambahkan fungsi terkait User di sini, misalnya untuk hashing password.
// import "golang.org/x/crypto/bcrypt"

// HashPassword mengenkripsi password menggunakan bcrypt
// func HashPassword(password string) (string, error) {
//	 bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
//	 return string(bytes), err
// }

// CheckPasswordHash memverifikasi password dengan hash yang tersimpan
// func CheckPasswordHash(password, hash string) bool {
//	 err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
//	 return err == nil
// }
