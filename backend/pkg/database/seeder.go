package database

import (
	"log"

	"github.com/MadeAgus22/dental-clinic-backend/pkg/models" // Sesuaikan path
	"gorm.io/gorm"
)

// DefinePermissions adalah daftar semua permission yang ingin Anda miliki dalam sistem.
var DefinePermissions = []models.Permission{
	// Dashboard
	{Nama: "Lihat Dashboard Utama", Kode: "dashboard:view", Grup: "Dashboard", Deskripsi: "Akses untuk melihat halaman utama dashboard."},

	// Pasien
	{Nama: "Lihat Data Pasien", Kode: "patient:view", Grup: "Pasien", Deskripsi: "Melihat daftar dan detail data pasien."},
	{Nama: "Tambah Pasien Baru", Kode: "patient:create", Grup: "Pasien", Deskripsi: "Mendaftarkan pasien baru ke sistem."},
	{Nama: "Ubah Data Pasien", Kode: "patient:update", Grup: "Pasien", Deskripsi: "Mengubah informasi detail pasien."},
	{Nama: "Hapus Data Pasien", Kode: "patient:delete", Grup: "Pasien", Deskripsi: "Menghapus data pasien dari sistem."},
	{Nama: "Registrasi Kunjungan Pasien", Kode: "patient:register_visit", Grup: "Pasien", Deskripsi: "Mendaftarkan pasien untuk kunjungan/antrian."},

	// Reservasi
	{Nama: "Lihat Semua Reservasi", Kode: "reservation:view_all", Grup: "Reservasi", Deskripsi: "Melihat semua jadwal reservasi."},
	{Nama: "Lihat Reservasi Dokter Tertentu", Kode: "reservation:view_doctor_specific", Grup: "Reservasi", Deskripsi: "Melihat jadwal reservasi hanya untuk dokter tertentu."},
	{Nama: "Buat Reservasi Baru", Kode: "reservation:create", Grup: "Reservasi", Deskripsi: "Membuat jadwal reservasi baru."},
	{Nama: "Ubah Data Reservasi", Kode: "reservation:update", Grup: "Reservasi", Deskripsi: "Mengubah detail reservasi."},
	{Nama: "Batalkan Reservasi", Kode: "reservation:cancel", Grup: "Reservasi", Deskripsi: "Membatalkan reservasi."},
	{Nama: "Konfirmasi Kehadiran Reservasi", Kode: "reservation:confirm_arrival", Grup: "Reservasi", Deskripsi: "Menandai pasien reservasi telah hadir."},

	// EMR
	{Nama: "Lihat EMR (Semua/Ditugaskan)", Kode: "emr:view", Grup: "EMR", Deskripsi: "Melihat EMR pasien (cakupan tergantung role)."},
	{Nama: "Buat EMR Baru", Kode: "emr:create", Grup: "EMR", Deskripsi: "Membuat entri rekam medis baru."},
	{Nama: "Ubah EMR", Kode: "emr:update", Grup: "EMR", Deskripsi: "Mengubah data pada EMR yang sudah ada."},
	{Nama: "Kelola Odontogram", Kode: "emr:manage_odontogram", Grup: "EMR", Deskripsi: "Mengisi dan mengubah data odontogram."},
	{Nama: "Cetak EMR", Kode: "emr:print", Grup: "EMR", Deskripsi: "Mencetak detail EMR."},

	// Master Data
	{Nama: "Lihat Master Tindakan", Kode: "master:view_treatments", Grup: "Master Data", Deskripsi: "Melihat daftar master tindakan."},
	{Nama: "Kelola Master Tindakan", Kode: "master:manage_treatments", Grup: "Master Data", Deskripsi: "CRUD master tindakan."},
	{Nama: "Lihat Master Obat", Kode: "master:view_medications", Grup: "Master Data", Deskripsi: "Melihat daftar master obat."},
	{Nama: "Kelola Master Obat", Kode: "master:manage_medications", Grup: "Master Data", Deskripsi: "CRUD master obat."},

	// Pengaturan
	{Nama: "Lihat Daftar Pengguna", Kode: "settings:view_users", Grup: "Pengaturan", Deskripsi: "Melihat daftar pengguna sistem."},
	{Nama: "Kelola Pengguna (CRUD)", Kode: "settings:manage_users", Grup: "Pengaturan", Deskripsi: "CRUD data pengguna."},
	{Nama: "Lihat Daftar Role", Kode: "settings:view_roles", Grup: "Pengaturan", Deskripsi: "Melihat daftar role."},
	{Nama: "Kelola Role & Hak Akses", Kode: "settings:manage_roles", Grup: "Pengaturan", Deskripsi: "CRUD role dan mengatur hak aksesnya."},

	// Billing
	{Nama: "Lihat Tagihan", Kode: "billing:view", Grup: "Billing", Deskripsi: "Melihat data tagihan pasien."},
	{Nama: "Buat Tagihan Baru", Kode: "billing:create", Grup: "Billing", Deskripsi: "Membuat tagihan baru."},
	{Nama: "Proses Pembayaran", Kode: "billing:process_payment", Grup: "Billing", Deskripsi: "Memproses pembayaran pasien."},
	{Nama: "Cetak Kwitansi", Kode: "billing:print_receipt", Grup: "Billing", Deskripsi: "Mencetak kwitansi pembayaran."},
}

