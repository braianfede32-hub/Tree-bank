import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Destino del QR de prueba (/test): quien lo escanea todavia no es cliente ni
// socio del banco, asi que se le arma una sesion de prueba nueva (datos
// ficticios, solo en su navegador) y se lo deja adentro como cliente de esa
// cuenta. Siempre arranca de cero: nada de una prueba anterior sobrevive.
export default function DemoEntradaPage() {
  const { entrarDemo } = useAuth();
  const navigate = useNavigate();
  // StrictMode ejecuta los efectos dos veces en desarrollo: sin esta marca se
  // armarian dos sesiones seguidas
  const iniciada = useRef(false);

  useEffect(() => {
    if (iniciada.current) return;
    iniciada.current = true;
    entrarDemo();
    navigate('/dashboard', { replace: true });
  }, [entrarDemo, navigate]);

  return (
    <div className="loading-center" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <div className="spinner" />
      Preparando tu cuenta de prueba…
    </div>
  );
}
