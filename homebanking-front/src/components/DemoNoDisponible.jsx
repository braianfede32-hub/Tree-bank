import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from './AppLayout';
import Icon from './Icon';

// Lo que ve quien esta en la cuenta de prueba (/test) al entrar a una seccion
// que la demo no incluye (prestamos, tarjetas, inversiones, etc.). Esas
// secciones necesitan datos y servicios reales del banco, asi que se muestran
// como "para clientes" en vez de simularlas a medias.
export default function DemoNoDisponible() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Para abrir una cuenta de verdad primero hay que salir de la prueba: la
  // sesion demo no habla con el servidor y descartaria el registro.
  const hacermeCliente = () => {
    logout();
    navigate('/abrir-cuenta');
  };

  return (
    <AppLayout>
      <div className="anim-up">
        <h1 className="page-title">Disponible para clientes</h1>
        <p className="page-sub">
          Esta sección no está incluida en la cuenta de prueba.
        </p>
      </div>

      <div className="dash-panel anim-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="quick-action-icon" style={{ flexShrink: 0 }}>
            <Icon name="lock" size={22} />
          </div>
          <p className="dash-panel-sub" style={{ fontSize: 14 }}>
            Podés probar Inicio, Transferir, Movimientos, Depósitos y Mi perfil.
            El resto lo vas a tener al hacerte cliente de Tree Bank.
          </p>
        </div>
        <button className="btn-primary" onClick={hacermeCliente}>
          Hacerme cliente
        </button>
        <button className="btn-outline-green" onClick={() => navigate('/dashboard')} style={{ justifyContent: 'center' }}>
          Volver al inicio
        </button>
      </div>
    </AppLayout>
  );
}