func SeedPermissions(db *gorm.DB) error {
	log.Println("Memulai seeding permissions...")
	for _, p := range DefinePermissions {
		var existingPermission models.Permission
		err := db.Where("kode = ?", p.Kode).First(&existingPermission).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				if errCreate := db.Create(&p).Error; errCreate != nil {
					log.Printf("Gagal seed permission %s: %v\n", p.Kode, errCreate)
					return errCreate
				}
				log.Printf("Permission '%s' berhasil di-seed.\n", p.Nama)
			} else {
				log.Printf("Error mencari permission %s: %v\n", p.Kode, err)
				return err
			}
		} else {
			if existingPermission.Nama != p.Nama || existingPermission.Deskripsi != p.Deskripsi || existingPermission.Grup != p.Grup {
				existingPermission.Nama = p.Nama
				existingPermission.Deskripsi = p.Deskripsi
				existingPermission.Grup = p.Grup
				if errUpdate := db.Save(&existingPermission).Error; errUpdate != nil {
					log.Printf("Gagal update permission %s: %v\n", p.Kode, errUpdate)
					return errUpdate
				}
				log.Printf("Permission '%s' berhasil diupdate.\n", existingPermission.Nama)
			}
		}
	}
	log.Println("Seeding permissions selesai.")
	return nil
}

// Helper function untuk seed atau update role
func seedOrUpdateRole(db *gorm.DB, roleName, roleKode, roleDeskripsi string, permissionKodes []string) error {
	var role models.Role
	// Variabel roleChanged dihapus karena tidak digunakan

	err := db.Where("kode = ?", roleKode).First(&role).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Role tidak ditemukan, buat baru
			role = models.Role{
				Nama:      roleName,
				Kode:      roleKode,
				Deskripsi: roleDeskripsi,
			}
			if errCreate := db.Create(&role).Error; errCreate != nil {
				log.Printf("Gagal membuat role '%s': %v\n", roleName, errCreate)
				return errCreate
			}
			log.Printf("Role '%s' berhasil dibuat.\n", roleName)
		} else {
			// Error lain saat mencari role
			log.Printf("Error mencari role '%s': %v\n", roleName, err)
			return err
		}
	} else {
		// Role ditemukan, cek apakah perlu update
		if role.Nama != roleName || role.Deskripsi != roleDeskripsi {
			role.Nama = roleName
			role.Deskripsi = roleDeskripsi
			if errSave := db.Save(&role).Error; errSave != nil {
				log.Printf("Gagal update role '%s': %v\n", roleName, errSave)
				return errSave
			}
			log.Printf("Role '%s' berhasil diupdate detailnya.\n", roleName)
		}
	}

	// Tetapkan/Update permissions untuk role
	var permissionsToAssign []models.Permission
	if len(permissionKodes) > 0 {
		if err := db.Where("kode IN ?", permissionKodes).Find(&permissionsToAssign).Error; err != nil {
			log.Printf("Gagal mengambil permission untuk role '%s': %v\n", roleName, err)
			return err
		}
		if len(permissionsToAssign) != len(permissionKodes) {
			log.Printf("Peringatan: Tidak semua kode permission untuk role '%s' ditemukan. Diminta: %d, Ditemukan: %d.", roleName, len(permissionKodes), len(permissionsToAssign))
		}
	}

	if err := db.Model(&role).Association("Permissions").Replace(&permissionsToAssign); err != nil {
		log.Printf("Gagal menetapkan permission ke role '%s': %v\n", roleName, err)
		return err
	}
	log.Printf("Hak akses untuk role '%s' berhasil disinkronkan.\n", roleName)

	return nil
}

func SeedDefaultRolesAndPermissions(db *gorm.DB) error {
	log.Println("Memulai seeding default roles dan permissions...")

	// Role Admin
	var adminPermissionKodes []string
	var allPermissions []models.Permission
	if err := db.Order("id asc").Find(&allPermissions).Error; err != nil { // Ambil semua kode permission dari DB
		log.Printf("Gagal mengambil semua permission untuk Admin: %v", err)
		return err
	}
	for _, p := range allPermissions {
		adminPermissionKodes = append(adminPermissionKodes, p.Kode)
	}
	if err := seedOrUpdateRole(db, "Administrator", "admin", "Akses penuh ke sistem", adminPermissionKodes); err != nil {
		return err
	}

	// Role Dokter
	doctorPermissionKodes := []string{
		"dashboard:view", "patient:view", "reservation:view_doctor_specific",
		"emr:view", "emr:create", "emr:update", "emr:manage_odontogram", "emr:print",
	}
	if err := seedOrUpdateRole(db, "Dokter Gigi", "dokter", "Akses terkait medis dan pasien", doctorPermissionKodes); err != nil {
		return err
	}

	// Role Resepsionis
	receptionistPermissionKodes := []string{
		"dashboard:view", "patient:view", "patient:create", "patient:update", "patient:register_visit",
		"reservation:view_all", "reservation:create", "reservation:update", "reservation:cancel", "reservation:confirm_arrival",
		"billing:view", "billing:print_receipt",
	}
	if err := seedOrUpdateRole(db, "Resepsionis", "resepsionis", "Akses terkait pendaftaran dan jadwal", receptionistPermissionKodes); err != nil {
		return err
	}

	log.Println("Seeding default roles dan permissions selesai.")
	return nil
}
