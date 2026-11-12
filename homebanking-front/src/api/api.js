import axios from 'axios';
import { demoActivo } from '../demo/demoStore';
import { demoAdapter } from '../demo/demoApi';

// Instancia base de axios apuntando al backend.
// Se puede sobreescribir con VITE_API_URL en un archivo .env del front.
const api = axios.create({
  // En desarrollo se usa el proxy de Vite (/api) para que tambien funcione desde el celular.
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3001/api'),
});

// Interceptor: antes de cada request, agrega el token JWT si existe.
// En la cuenta de prueba (/test) el pedido no va al servidor: lo atiende
// demo/demoApi.js con datos locales y sin token, asi que ninguna operacion
// de la demo puede llegar al banco real.
api.interceptors.request.use((config) => {
  if (demoActivo()) {
    config.adapter = demoAdapter;
    return config;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
