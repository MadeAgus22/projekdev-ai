// frontend/services/api.ts

import type {
  UserResponseDTO,
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
  RoleResponseDTO,
  CreateRoleRequestDTO,
  UpdateRoleRequestDTO,
  PermissionResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  PatientDTO, // Tambahkan jika Anda membuat tipe ini
  CreatePatientRequestDTO,
  UpdatePatientRequestDTO,
  EMRResponseDTO,
  CreateEMRRequestDTO,
  UpdateEMRRequestDTO,
  TreatmentCatalogDTO,
  CreateTreatmentCatalogRequestDTO,
  UpdateTreatmentCatalogRequestDTO,
  MedicationCatalogDTO,
  CreateMedicationCatalogRequestDTO,
  UpdateMedicationCatalogRequestDTO,
  ReservationDTO,
  CreateReservationRequestDTO,
  UpdateReservationRequestDTO
} from '@/types/dto'; // Pastikan path ini benar

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  if (!API_BASE_URL) {
    const errorMessage = "Kesalahan Konfigurasi: NEXT_PUBLIC_API_URL tidak terdefinisi. Periksa file .env.local dan restart server frontend.";
    console.error(errorMessage);
    return Promise.resolve({ success: false, message: errorMessage, error: errorMessage } as ApiResponse<T>);
  }

  const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${sanitizedEndpoint}`;

  // console.log(`[API Request] -> ${options?.method || 'GET'} ${url}`); // Kurangi log ini jika terlalu verbose

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    } else {
      // console.warn(`[API Request] Tidak ada authToken untuk request ke: ${url}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const responseText = await response.text();
    let responseData: ApiResponse<T>;

    try {
        responseData = JSON.parse(responseText) as ApiResponse<T>;
    } catch (parseError) {
        console.error(`[API Response Error] Gagal parse JSON untuk ${url}. Status: ${response.status}. Teks: ${responseText.substring(0,500)}...`);
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}. Respons tidak valid: ${responseText.substring(0,100)}...`);
        }
        throw new Error(`Respons dari server tidak valid (bukan JSON) meskipun status OK. Teks: ${responseText.substring(0,100)}...`);
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.error || `Error HTTP: ${response.status} ${response.statusText}`;
      console.error(`[API Response Error] ${errorMessage} untuk ${url}. Detail:`, responseData.errors || responseData);
      throw new Error(errorMessage);
    }

    if (responseData.success === false) {
      const logicErrorMessage = responseData.message || responseData.error || 'Operasi gagal di server (flag success:false)';
      console.warn(`[API Logic Error] ${logicErrorMessage} untuk ${url}. Detail:`, responseData.errors || responseData);
      throw new Error(logicErrorMessage);
    }
    // console.log(`[API Response Success] ${response.status} untuk ${url}`); // Kurangi log ini
    return responseData;
  } catch (error) {
    console.error(`[API Catch All Error] Gagal request ke ${options?.method || 'GET'} ${url}:`, error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error) || 'Terjadi kesalahan tidak diketahui saat request API');
    }
  }
}

// --- Layanan Autentikasi ---
export const authService = {
  login: (credentials: LoginRequestDTO): Promise<ApiResponse<LoginResponseDTO>> => {
    return request<LoginResponseDTO>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  getCurrentUser: (): Promise<ApiResponse<UserResponseDTO>> => {
    return request<UserResponseDTO>('/me');
  }
};

// --- Layanan Pengguna (User Management) ---
export const userService = {
  getAll: (page: number = 1, limit: number = 10, search: string = ""): Promise<ApiResponse<UserResponseDTO[]>> => {
    return request<UserResponseDTO[]>(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  },
  create: (data: CreateUserRequestDTO): Promise<ApiResponse<UserResponseDTO>> => {
    return request<UserResponseDTO>('/admin/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (userId: string, data: UpdateUserRequestDTO): Promise<ApiResponse<UserResponseDTO>> => {
    return request<UserResponseDTO>(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (userId: string): Promise<ApiResponse<null>> => {
    return request<null>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// --- Layanan Role ---
export const roleService = {
  getAll: (): Promise<ApiResponse<RoleResponseDTO[]>> => {
    return request<RoleResponseDTO[]>('/admin/access/roles');
  },
  create: (data: CreateRoleRequestDTO): Promise<ApiResponse<RoleResponseDTO>> => {
    return request<RoleResponseDTO>('/admin/access/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (roleId: string | number, data: UpdateRoleRequestDTO): Promise<ApiResponse<RoleResponseDTO>> => {
    return request<RoleResponseDTO>(`/admin/access/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (roleId: string | number): Promise<ApiResponse<null>> => {
    return request<null>(`/admin/access/roles/${roleId}`, {
      method: 'DELETE',
    });
  },
};

