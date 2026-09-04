import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// In development: Reads EXPO_PUBLIC_API_URL from .env, with smart fallbacks for Android/iOS/Web
const getBaseUrl = (): string => {
  let envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!envUrl) {
    envUrl = Platform.OS === "android" ? "http://10.0.2.2:5000/api/v1" : "http://localhost:5000/api/v1";
  }
  // On Android emulator, 'localhost' refers to the emulator device itself.
  // Convert 'localhost' to '10.0.2.2' to reach the host computer backend.
  if (Platform.OS === "android" && envUrl.includes("localhost")) {
    envUrl = envUrl.replace("localhost", "10.0.2.2");
  }
  return envUrl;
};

export const API_BASE_URL = getBaseUrl();
console.log(`[API] Client initialized with Base URL: ${API_BASE_URL}`);

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Storage keys
const TOKEN_KEY = "safarlink_access_token";
const REFRESH_TOKEN_KEY = "safarlink_refresh_token";

export const setAuthTokens = async (accessToken: string, refreshToken?: string) => {
  try {
    const pairs: [string, string][] = [[TOKEN_KEY, accessToken]];
    if (refreshToken) {
      pairs.push([REFRESH_TOKEN_KEY, refreshToken]);
    }
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error("[Auth] Error saving tokens:", error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("[Auth] Error reading access token:", error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("[Auth] Error reading refresh token:", error);
    return null;
  }
};

export const clearAuthTokens = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (error) {
    console.error("[Auth] Error clearing tokens:", error);
  }
};

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (res.data?.success && res.data.data?.tokens) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data.tokens;
            await setAuthTokens(accessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          await clearAuthTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

// Typed API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

// Authentication API methods
export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    countryCode?: string;
    nationality?: string;
    countryOfResidence?: string;
    dateOfBirth?: string;
    avatar?: string;
  }) => apiClient.post<ApiResponse>("/auth/register", payload),

  login: (payload: { email: string; password: string }) =>
    apiClient.post<ApiResponse>("/auth/login", payload),

  verifyOtp: (payload: {
    email?: string;
    phone?: string;
    code: string;
    type?: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET";
  }) => apiClient.post<ApiResponse>("/auth/verify-otp", payload),

  resendOtp: (payload: {
    email?: string;
    phone?: string;
    type?: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET";
  }) => apiClient.post<ApiResponse>("/auth/resend-otp", payload),

  forgotPassword: (payload: { email: string }) =>
    apiClient.post<ApiResponse>("/auth/forgot-password", payload),

  resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
    apiClient.post<ApiResponse>("/auth/reset-password", payload),

  getCurrentUser: () => apiClient.get<ApiResponse>("/auth/me"),

  logout: (refreshToken?: string) =>
    apiClient.post<ApiResponse>("/auth/logout", { refreshToken }),
};

// Shipping Offers API methods
export const offerApi = {
  getOffers: (params?: {
    from?: string;
    to?: string;
    departureDate?: string;
    minKg?: number;
    maxPrice?: number;
    currency?: string;
    page?: number;
    limit?: number;
    sortBy?: "soonest" | "lowest_price" | "highest_capacity" | "newest";
  }) => apiClient.get<ApiResponse>("/offers", { params }),

  getMyOffers: () => apiClient.get<ApiResponse>("/offers/my-offers"),

  getOfferById: (id: string) => apiClient.get<ApiResponse>(`/offers/${id}`),

  createOffer: (payload: {
    from: string;
    to: string;
    departureDate: string;
    departureTime: string;
    destinationDate: string;
    destinationTime: string;
    totalKg: number;
    pricePerKg: number;
    currency?: string;
    description?: string;
  }) => apiClient.post<ApiResponse>("/offers", payload),

  updateOffer: (
    id: string,
    payload: {
      from?: string;
      to?: string;
      departureDate?: string;
      departureTime?: string;
      destinationDate?: string;
      destinationTime?: string;
      totalKg?: number;
      remainingKg?: number;
      pricePerKg?: number;
      currency?: string;
      description?: string;
      status?: string;
    }
  ) => apiClient.put<ApiResponse>(`/offers/${id}`, payload),

  deleteOffer: (id: string) => apiClient.delete<ApiResponse>(`/offers/${id}`),
};

export default apiClient;

