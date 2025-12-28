import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // default backend port
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase() ?? 'UNKNOWN';
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
  console.log('➡️ API REQUEST:', method, url);

  // Ensure headers exist (fix TypeScript error)
  config.headers = config.headers ?? {};
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = `${res.config.baseURL ?? ''}${res.config.url ?? ''}`;
    console.log('✅ API RESPONSE:', res.status, url);
    return res;
  },
  (error: AxiosError) => {
    const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
    console.error('❌ API ERROR:', error.response?.status, url);
    return Promise.reject(error);
  }
);

export default api;
