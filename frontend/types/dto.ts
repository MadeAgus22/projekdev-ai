// frontend/types/dto.ts

// --- DTO untuk Autentikasi ---
export interface LoginRequestDTO {
  username: string;
  password?: string; // Password bisa opsional jika ada mekanisme login lain
  role: "admin" | "dokter" | "resepsionis";
}

export interface LoginResponseDTO {
  token: string;
  id: number; // atau string jika ID dari backend adalah string (UUID)
  username: string;
  namaLengkap: string;
  email: string;
  role: "admin" | "dokter" | "resepsionis";
}

// --- DTO untuk Manajemen Pengguna ---
export interface UserResponseDTO {
  permissions: never[];
  id: number | string;
  namaLengkap: string;
  username: string;
  email: string;
  role: "admin" | "dokter" | "resepsionis";
  status: "aktif" | "nonaktif";
  phoneNumber?: string;
  lastLogin?: string | null; // Backend mungkin mengirim time.Time, yang akan menjadi string ISO
  createdAt: string; // Biasanya string format ISO 8601
  updatedAt: string; // Biasanya string format ISO 8601
}

export interface CreateUserRequestDTO {
  namaLengkap: string;
  username: string;
  email: string;
  password?: string; // Wajib saat create
  role: "admin" | "dokter" | "resepsionis";
  status?: "aktif" | "nonaktif"; // Bisa opsional, default di backend
  phoneNumber?: string;
}

export interface UpdateUserRequestDTO {
  namaLengkap?: string;
  username?: string; // Pertimbangkan apakah username boleh diubah
  email?: string;
  password?: string; // Opsional, hanya jika ingin mengubah password
  role?: "admin" | "dokter" | "resepsionis";
  status?: "aktif" | "nonaktif";
  phoneNumber?: string;
}

// --- DTO untuk Role ---
// Sesuai dengan dto.PermissionSimpleDTO di backend Anda
export interface PermissionSimpleDTO {
  id: number | string;
  kode: string;
  nama: string;
  grup?: string; // Pastikan ini ada dan diekspor dengan benar dari backend jika digunakan
}

// Sesuai dengan dto.RoleResponse di backend Anda
export interface RoleResponseDTO {
  id: number | string;
  nama: string;
  kode: string; // Sebaiknya tipe spesifik seperti UserResponseDTO.role jika memungkinkan
  deskripsi?: string;
  permissions?: PermissionSimpleDTO[];
  createdAt: string;
  updatedAt: string;
}

// Sesuai dengan dto.CreateRoleRequest di backend Anda
export interface CreateRoleRequestDTO {
  nama: string;
  kode: string;
  deskripsi?: string;
  permissionKodes?: string[]; // Array kode permission
}

// Sesuai dengan dto.UpdateRoleRequest di backend Anda
export interface UpdateRoleRequestDTO {
  nama?: string;
  kode?: string;
  deskripsi?: string;
  permissionKodes?: string[];
}

// --- DTO untuk Permission ---
// Sesuai dengan dto.PermissionResponse di backend Anda
export interface PermissionResponseDTO {
  id: number | string;
  nama: string;
  kode: string;
  deskripsi?: string;
  grup?: string;
  createdAt: string;
  updatedAt: string;
}

