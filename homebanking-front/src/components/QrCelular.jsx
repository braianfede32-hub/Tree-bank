import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Icon from './Icon';

// En desarrollo la app corre en localhost, que el celular no puede abrir:
// ahi el QR usa la IP de la PC en la red local (la calcula vite.config.js).
const urlBase = () => {
  const { hostname, origin, port } = window.location;
  const esLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!esLocal || typeof __LAN_URL__ !== 'string') return origin;
  // Vite usa otro puerto si el 5173 esta ocupado: se toma el de la pagina abierta
  const lan = new URL(__LAN_URL__);
  if (port) lan.port = port;
  return lan.origin;
};

// Por defecto el QR abre la app. Con `ruta` apunta a otra pantalla: el login
// lo usa con "/test" para que quien todavia no es cliente entre directo a la
// cuenta de prueba al escanearlo.
export default function QrCelular({
  className = '',
  ruta = '',
  urlFija = '', // si se pasa, el QR apunta siempre a esa URL (en vez de a esta pagina)
  titulo = 'Abrilo en tu celular',
  texto = 'Escaneá el código con la cámara.',
  icono = 'phone',
}) {
  const [qr, setQr] = useState('');
  const base = urlFija ? '' : urlBase();
  const url = urlFija || `${base}${ruta}`;
  const usaIpLocal = !urlFija && base !== window.location.origin;

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#10261C', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [url]);

  if (!qr) return null;

  return (
    <div className={`dash-panel qr-celular ${className}`}>
      <img src={qr} alt={`Código QR para abrir ${url} en el celular`} width="120" height="120" className="qr-celular-img" />
      <div className="qr-celular-txt">
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name={icono} size={16} /> {titulo}
        </p>
        <p className="dash-panel-sub" style={{ fontSize: 13 }}>
          {texto} {usaIpLocal ? 'El celular tiene que estar en la misma red wifi.' : ''}
        </p>
        <p className="dash-panel-sub" style={{ fontSize: 12, wordBreak: 'break-all' }}>{url}</p>
      </div>
    </div>
  );
}
