import { useState } from 'react';

const urlLogo = (ticker) => `https://financialmodelingprep.com/image-stock/${encodeURIComponent(ticker)}.png`;

// Los CEDEARs cotizan con sufijo D o C (AAPLD, AAPLC) para el mismo ticker de origen
const candidatos = (simbolo) => {
  const base = simbolo.toUpperCase();
  const lista = [base];
  if (base.length > 3 && /[DC]$/.test(base)) lista.push(base.slice(0, -1));
  return lista;
};

export default function TickerLogo({ simbolo, size = 22 }) {
  const lista = candidatos(simbolo);
  const [intento, setIntento] = useState(0);

  if (intento >= lista.length) {
    return <span style={{ fontWeight: 700, fontSize: size * 0.6 }}>{simbolo.charAt(0)}</span>;
  }

  return (
    <img
      src={urlLogo(lista[intento])}
      alt={simbolo}
      width={size}
      height={size}
      style={{ objectFit: 'contain', borderRadius: 4 }}
      onError={() => setIntento((i) => i + 1)}
    />
  );
}
