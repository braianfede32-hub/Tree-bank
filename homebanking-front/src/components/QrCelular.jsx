import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Icon from './Icon';

// En desarrollo la app corre en localhost, que el celular no puede abrir:
// ahi el QR usa la IP de la PC en la red local (la calcula vite.config.js).
const urlParaCelular = () => {
  const { hostname, origin } = window.location;
  const esLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  return esLocal && typeof __LAN_URL__ === 'string' ? __LAN_URL__ : origin;
};

export default function QrCelular({ className = '' }) {
  const [qr, setQr] = useState('');
  const url = urlParaCelular();

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
          <Icon name="phone" size={16} /> Abrilo en tu celular
        </p>
        <p className="dash-panel-sub" style={{ fontSize: 13 }}>
          Escaneá el código con la cámara. {typeof __LAN_URL__ === 'string' && url === __LAN_URL__ ? 'El celular tiene que estar en la misma red wifi.' : ''}
        </p>
        <p className="dash-panel-sub" style={{ fontSize: 12, wordBreak: 'break-all' }}>{url}</p>
      </div>
    </div>
  );
}
