import axios from 'axios';

// Instancia base de axios apuntando al backend.
// Se puede sobreescribir con VITE_API_URL en un archivo .env del front.
const api = axios.create({
  // En desarrollo se usa el proxy de Vite (/api) para que tambien funcione desde el celular.
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3001/api'),
});

// Interceptor: antes de cada request, agrega el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