// --- Layanan Permission ---
export const permissionService = {
  getAll: (): Promise<ApiResponse<PermissionResponseDTO[]>> => {
    return request<PermissionResponseDTO[]>('/admin/access/permissions');
  },
};

// --- Layanan Pasien ---
export const patientService = {
  getAll: (page: number = 1, limit: number = 10, search: string = ""): Promise<ApiResponse<PatientDTO[]>> => {
    return request<PatientDTO[]>(`/pasien?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  },
  getById: (idOrNoRM: string): Promise<ApiResponse<PatientDTO>> => {
    return request<PatientDTO>(`/pasien/${idOrNoRM}`);
  },
  create: (data: CreatePatientRequestDTO): Promise<ApiResponse<PatientDTO>> => {
    return request<PatientDTO>('/pasien', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (idOrNoRM: string, data: UpdatePatientRequestDTO): Promise<ApiResponse<PatientDTO>> => {
    return request<PatientDTO>(`/pasien/${idOrNoRM}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (idOrNoRM: string): Promise<ApiResponse<null>> => {
    return request<null>(`/pasien/${idOrNoRM}`, {
      method: 'DELETE',
    });
  },
};

// --- Layanan EMR ---
export const emrService = {
  create: (data: CreateEMRRequestDTO): Promise<ApiResponse<EMRResponseDTO>> => {
    return request<EMRResponseDTO>('/emr', { method: 'POST', body: JSON.stringify(data) });
  },
  getByPatientId: (patientId: string | number): Promise<ApiResponse<EMRResponseDTO[]>> => {
    return request<EMRResponseDTO[]>(`/emr/pasien/${patientId}`);
  },
  getById: (emrIdOrVisitId: string): Promise<ApiResponse<EMRResponseDTO>> => {
    return request<EMRResponseDTO>(`/emr/${emrIdOrVisitId}`);
  },
  update: (emrIdOrVisitId: string, data: UpdateEMRRequestDTO): Promise<ApiResponse<EMRResponseDTO>> => {
    return request<EMRResponseDTO>(`/emr/${emrIdOrVisitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// --- Layanan Master Data Tindakan ---
export const treatmentCatalogService = {
    getAll: (): Promise<ApiResponse<TreatmentCatalogDTO[]>> => request<TreatmentCatalogDTO[]>('/master/tindakan'),
    create: (data: CreateTreatmentCatalogRequestDTO): Promise<ApiResponse<TreatmentCatalogDTO>> => request<TreatmentCatalogDTO>('/master/tindakan', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    // TODO: update, delete, getById
};

// --- Layanan Master Data Obat ---
export const medicationCatalogService = {
    getAll: (): Promise<ApiResponse<MedicationCatalogDTO[]>> => request<MedicationCatalogDTO[]>('/master/obat'),
    create: (data: CreateMedicationCatalogRequestDTO): Promise<ApiResponse<MedicationCatalogDTO>> => request<MedicationCatalogDTO>('/master/obat', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    // TODO: update, delete, getById
};

// --- Layanan Reservasi ---
export const reservationService = {
  getAll: (filters: { page?: number; limit?: number; search?: string; date?: string; doctorId?: string | number; status?: string }): Promise<ApiResponse<ReservationDTO[]>> => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.date) queryParams.append('date', filters.date); // YYYY-MM-DD
    if (filters.doctorId) queryParams.append('doctorId', filters.doctorId.toString());
    if (filters.status) queryParams.append('status', filters.status);
    return request<ReservationDTO[]>(`/reservasi?${queryParams.toString()}`);
  },
  create: (data: CreateReservationRequestDTO): Promise<ApiResponse<ReservationDTO>> => {
    return request<ReservationDTO>('/reservasi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: (reservationId: string | number, data: UpdateReservationRequestDTO): Promise<ApiResponse<ReservationDTO>> => {
    return request<ReservationDTO>(`/reservasi/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (reservationId: string | number): Promise<ApiResponse<null>> => {
    return request<null>(`/reservasi/${reservationId}`, {
      method: 'DELETE',
    });
  },
};


export default request;