// Tambahkan DTO lain sesuai kebutuhan (Patient, EMR, TreatmentCatalog, dll.)
// Contoh:
export interface PatientDTO {
  id: number | string;
  noRm: string;
  namaLengkap: string;
  tanggalLahir: string | null;
  jenisKelamin: string;
  nomorTelepon: string;
  alamat?: string;
  email?: string;
  alergi?: string;
  riwayatPenyakit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequestDTO {
  namaLengkap: string;
  tanggalLahir?: string | null; // Format YYYY-MM-DD
  jenisKelamin?: string;
  alamat?: string;
  nomorTelepon: string;
  email?: string;
  alergi?: string;
  riwayatPenyakit?: string;
}
export interface UpdatePatientRequestDTO extends Partial<CreatePatientRequestDTO> {}


// DTO untuk EMR (Contoh, sesuaikan dengan backend)
export interface MedicalRecordTreatmentItemDTO {
    id?: string | number;
    code: string;
    name?: string; // Bisa di-fetch dari catalog di backend
    tooth: string;
    price: number;
    discount: number;
    quantity: number;
    total: number;
    notes?: string;
}
export interface MedicalRecordMedicationItemDTO {
    id?: string | number;
    code: string;
    name?: string; // Bisa di-fetch dari catalog di backend
    quantity: number;
    unit: string;
    price: number;
    total: number;
    instruction?: string;
}
export interface OdontogramDetailDTO { // Sesuai dengan types/odontogram.ts Anda
    toothNumber: string; // Di backend mungkin ToothID
    condition: "normal" | "caries" | "filling" | "missing" | "crown" | "root-canal" | "implant";
    treatmentNote?: string;
    history?: Array<{
        date: string;
        doctor: string;
        from: string; // Seharusnya ToothCondition juga
        to: string;   // Seharusnya ToothCondition juga
        note: string;
    }>;
}
export interface CreateEMRRequestDTO {
    patientId: number | string;
    doctorId: number | string;
    doctorName?: string;
    visitType?: string;
    complaint: string;
    examination?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    notes?: string;
    treatments?: MedicalRecordTreatmentItemDTO[];
    medications?: MedicalRecordMedicationItemDTO[];
    odontogram?: OdontogramDetailDTO[]; // Sesuai dengan OdontogramData di backend
}
export interface EMRResponseDTO extends CreateEMRRequestDTO { // Atau buat struktur terpisah
    id: number | string;
    visitId: string;
    examDate: string; // string ISO date
    patient?: PatientDTO; // Jika di-preload
    billingStatus?: string;
    createdAt: string;
    updatedAt: string;
}
export interface UpdateEMRRequestDTO extends Partial<CreateEMRRequestDTO> {}

// DTO untuk Master Data
export interface TreatmentCatalogDTO {
    id: number | string;
    kode: string;
    nama: string;
    kategori?: string;
    harga: number;
    deskripsi?: string;
}
export interface CreateTreatmentCatalogRequestDTO extends Omit<TreatmentCatalogDTO, 'id'> {}
export interface UpdateTreatmentCatalogRequestDTO extends Partial<Omit<TreatmentCatalogDTO, 'id' | 'kode'>> {}


export interface MedicationCatalogDTO {
    id: number | string;
    kode: string;
    nama: string;
    satuan?: string;
    hargaJual: number;
    stok?: number;
    deskripsi?: string;
}
export interface CreateMedicationCatalogRequestDTO extends Omit<MedicationCatalogDTO, 'id'> {}
export interface UpdateMedicationCatalogRequestDTO extends Partial<Omit<MedicationCatalogDTO, 'id' | 'kode'>> {}


// DTO untuk Reservasi
export interface ReservationDTO {
    id: number | string;
    patientId: number | string;
    patientName?: string; // Denormalized
    noRm?: string; // Denormalized
    doctorId: number | string;
    doctorName?: string; // Denormalized
    tanggal: string; // YYYY-MM-DD
    waktu: string; // HH:mm
    keluhan?: string;
    catatan?: string;
    status: string; // e.g., "Dijadwalkan", "Dikonfirmasi", "Selesai", "Batal"
    jenisKunjungan?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReservationRequestDTO {
    patientId: number | string; // Bisa juga mengirim NoRM, lalu backend mencari ID nya
    pasienNama?: string; // Untuk walk-in atau jika frontend sudah tahu namanya
    doctorId: number | string;
    tanggal: string; // YYYY-MM-DD
    waktu: string; // HH:mm
    keluhan: string;
    catatan?: string;
    jenisKunjungan?: string;
}

export interface UpdateReservationRequestDTO extends Partial<CreateReservationRequestDTO> {
    status?: string;
}
