package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/config" // BENAR
	"github.com/MadeAgus22/dental-clinic-backend/pkg/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// ConnectDB menginisialisasi koneksi database
func ConnectDB() error {
	cfg := config.AppConfig
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=%s",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode, cfg.DBTimezone)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // Slow SQL threshold
			LogLevel:                  logger.Info, // Log level: Silent, Error, Warn, Info
			IgnoreRecordNotFoundError: true,        // Jangan log error jika record tidak ditemukan
			Colorful:                  true,        // Aktifkan warna
		},
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})

	if err != nil {
		return fmt.Errorf("gagal terhubung ke database: %w", err)
	}

	log.Println("Koneksi Database Berhasil!")
	return migrateTables()
}

func migrateTables() error {
	log.Println("Menjalankan Migrasi Database...")
	err := DB.AutoMigrate(
		&models.User{},
		&models.Patient{},
		&models.Reservation{},
		&models.TreatmentCatalog{},
		&models.MedicationCatalog{},
		&models.MedicalRecord{},
		&models.OdontogramDetail{},  // Tabel untuk setiap gigi dalam odontogram suatu EMR
		&models.OdontogramHistory{}, // Tabel untuk riwayat perubahan setiap gigi
		&models.MedicalRecordTreatmentItem{},
		&models.MedicalRecordMedicationItem{},
		&models.Role{},
		&models.Permission{},
		// Tambahkan model lain di sini
	)
	if err != nil {
		return fmt.Errorf("gagal migrasi database: %w", err)
	}
	log.Println("Migrasi Database Selesai.")
	return nil
}
