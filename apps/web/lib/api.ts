const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      name: string;
      createdAt: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  specialization: string;
  experience: number;
  bio?: string;
  consultationFee: number;
  rating: {
    average: number;
    totalReviews: number;
  };
  isActive: boolean;
  qualifications?: Array<{
    degree: string;
    institution?: string;
    year?: number;
  }>;
  availability?: Record<string, unknown>;
}

export interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  doctor: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    specialization: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  comments?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  videoCallLink?: string;
  meetingId?: string;
  createdAt: string;
}

export interface AppointmentCountsByDate {
  date: string; // YYYY-MM-DD
  count: number;
}

// Get stored tokens
export const getStoredTokens = () => {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return { accessToken, refreshToken, user };
};

// Store tokens
export const storeTokens = (accessToken: string, refreshToken: string, user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear tokens
export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Get auth header
export const getAuthHeader = () => {
  const { accessToken } = getStoredTokens() || {};
  return accessToken ? `Bearer ${accessToken}` : '';
};

// API calls
export const authAPI = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      storeTokens(result.data.accessToken, result.data.refreshToken, result.data.user);
    }
    
    return result;
  },

  signin: async (data: SigninData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      storeTokens(result.data.accessToken, result.data.refreshToken, result.data.user);
    }
    
    return result;
  },

  signout: async (): Promise<{ success: boolean; message: string }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      clearTokens();
    }
    
    return result;
  },
};

// Doctor API calls
export const doctorAPI = {
  getAll: async (): Promise<{ success: boolean; data: Doctor[] }> => {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  },

  getById: async (id: string): Promise<{ success: boolean; data: Doctor }> => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  },

  search: async (specialization?: string, search?: string): Promise<{ success: boolean; data: Doctor[] }> => {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/doctors/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  },

  create: async (data: {
    userId: string;
    specialization: string;
    experience: number;
    bio?: string;
    consultationFee: number;
    qualifications?: Array<{ degree: string; institution?: string; year?: number }>;
  }): Promise<{ success: boolean; message: string; data?: Doctor }> => {
    const authHeader = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
};

// Appointment API calls
export const appointmentAPI = {
  create: async (data: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    comments?: string;
  }): Promise<{ success: boolean; message: string; data?: Appointment }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  },

    complete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const authHeader = getAuthHeader();

    const response = await fetch(`${API_BASE_URL}/appointments/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    return await response.json();
  },

  getAll: async (
    status?: string,
    scope?: 'doctor' | 'patient',
    includeCounts?: boolean
  ): Promise<{ success: boolean; data: Appointment[]; countsByDate?: AppointmentCountsByDate[] }> => {
    const authHeader = getAuthHeader();
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (scope) searchParams.append('scope', scope);
    if (includeCounts) searchParams.append('includeCounts', 'true');
    const params = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    const response = await fetch(`${API_BASE_URL}/appointments${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    return await response.json();
  },

  getById: async (id: string): Promise<{ success: boolean; data: Appointment }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    return await response.json();
  },

  cancel: async (id: string): Promise<{ success: boolean; message: string }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    return await response.json();
  },

  startCall: async (id: string): Promise<{ success: boolean; joinUrl?: string; sessionId?: string; message?: string }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/start-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    return await response.json();
  },

  joinCall: async (id: string): Promise<{ success: boolean; joinUrl?: string; sessionId?: string; message?: string }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/join-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    return await response.json();
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    return await response.json();
  },
};

// AI consultation: start a video call with the AI doctor
export const aiConsultationAPI = {
  start: async (): Promise<{ success: boolean; joinUrl?: string; sessionId?: string; message?: string }> => {
    const authHeader = getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/ai-consultation/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    return await response.json();
  },
};

