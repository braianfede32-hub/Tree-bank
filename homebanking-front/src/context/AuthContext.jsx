import { createContext, useContext, useState, useEffect } from 'react';
import { demoActivo, usuarioDemo, iniciarDemo, cerrarDemo } from '../demo/demoStore';

// El AuthContext guarda el usuario logueado y el token en toda la app
const AuthContext = createContext(null);

// La foto de perfil de la cuenta de prueba va al sessionStorage (muere con la
// pestaña); la de un cliente real, al localStorage como siempre.
const almacenFoto = (usuario) => (usuario?.demo ? sessionStorage : localStorage);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  // Splash de bienvenida. Tiene dos modos: 'ingreso' cuando alguien acaba de
  // loguearse (lo saluda por el nombre) y 'reapertura' cuando vuelve a abrir
  // la app con la sesion ya guardada, sin saludo porque no esta entrando de
  // nuevo. Se decide aca, en el estado inicial, y no en el useEffect de abajo:
  // el efecto corre despues del primer render, asi que por un frame se veria
  // el spinner gris antes del splash.
  const [splash, setSplash] = useState(
    () => (demoActivo() || (localStorage.getItem('token') && localStorage.getItem('usuario'))) ? 'reapertura' : false
  );
  const [foto, setFotoState] = useState(null); // foto de perfil (base64 en el navegador)

  // Al iniciar la app, revisamos si ya habia una sesion guardada.
  // La cuenta de prueba (/test) tiene prioridad: vive en el sessionStorage de
  // esta pestana y no toca el token de un cliente real que este en el localStorage.
  useEffect(() => {
    const demo = usuarioDemo();
    if (demo) {
      setUsuario(demo);
    } else {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');
      if (token && usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      }
    }
    setCargando(false);
  }, []);

  // Cargar la foto guardada de este usuario (clave por DNI)
  useEffect(() => {
    if (usuario?.dni) {
      setFotoState(almacenFoto(usuario).getItem(`tb_foto_${usuario.dni}`) || null);
    } else {
      setFotoState(null);
    }
  }, [usuario]);

  // Guardar/quitar la foto de perfil
  const setFoto = (dataUrl) => {
    if (!usuario?.dni) return;
    const almacen = almacenFoto(usuario);
    if (dataUrl) almacen.setItem(`tb_foto_${usuario.dni}`, dataUrl);
    else almacen.removeItem(`tb_foto_${usuario.dni}`);
    setFotoState(dataUrl);
  };

  const login = (token, datosUsuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
    setSplash('ingreso'); // splash completo, con el saludo por nombre
  };

  // Entrada por /test: arma una sesion de prueba nueva (datos ficticios, solo en
  // esta pestana) y deja al visitante adentro como cliente de la cuenta demo.
  const entrarDemo = () => {
    const datosUsuario = iniciarDemo();
    setUsuario(datosUsuario);
    setSplash('ingreso');
  };

  const logout = () => {
    if (demoActivo()) {
      // Cerrar la sesion de prueba descarta todo lo que se hizo en ella. No se
      // toca el localStorage: ahi puede haber una sesion real que no es de la demo.
      cerrarDemo();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    setUsuario(null);
  };

  // ADMIN es el dueno del banco; EMPLEADO es soporte (mismo panel, solo consulta).
  // esStaff = cualquiera de los dos: es quien entra al panel en /admin.
  const esAdmin = !!usuario?.esAdmin;
  const esEmpleado = !!usuario?.esEmpleado;
  const esStaff = esAdmin || esEmpleado;
  const esDemo = !!usuario?.demo;

  return (
    <AuthContext.Provider value={{ usuario, login, entrarDemo, logout, cargando, splash, setSplash, foto, setFoto, esAdmin, esEmpleado, esStaff, esDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto facilmente
export function useAuth() {
  return useContext(AuthContext);
}
