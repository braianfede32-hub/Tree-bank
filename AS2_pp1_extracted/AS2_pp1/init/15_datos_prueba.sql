-- ============================================================
-- 15_datos_prueba.sql - DATOS DE PRUEBA PARA ANALISIS
-- 25 clientes con su caja de ahorro en ARS y movimientos de los ultimos
-- 4 meses: sueldos, depositos, pagos de servicios, recargas y
-- transferencias entre clientes (cada una con su egreso y su ingreso).
-- El saldo de cada cuenta es exactamente la suma de sus movimientos.
-- Todos entran con contrasena Prueba123 (DNI desde 30100000).
-- Es seguro ejecutarlo mas de una vez: saltea los DNI que ya existen.
-- Los CBU son de prueba: no estan registrados en el Banco Central, asi que
-- estas cuentas sirven para analisis y para el panel, no para transferir
-- a otros bancos. Pensado para la base local (Docker); en Supabase, correrlo
-- solo si se quieren estos datos en la app publicada.
-- ============================================================

BEGIN;

-- Lucía Gómez · DNI 30100000 · 15 movimientos · saldo $ 3354847.81
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Lucía', 'Gómez', '30100000', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Calle 7 2717', 'lucia.gomez@mail.com', '1140000000', '1997-09-21', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30100000');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30100000'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30100000'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:55:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000000000');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30100000')), '0000003100200000000000', 'lucia.gomez.tb', 'ARS', 3354847.81 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000000000');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000000000'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 750000.00, 'Sueldo', '2026-07-25 10:17:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('RECARGA_CELULAR', 1500.00, 'Recarga Movistar · 1140000000', '2026-08-08 08:49:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 64000.00, 'Compra compartida', '2026-08-20 15:45:00'::timestamp, '0000003100200000095028', 'Isabella Ruiz'),
  ('DEPOSITO', 104500.00, 'Depósito en efectivo', '2026-08-23 15:25:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 750000.00, 'Sueldo', '2026-08-26 14:28:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_INGRESO', 16000.00, 'Cena', '2026-09-05 12:35:00'::timestamp, '0000003100200000031676', 'Valentina Martínez'),
  ('TRANSFERENCIA_INGRESO', 55500.00, 'Clases', '2026-09-06 13:19:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_EGRESO', 15000.00, 'Varios', '2026-09-10 07:50:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_INGRESO', 750000.00, 'Sueldo', '2026-09-23 10:55:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_INGRESO', 66500.00, 'Entradas', '2026-09-28 17:38:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('SERVICIO_PAGO', 4072.88, 'Pago de agua: Aguas del Plata · Cliente 65205206', '2026-10-07 16:13:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Movistar · 1140000000', '2026-10-10 15:24:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 78000.00, 'Depósito en efectivo', '2026-10-17 09:11:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 750000.00, 'Sueldo', '2026-10-21 14:08:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 4079.31, 'Pago de agua: Aguas del Plata · Cliente 22370664', '2026-10-25 10:05:00'::timestamp, NULL, NULL)
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000000000'));

-- Martín Rodríguez · DNI 30137171 · 20 movimientos · saldo $ 4843283.78
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Martín', 'Rodríguez', '30137171', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Calle 7 1929', 'martin.rodriguez@mail.com', '1140271828', '2003-10-18', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30137171');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30137171'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30137171'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:16:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000007919');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30137171')), '0000003100200000007919', 'martin.rodriguez.tb', 'ARS', 4843283.78 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000007919');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000007919'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 8594.12, 'Pago de gas: Metrogas · Cliente 87079038', '2026-07-19 15:17:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 36500.00, 'Regalo de cumpleaños', '2026-07-21 12:49:00'::timestamp, '0000003100200000047514', 'Camila Pérez'),
  ('TRANSFERENCIA_INGRESO', 1115000.00, 'Sueldo', '2026-07-26 10:25:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('TRANSFERENCIA_INGRESO', 30500.00, 'Clases', '2026-07-27 16:52:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 27000.00, 'Compra compartida', '2026-08-03 17:08:00'::timestamp, '0000003100200000158380', 'Florencia Silva'),
  ('SERVICIO_PAGO', 8317.97, 'Pago de gas: Metrogas · Cliente 27611550', '2026-08-10 11:55:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 13000.00, 'Alquiler', '2026-08-11 10:20:00'::timestamp, '0000003100200000071271', 'Joaquín Díaz'),
  ('SERVICIO_PAGO', 7006.35, 'Pago de luz: Edenor · Cliente 28101218', '2026-08-17 11:18:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1115000.00, 'Sueldo', '2026-08-22 08:39:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('TRANSFERENCIA_INGRESO', 70500.00, 'Regalo de cumpleaños', '2026-08-27 09:38:00'::timestamp, '0000003100200000182137', 'Ignacio Acosta'),
  ('TRANSFERENCIA_EGRESO', 55500.00, 'Clases', '2026-09-06 16:13:00'::timestamp, '0000003100200000000000', 'Lucía Gómez'),
  ('TRANSFERENCIA_INGRESO', 15000.00, 'Varios', '2026-09-10 07:23:00'::timestamp, '0000003100200000000000', 'Lucía Gómez'),
  ('TRANSFERENCIA_INGRESO', 72000.00, 'Expensas', '2026-09-10 17:19:00'::timestamp, '0000003100200000118785', 'Thiago Herrera'),
  ('TRANSFERENCIA_INGRESO', 1115000.00, 'Sueldo', '2026-09-21 13:45:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('TRANSFERENCIA_INGRESO', 63000.00, 'Cena', '2026-09-22 16:36:00'::timestamp, '0000003100200000158380', 'Florencia Silva'),
  ('TRANSFERENCIA_INGRESO', 65500.00, 'Varios', '2026-09-24 14:41:00'::timestamp, '0000003100200000102947', 'Lautaro Suárez'),
  ('TRANSFERENCIA_EGRESO', 14500.00, 'Cena', '2026-10-04 08:17:00'::timestamp, '0000003100200000071271', 'Joaquín Díaz'),
  ('SERVICIO_PAGO', 5797.78, 'Pago de gas: Metrogas · Cliente 49014429', '2026-10-15 08:17:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1115000.00, 'Sueldo', '2026-10-24 08:49:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('DEPOSITO', 90000.00, 'Depósito en efectivo', '2026-10-25 13:13:00'::timestamp, NULL, NULL)
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000007919'));

-- Sofía Fernández · DNI 30174342 · 13 movimientos · saldo $ 4802989.80
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Sofía', 'Fernández', '30174342', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Av. Libertador 4790', 'sofia.fernandez@mail.com', '1140543656', '2000-12-25', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30174342');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30174342'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30174342'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:26:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000015838');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30174342')), '0000003100200000015838', 'sofia.fernandez.tb', 'ARS', 4802989.80 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000015838');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000015838'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 1170000.00, 'Sueldo', '2026-07-26 17:59:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('SERVICIO_PAGO', 3736.91, 'Pago de agua: Aguas del Plata · Cliente 56575946', '2026-08-04 12:02:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 60500.00, 'Cena', '2026-08-14 15:15:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('DEPOSITO', 60000.00, 'Depósito en efectivo', '2026-08-20 10:23:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 80000.00, 'Cena', '2026-08-20 16:45:00'::timestamp, '0000003100200000182137', 'Ignacio Acosta'),
  ('SERVICIO_PAGO', 4166.09, 'Pago de agua: Aguas del Plata · Cliente 13433596', '2026-08-21 07:30:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1170000.00, 'Sueldo', '2026-08-23 15:22:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('RECARGA_CELULAR', 3000.00, 'Recarga Movistar · 1140543656', '2026-08-23 09:01:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 62000.00, 'Viaje', '2026-08-27 07:30:00'::timestamp, '0000003100200000166299', 'Franco Rojas'),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Personal · 1140543656', '2026-08-29 16:56:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 5607.20, 'Pago de agua: Aguas del Plata · Cliente 24245056', '2026-09-06 16:00:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1170000.00, 'Sueldo', '2026-09-23 08:27:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('TRANSFERENCIA_INGRESO', 1170000.00, 'Sueldo', '2026-10-23 13:51:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000015838'));

-- Mateo López · DNI 30211513 · 11 movimientos · saldo $ 4763608.25
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Mateo', 'López', '30211513', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Moreno 3713', 'mateo.lopez@mail.com', '1140815484', '1980-01-20', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30211513');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30211513'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30211513'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:34:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000023757');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30211513')), '0000003100200000023757', 'mateo.lopez.tb', 'ARS', 4763608.25 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000023757');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000023757'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 1210000.00, 'Sueldo', '2026-07-27 13:59:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 7409.85, 'Pago de gas: Metrogas · Cliente 41316553', '2026-07-31 10:22:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 73000.00, 'Alquiler', '2026-08-01 13:51:00'::timestamp, '0000003100200000110866', 'Catalina Castro'),
  ('SERVICIO_PAGO', 4406.68, 'Pago de agua: Aguas del Plata · Cliente 16071552', '2026-08-04 11:20:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 29000.00, 'Entradas', '2026-08-04 08:00:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 1210000.00, 'Sueldo', '2026-08-26 10:23:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('DEPOSITO', 96000.00, 'Depósito en efectivo', '2026-08-31 16:54:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1210000.00, 'Sueldo', '2026-09-22 14:07:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 4575.22, 'Pago de gas: Metrogas · Cliente 63573955', '2026-10-21 12:32:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1210000.00, 'Sueldo', '2026-10-22 16:06:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_EGRESO', 54000.00, 'Expensas', '2026-10-25 11:43:00'::timestamp, '0000003100200000102947', 'Lautaro Suárez')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000023757'));

-- Valentina Martínez · DNI 30248684 · 11 movimientos · saldo $ 4977374.53
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Valentina', 'Martínez', '30248684', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Calle 7 1007', 'valentina.martinez@mail.com', '1141087312', '1983-02-15', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30248684');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30248684'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30248684'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:32:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000031676');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30248684')), '0000003100200000031676', 'valentina.martinez.tb', 'ARS', 4977374.53 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000031676');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000031676'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 1240000.00, 'Sueldo', '2026-07-27 10:14:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('TRANSFERENCIA_INGRESO', 1240000.00, 'Sueldo', '2026-08-24 13:44:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('TRANSFERENCIA_EGRESO', 16000.00, 'Cena', '2026-09-05 10:13:00'::timestamp, '0000003100200000000000', 'Lucía Gómez'),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Movistar · 1141087312', '2026-09-06 08:34:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 31000.00, 'Compra compartida', '2026-09-10 10:42:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('TRANSFERENCIA_INGRESO', 1240000.00, 'Sueldo', '2026-09-21 12:08:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('SERVICIO_PAGO', 3988.74, 'Pago de agua: Aguas del Plata · Cliente 62341080', '2026-09-21 15:54:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 7136.73, 'Pago de gas: Metrogas · Cliente 28484701', '2026-10-05 08:25:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 145500.00, 'Depósito en efectivo', '2026-10-09 17:47:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 68000.00, 'Compra compartida', '2026-10-20 14:16:00'::timestamp, '0000003100200000174218', 'Milagros Benítez'),
  ('TRANSFERENCIA_INGRESO', 1240000.00, 'Sueldo', '2026-10-21 13:15:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000031676'));

-- Santiago González · DNI 30285855 · 20 movimientos · saldo $ 3563224.74
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Santiago', 'González', '30285855', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Av. Rivadavia 4116', 'santiago.gonzalez@mail.com', '1141359140', '1985-04-13', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30285855');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30285855'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30285855'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:12:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000039595');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30285855')), '0000003100200000039595', 'santiago.gonzalez.tb', 'ARS', 3563224.74 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000039595');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000039595'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 4020.11, 'Pago de gas: Metrogas · Cliente 46753198', '2026-07-13 11:46:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 27000.00, 'Cena', '2026-07-13 07:40:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('TRANSFERENCIA_EGRESO', 27000.00, 'Cena', '2026-07-19 15:09:00'::timestamp, '0000003100200000110866', 'Catalina Castro'),
  ('TRANSFERENCIA_EGRESO', 57000.00, 'Entradas', '2026-07-25 16:46:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('TRANSFERENCIA_INGRESO', 860000.00, 'Sueldo', '2026-07-27 11:52:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('TRANSFERENCIA_EGRESO', 30500.00, 'Clases', '2026-07-27 08:39:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_INGRESO', 29000.00, 'Entradas', '2026-08-04 07:26:00'::timestamp, '0000003100200000023757', 'Mateo López'),
  ('TRANSFERENCIA_INGRESO', 860000.00, 'Sueldo', '2026-08-25 11:47:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('TRANSFERENCIA_INGRESO', 22500.00, 'Varios', '2026-09-03 08:25:00'::timestamp, '0000003100200000190056', 'Delfina Ortiz'),
  ('TRANSFERENCIA_INGRESO', 61500.00, 'Cena', '2026-09-04 13:02:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Movistar · 1141359140', '2026-09-10 09:26:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 8672.02, 'Pago de luz: Edenor · Cliente 96661596', '2026-09-13 11:16:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 129500.00, 'Depósito en efectivo', '2026-09-19 13:38:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 860000.00, 'Sueldo', '2026-09-23 10:45:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('DEPOSITO', 93000.00, 'Depósito en efectivo', '2026-10-03 15:28:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 9745.27, 'Pago de luz: Edenor · Cliente 69670906', '2026-10-10 13:58:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Movistar · 1141359140', '2026-10-22 08:08:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 860000.00, 'Sueldo', '2026-10-23 14:41:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('TRANSFERENCIA_EGRESO', 35500.00, 'Alquiler', '2026-10-23 15:06:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('SERVICIO_PAGO', 5837.86, 'Pago de agua: Aguas del Plata · Cliente 41049233', '2026-10-25 11:18:00'::timestamp, NULL, NULL)
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000039595'));

-- Camila Pérez · DNI 30323026 · 15 movimientos · saldo $ 4525433.45
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Camila', 'Pérez', '30323026', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Mitre 2948', 'camila.perez@mail.com', '1141630968', '1987-07-24', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30323026');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30323026'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30323026'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 2, '2026-06-28 17:23:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000047514');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30323026')), '0000003100200000047514', 'camila.perez.tb', 'ARS', 4525433.45 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000047514');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000047514'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 5459.39, 'Pago de gas: Metrogas · Cliente 18110255', '2026-07-20 15:32:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 17500.00, 'Cena', '2026-07-21 11:20:00'::timestamp, '0000003100200000182137', 'Ignacio Acosta'),
  ('TRANSFERENCIA_EGRESO', 36500.00, 'Regalo de cumpleaños', '2026-07-21 10:17:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-07-27 17:21:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 2872.12, 'Pago de agua: Aguas del Plata · Cliente 96697188', '2026-08-06 13:13:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 1000.00, 'Recarga Personal · 1141630968', '2026-08-11 17:09:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 85000.00, 'Depósito en efectivo', '2026-08-14 08:28:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 64500.00, 'Depósito en efectivo', '2026-08-15 12:25:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 6193.56, 'Pago de luz: Edenor · Cliente 99967131', '2026-08-15 13:07:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 6500.00, 'Regalo de cumpleaños', '2026-08-16 11:46:00'::timestamp, '0000003100200000102947', 'Lautaro Suárez'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-08-27 07:04:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 6541.48, 'Pago de luz: Edenor · Cliente 22942714', '2026-08-31 09:04:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 3500.00, 'Varios', '2026-09-19 09:42:00'::timestamp, '0000003100200000063352', 'Martina Romero'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-09-22 07:07:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-10-21 08:28:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000047514'));

-- Benjamín Sánchez · DNI 30360197 · 14 movimientos · saldo $ 3335715.61
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Benjamín', 'Sánchez', '30360197', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Alsina 725', 'benjamin.sanchez@mail.com', '1141902796', '1986-02-18', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30360197');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30360197'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30360197'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:38:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000055433');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30360197')), '0000003100200000055433', 'benjamin.sanchez.tb', 'ARS', 3335715.61 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000055433');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000055433'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 68500.00, 'Viaje', '2026-07-09 12:12:00'::timestamp, '0000003100200000095028', 'Isabella Ruiz'),
  ('TRANSFERENCIA_INGRESO', 820000.00, 'Sueldo', '2026-07-27 11:27:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_EGRESO', 62500.00, 'Expensas', '2026-07-29 15:00:00'::timestamp, '0000003100200000079190', 'Emilia Álvarez'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Claro · 1141902796', '2026-08-03 11:27:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 820000.00, 'Sueldo', '2026-08-25 11:36:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('DEPOSITO', 75500.00, 'Depósito en efectivo', '2026-09-03 08:03:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Movistar · 1141902796', '2026-09-04 12:06:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 7788.66, 'Pago de gas: Metrogas · Cliente 57017385', '2026-09-15 14:25:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 69500.00, 'Préstamo devuelto', '2026-09-15 08:36:00'::timestamp, '0000003100200000071271', 'Joaquín Díaz'),
  ('TRANSFERENCIA_INGRESO', 820000.00, 'Sueldo', '2026-09-24 12:05:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_EGRESO', 66000.00, 'Viaje', '2026-09-28 17:54:00'::timestamp, '0000003100200000166299', 'Franco Rojas'),
  ('SERVICIO_PAGO', 3323.29, 'Pago de agua: Aguas del Plata · Cliente 17692234', '2026-10-13 14:47:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 11172.44, 'Pago de luz: Edenor · Cliente 26511507', '2026-10-13 15:29:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 820000.00, 'Sueldo', '2026-10-26 08:35:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000055433'));

-- Martina Romero · DNI 30397368 · 15 movimientos · saldo $ 2919077.77
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Martina', 'Romero', '30397368', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Alsina 2493', 'martina.romero@mail.com', '1142174624', '1983-08-05', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30397368');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30397368'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30397368'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:30:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000063352');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30397368')), '0000003100200000063352', 'martina.romero.tb', 'ARS', 2919077.77 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000063352');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000063352'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 45000.00, 'Alquiler', '2026-07-21 15:33:00'::timestamp, '0000003100200000174218', 'Milagros Benítez'),
  ('SERVICIO_PAGO', 11436.55, 'Pago de luz: Edenor · Cliente 17735063', '2026-07-23 09:48:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 39500.00, 'Viaje', '2026-07-23 12:59:00'::timestamp, '0000003100200000158380', 'Florencia Silva'),
  ('TRANSFERENCIA_INGRESO', 695000.00, 'Sueldo', '2026-07-24 09:55:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 3656.92, 'Pago de agua: Aguas del Plata · Cliente 47773020', '2026-07-29 16:53:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 105500.00, 'Depósito en efectivo', '2026-07-30 14:35:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 695000.00, 'Sueldo', '2026-08-24 16:31:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 5105.35, 'Pago de gas: Metrogas · Cliente 43766169', '2026-09-06 08:38:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 7723.41, 'Pago de gas: Metrogas · Cliente 26416872', '2026-09-17 07:27:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 3500.00, 'Varios', '2026-09-19 07:54:00'::timestamp, '0000003100200000047514', 'Camila Pérez'),
  ('TRANSFERENCIA_INGRESO', 695000.00, 'Sueldo', '2026-09-23 11:45:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_EGRESO', 65000.00, 'Cena', '2026-10-08 12:41:00'::timestamp, '0000003100200000087109', 'Tomás Torres'),
  ('TRANSFERENCIA_INGRESO', 50500.00, 'Préstamo devuelto', '2026-10-15 17:54:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('TRANSFERENCIA_INGRESO', 695000.00, 'Sueldo', '2026-10-21 16:12:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Claro · 1142174624', '2026-10-23 12:18:00'::timestamp, NULL, NULL)
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000063352'));

-- Joaquín Díaz · DNI 30434539 · 12 movimientos · saldo $ 2641102.49
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Joaquín', 'Díaz', '30434539', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Urquiza 2631', 'joaquin.diaz@mail.com', '1142446452', '1966-12-12', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30434539');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30434539'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30434539'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:51:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000071271');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30434539')), '0000003100200000071271', 'joaquin.diaz.tb', 'ARS', 2641102.49 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000071271');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000071271'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 670000.00, 'Sueldo', '2026-07-24 10:20:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('DEPOSITO', 41000.00, 'Depósito en efectivo', '2026-08-07 11:54:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 13000.00, 'Alquiler', '2026-08-11 07:54:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('SERVICIO_PAGO', 3739.14, 'Pago de agua: Aguas del Plata · Cliente 26868746', '2026-08-20 14:05:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 670000.00, 'Sueldo', '2026-08-27 09:05:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('RECARGA_CELULAR', 1500.00, 'Recarga Personal · 1142446452', '2026-09-07 10:39:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 3000.00, 'Recarga Movistar · 1142446452', '2026-09-10 08:49:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 69500.00, 'Préstamo devuelto', '2026-09-15 16:55:00'::timestamp, '0000003100200000055433', 'Benjamín Sánchez'),
  ('SERVICIO_PAGO', 3658.37, 'Pago de gas: Metrogas · Cliente 98019964', '2026-09-17 12:45:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 670000.00, 'Sueldo', '2026-09-21 15:32:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 14500.00, 'Cena', '2026-10-04 10:06:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_INGRESO', 670000.00, 'Sueldo', '2026-10-26 16:02:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000071271'));

-- Emilia Álvarez · DNI 30471710 · 11 movimientos · saldo $ 5270745.71
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Emilia', 'Álvarez', '30471710', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Sarmiento 3877', 'emilia.alvarez@mail.com', '1142718280', '1992-02-13', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30471710');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30471710'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30471710'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:25:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000079190');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30471710')), '0000003100200000079190', 'emilia.alvarez.tb', 'ARS', 5270745.71 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000079190');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000079190'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 4902.36, 'Pago de gas: Metrogas · Cliente 63265435', '2026-07-04 11:12:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1265000.00, 'Sueldo', '2026-07-27 15:55:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('TRANSFERENCIA_INGRESO', 62500.00, 'Expensas', '2026-07-29 17:17:00'::timestamp, '0000003100200000055433', 'Benjamín Sánchez'),
  ('DEPOSITO', 148500.00, 'Depósito en efectivo', '2026-08-02 10:33:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 10342.85, 'Pago de luz: Edenor · Cliente 28610287', '2026-08-06 16:32:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1265000.00, 'Sueldo', '2026-08-26 10:57:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('SERVICIO_PAGO', 4950.99, 'Pago de gas: Metrogas · Cliente 74269259', '2026-09-02 10:30:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 22500.00, 'Compra compartida', '2026-09-16 12:13:00'::timestamp, '0000003100200000182137', 'Ignacio Acosta'),
  ('TRANSFERENCIA_INGRESO', 1265000.00, 'Sueldo', '2026-09-25 16:57:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('TRANSFERENCIA_INGRESO', 1265000.00, 'Sueldo', '2026-10-22 11:49:00'::timestamp, '0720000788000098765434', 'Tecno Soluciones SRL'),
  ('SERVICIO_PAGO', 2558.09, 'Pago de agua: Aguas del Plata · Cliente 40635974', '2026-10-23 11:20:00'::timestamp, NULL, NULL)
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000079190'));

-- Tomás Torres · DNI 30508881 · 16 movimientos · saldo $ 2066838.06
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Tomás', 'Torres', '30508881', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Urquiza 4642', 'tomas.torres@mail.com', '1142990108', '1996-02-14', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30508881');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30508881'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30508881'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:56:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000087109');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30508881')), '0000003100200000087109', 'tomas.torres.tb', 'ARS', 2066838.06 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000087109');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000087109'), v.* FROM (VALUES
  ('TRANSFERENCIA_EGRESO', 62500.00, 'Clases', '2026-07-10 13:15:00'::timestamp, '0000003100200000174218', 'Milagros Benítez'),
  ('SERVICIO_PAGO', 3465.17, 'Pago de agua: Aguas del Plata · Cliente 85375365', '2026-07-11 09:27:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 465000.00, 'Sueldo', '2026-07-23 14:33:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 5916.60, 'Pago de agua: Aguas del Plata · Cliente 63562849', '2026-07-27 16:38:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 4280.17, 'Pago de agua: Aguas del Plata · Cliente 39774682', '2026-07-31 16:00:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 72000.00, 'Depósito en efectivo', '2026-08-06 15:22:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 89500.00, 'Regalo de cumpleaños', '2026-08-07 08:10:00'::timestamp, '0000003100200000174218', 'Milagros Benítez'),
  ('TRANSFERENCIA_INGRESO', 30500.00, 'Cena', '2026-08-11 13:44:00'::timestamp, '0000003100200000142542', 'Agustina Pereyra'),
  ('DEPOSITO', 91000.00, 'Depósito en efectivo', '2026-08-20 11:10:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 465000.00, 'Sueldo', '2026-08-23 16:16:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_INGRESO', 29500.00, 'Compra compartida', '2026-09-16 14:37:00'::timestamp, '0000003100200000110866', 'Catalina Castro'),
  ('TRANSFERENCIA_INGRESO', 465000.00, 'Sueldo', '2026-09-24 16:34:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_INGRESO', 65000.00, 'Cena', '2026-10-08 07:55:00'::timestamp, '0000003100200000063352', 'Martina Romero'),
  ('TRANSFERENCIA_INGRESO', 72000.00, 'Compra compartida', '2026-10-14 08:11:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('DEPOSITO', 12500.00, 'Depósito en efectivo', '2026-10-18 08:44:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 465000.00, 'Sueldo', '2026-10-24 12:33:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000087109'));

-- Isabella Ruiz · DNI 30546052 · 17 movimientos · saldo $ 3371101.02
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Isabella', 'Ruiz', '30546052', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Alsina 4122', 'isabella.ruiz@mail.com', '1143261936', '1990-09-09', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30546052');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30546052'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30546052'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:06:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000095028');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30546052')), '0000003100200000095028', 'isabella.ruiz.tb', 'ARS', 3371101.02 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000095028');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000095028'), v.* FROM (VALUES
  ('TRANSFERENCIA_EGRESO', 68500.00, 'Viaje', '2026-07-09 08:05:00'::timestamp, '0000003100200000055433', 'Benjamín Sánchez'),
  ('DEPOSITO', 89500.00, 'Depósito en efectivo', '2026-07-17 08:41:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 7385.13, 'Pago de luz: Edenor · Cliente 83380123', '2026-07-24 14:13:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 875000.00, 'Sueldo', '2026-07-25 08:27:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 8674.94, 'Pago de luz: Edenor · Cliente 80226429', '2026-07-28 15:27:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 84000.00, 'Alquiler', '2026-08-11 11:44:00'::timestamp, '0000003100200000150461', 'Nicolás Molina'),
  ('TRANSFERENCIA_EGRESO', 64000.00, 'Compra compartida', '2026-08-20 17:25:00'::timestamp, '0000003100200000000000', 'Lucía Gómez'),
  ('TRANSFERENCIA_INGRESO', 875000.00, 'Sueldo', '2026-08-22 08:44:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 13044.18, 'Pago de luz: Edenor · Cliente 30639953', '2026-08-24 09:31:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 76500.00, 'Varios', '2026-08-28 13:34:00'::timestamp, '0000003100200000158380', 'Florencia Silva'),
  ('TRANSFERENCIA_INGRESO', 875000.00, 'Sueldo', '2026-09-23 13:47:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Claro · 1143261936', '2026-09-28 08:32:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 50500.00, 'Depósito en efectivo', '2026-10-01 15:38:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 2794.73, 'Pago de agua: Aguas del Plata · Cliente 95780740', '2026-10-03 09:41:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 1000.00, 'Recarga Claro · 1143261936', '2026-10-13 13:41:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 62000.00, 'Expensas', '2026-10-14 16:05:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('TRANSFERENCIA_INGRESO', 875000.00, 'Sueldo', '2026-10-22 08:45:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000095028'));

-- Lautaro Suárez · DNI 30583223 · 18 movimientos · saldo $ 4714799.30
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Lautaro', 'Suárez', '30583223', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Av. Libertador 4720', 'lautaro.suarez@mail.com', '1143533764', '1995-09-17', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30583223');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30583223'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30583223'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 18:00:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000102947');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30583223')), '0000003100200000102947', 'lautaro.suarez.tb', 'ARS', 4714799.30 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000102947');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000102947'), v.* FROM (VALUES
  ('DEPOSITO', 50000.00, 'Depósito en efectivo', '2026-07-14 14:22:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1150000.00, 'Sueldo', '2026-07-28 08:39:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 5255.35, 'Pago de agua: Aguas del Plata · Cliente 89553785', '2026-08-02 12:14:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 7353.00, 'Pago de luz: Edenor · Cliente 54776368', '2026-08-16 07:53:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 6500.00, 'Regalo de cumpleaños', '2026-08-16 07:39:00'::timestamp, '0000003100200000047514', 'Camila Pérez'),
  ('DEPOSITO', 36500.00, 'Depósito en efectivo', '2026-08-21 11:19:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1150000.00, 'Sueldo', '2026-08-24 11:21:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('RECARGA_CELULAR', 3000.00, 'Recarga Claro · 1143533764', '2026-08-25 10:22:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 6698.27, 'Pago de luz: Edenor · Cliente 27985812', '2026-09-06 11:17:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 4394.08, 'Pago de agua: Aguas del Plata · Cliente 49314126', '2026-09-18 16:37:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1150000.00, 'Sueldo', '2026-09-23 11:12:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_EGRESO', 65500.00, 'Varios', '2026-09-24 07:32:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_EGRESO', 58000.00, 'Regalo de cumpleaños', '2026-09-30 08:40:00'::timestamp, '0000003100200000166299', 'Franco Rojas'),
  ('DEPOSITO', 46000.00, 'Depósito en efectivo', '2026-10-15 08:36:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1150000.00, 'Sueldo', '2026-10-22 13:00:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 77000.00, 'Viaje', '2026-10-22 12:36:00'::timestamp, '0000003100200000190056', 'Delfina Ortiz'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Claro · 1143533764', '2026-10-24 12:10:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 54000.00, 'Expensas', '2026-10-25 13:10:00'::timestamp, '0000003100200000023757', 'Mateo López')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000102947'));

-- Catalina Castro · DNI 30620394 · 11 movimientos · saldo $ 4630080.60
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Catalina', 'Castro', '30620394', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Av. Rivadavia 1939', 'catalina.castro@mail.com', '1143805592', '1973-01-23', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30620394');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30620394'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30620394'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:30:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000110866');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30620394')), '0000003100200000110866', 'catalina.castro.tb', 'ARS', 4630080.60 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000110866');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000110866'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 2908.44, 'Pago de agua: Aguas del Plata · Cliente 13814208', '2026-07-04 17:37:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 3510.96, 'Pago de gas: Metrogas · Cliente 96356336', '2026-07-19 11:31:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 27000.00, 'Cena', '2026-07-19 17:22:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-07-27 17:05:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 73000.00, 'Alquiler', '2026-08-01 13:26:00'::timestamp, '0000003100200000023757', 'Mateo López'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-08-22 09:10:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Movistar · 1143805592', '2026-09-08 17:53:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 148000.00, 'Depósito en efectivo', '2026-09-15 12:33:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 29500.00, 'Compra compartida', '2026-09-16 13:36:00'::timestamp, '0000003100200000087109', 'Tomás Torres'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-09-22 13:02:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 1105000.00, 'Sueldo', '2026-10-26 14:00:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000110866'));

-- Thiago Herrera · DNI 30657565 · 13 movimientos · saldo $ 4461780.29
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Thiago', 'Herrera', '30657565', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Alsina 940', 'thiago.herrera@mail.com', '1144077420', '1992-08-05', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30657565');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30657565'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30657565'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:47:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000118785');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30657565')), '0000003100200000118785', 'thiago.herrera.tb', 'ARS', 4461780.29 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000118785');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000118785'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 1100000.00, 'Sueldo', '2026-07-27 14:57:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('SERVICIO_PAGO', 9670.52, 'Pago de luz: Edenor · Cliente 26232107', '2026-08-15 16:46:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1100000.00, 'Sueldo', '2026-08-23 15:57:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Claro · 1144077420', '2026-08-28 12:01:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 3419.00, 'Pago de agua: Aguas del Plata · Cliente 19815488', '2026-09-07 08:26:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 78500.00, 'Compra compartida', '2026-09-07 10:54:00'::timestamp, '0000003100200000142542', 'Agustina Pereyra'),
  ('TRANSFERENCIA_EGRESO', 72000.00, 'Expensas', '2026-09-10 07:21:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_EGRESO', 6500.00, 'Expensas', '2026-09-17 09:27:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('TRANSFERENCIA_INGRESO', 1100000.00, 'Sueldo', '2026-09-22 07:21:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('TRANSFERENCIA_EGRESO', 5500.00, 'Viaje', '2026-10-06 17:42:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('SERVICIO_PAGO', 8130.19, 'Pago de luz: Edenor · Cliente 96912096', '2026-10-10 15:54:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 93500.00, 'Depósito en efectivo', '2026-10-12 11:46:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1100000.00, 'Sueldo', '2026-10-25 16:16:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000118785'));

-- Julieta Medina · DNI 30694736 · 17 movimientos · saldo $ 2307255.22
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Julieta', 'Medina', '30694736', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Moreno 1975', 'julieta.medina@mail.com', '1144349248', '1972-11-23', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30694736');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30694736'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30694736'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:56:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000126704');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30694736')), '0000003100200000126704', 'julieta.medina.tb', 'ARS', 2307255.22 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000126704');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000126704'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 6212.57, 'Pago de gas: Metrogas · Cliente 98187901', '2026-07-08 16:10:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 27000.00, 'Cena', '2026-07-13 16:23:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('DEPOSITO', 67500.00, 'Depósito en efectivo', '2026-07-21 11:58:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 525000.00, 'Sueldo', '2026-07-28 15:32:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 60500.00, 'Cena', '2026-08-14 09:13:00'::timestamp, '0000003100200000015838', 'Sofía Fernández'),
  ('TRANSFERENCIA_INGRESO', 77500.00, 'Expensas', '2026-08-17 17:12:00'::timestamp, '0000003100200000158380', 'Florencia Silva'),
  ('TRANSFERENCIA_INGRESO', 24000.00, 'Cena', '2026-08-19 13:34:00'::timestamp, '0000003100200000150461', 'Nicolás Molina'),
  ('TRANSFERENCIA_INGRESO', 525000.00, 'Sueldo', '2026-08-27 12:25:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 5274.81, 'Pago de gas: Metrogas · Cliente 85373460', '2026-09-13 07:07:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 525000.00, 'Sueldo', '2026-09-23 10:48:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_EGRESO', 66500.00, 'Entradas', '2026-09-28 17:34:00'::timestamp, '0000003100200000000000', 'Lucía Gómez'),
  ('SERVICIO_PAGO', 12257.40, 'Pago de luz: Edenor · Cliente 33722079', '2026-09-30 13:51:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 93000.00, 'Depósito en efectivo', '2026-10-04 13:20:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 70500.00, 'Préstamo devuelto', '2026-10-13 09:50:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('TRANSFERENCIA_EGRESO', 72000.00, 'Compra compartida', '2026-10-14 08:35:00'::timestamp, '0000003100200000087109', 'Tomás Torres'),
  ('TRANSFERENCIA_EGRESO', 50500.00, 'Préstamo devuelto', '2026-10-15 17:56:00'::timestamp, '0000003100200000063352', 'Martina Romero'),
  ('TRANSFERENCIA_INGRESO', 525000.00, 'Sueldo', '2026-10-24 10:24:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000126704'));

-- Facundo Aguirre · DNI 30731907 · 17 movimientos · saldo $ 3361806.39
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Facundo', 'Aguirre', '30731907', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Moreno 3945', 'facundo.aguirre@mail.com', '1144621076', '1999-05-18', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30731907');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30731907'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30731907'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 2, '2026-06-28 17:34:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000134623');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30731907')), '0000003100200000134623', 'facundo.aguirre.tb', 'ARS', 3361806.39 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000134623');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000134623'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 6060.61, 'Pago de luz: Edenor · Cliente 54154075', '2026-07-11 10:32:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 865000.00, 'Sueldo', '2026-07-25 07:20:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 57000.00, 'Entradas', '2026-07-25 15:10:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 865000.00, 'Sueldo', '2026-08-23 17:42:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('DEPOSITO', 42500.00, 'Depósito en efectivo', '2026-08-30 16:10:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 61500.00, 'Cena', '2026-09-04 15:33:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 31000.00, 'Compra compartida', '2026-09-10 14:43:00'::timestamp, '0000003100200000031676', 'Valentina Martínez'),
  ('TRANSFERENCIA_INGRESO', 6500.00, 'Expensas', '2026-09-17 10:27:00'::timestamp, '0000003100200000118785', 'Thiago Herrera'),
  ('SERVICIO_PAGO', 6308.26, 'Pago de luz: Edenor · Cliente 69652955', '2026-09-22 08:51:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 865000.00, 'Sueldo', '2026-09-23 14:40:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 5324.74, 'Pago de gas: Metrogas · Cliente 45994093', '2026-09-26 15:12:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 5500.00, 'Viaje', '2026-10-06 13:59:00'::timestamp, '0000003100200000118785', 'Thiago Herrera'),
  ('TRANSFERENCIA_EGRESO', 70500.00, 'Préstamo devuelto', '2026-10-13 16:48:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('TRANSFERENCIA_EGRESO', 64500.00, 'Expensas', '2026-10-14 10:36:00'::timestamp, '0000003100200000150461', 'Nicolás Molina'),
  ('TRANSFERENCIA_EGRESO', 62000.00, 'Expensas', '2026-10-14 16:37:00'::timestamp, '0000003100200000095028', 'Isabella Ruiz'),
  ('TRANSFERENCIA_INGRESO', 35500.00, 'Alquiler', '2026-10-23 11:56:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 865000.00, 'Sueldo', '2026-10-25 17:37:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000134623'));

-- Agustina Pereyra · DNI 30769078 · 13 movimientos · saldo $ 2494839.45
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Agustina', 'Pereyra', '30769078', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Av. Libertador 2620', 'agustina.pereyra@mail.com', '1144892904', '2000-11-17', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30769078');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30769078'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30769078'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:24:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000142542');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30769078')), '0000003100200000142542', 'agustina.pereyra.tb', 'ARS', 2494839.45 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000142542');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000142542'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 575000.00, 'Sueldo', '2026-07-26 07:55:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('DEPOSITO', 114500.00, 'Depósito en efectivo', '2026-07-31 13:25:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 5465.75, 'Pago de agua: Aguas del Plata · Cliente 76395419', '2026-07-31 14:48:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 30500.00, 'Cena', '2026-08-11 12:44:00'::timestamp, '0000003100200000087109', 'Tomás Torres'),
  ('SERVICIO_PAGO', 4654.52, 'Pago de gas: Metrogas · Cliente 83338071', '2026-08-20 16:41:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 575000.00, 'Sueldo', '2026-08-25 09:25:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('DEPOSITO', 112000.00, 'Depósito en efectivo', '2026-09-04 16:08:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 78500.00, 'Compra compartida', '2026-09-07 09:56:00'::timestamp, '0000003100200000118785', 'Thiago Herrera'),
  ('SERVICIO_PAGO', 5540.28, 'Pago de luz: Edenor · Cliente 97003335', '2026-09-13 14:31:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 575000.00, 'Sueldo', '2026-09-22 09:38:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('RECARGA_CELULAR', 1000.00, 'Recarga Claro · 1144892904', '2026-10-03 15:50:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 575000.00, 'Sueldo', '2026-10-23 15:48:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('DEPOSITO', 94000.00, 'Depósito en efectivo', '2026-10-23 09:44:00'::timestamp, NULL, NULL)
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000142542'));

-- Nicolás Molina · DNI 30806249 · 14 movimientos · saldo $ 5024550.44
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Nicolás', 'Molina', '30806249', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Moreno 3392', 'nicolas.molina@mail.com', '1145164732', '1992-04-10', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30806249');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30806249'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30806249'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:17:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000150461');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30806249')), '0000003100200000150461', 'nicolas.molina.tb', 'ARS', 5024550.44 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000150461');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000150461'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 5796.99, 'Pago de agua: Aguas del Plata · Cliente 98674504', '2026-07-08 16:36:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 133500.00, 'Depósito en efectivo', '2026-07-09 13:23:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 131500.00, 'Depósito en efectivo', '2026-07-11 07:30:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 6883.02, 'Pago de luz: Edenor · Cliente 12387473', '2026-07-18 12:48:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 3269.55, 'Pago de agua: Aguas del Plata · Cliente 15032570', '2026-07-21 14:12:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1135000.00, 'Sueldo', '2026-07-23 15:37:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('DEPOSITO', 116000.00, 'Depósito en efectivo', '2026-08-04 10:56:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 84000.00, 'Alquiler', '2026-08-11 07:22:00'::timestamp, '0000003100200000095028', 'Isabella Ruiz'),
  ('TRANSFERENCIA_EGRESO', 24000.00, 'Cena', '2026-08-19 15:21:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('TRANSFERENCIA_INGRESO', 1135000.00, 'Sueldo', '2026-08-25 13:09:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('RECARGA_CELULAR', 5000.00, 'Recarga Claro · 1145164732', '2026-09-20 09:57:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1135000.00, 'Sueldo', '2026-09-25 09:38:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 64500.00, 'Expensas', '2026-10-14 14:14:00'::timestamp, '0000003100200000134623', 'Facundo Aguirre'),
  ('TRANSFERENCIA_INGRESO', 1135000.00, 'Sueldo', '2026-10-24 13:30:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000150461'));

-- Florencia Silva · DNI 30843420 · 13 movimientos · saldo $ 1983152.19
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Florencia', 'Silva', '30843420', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Mitre 175', 'florencia.silva@mail.com', '1145436560', '1967-03-21', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30843420');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30843420'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30843420'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:20:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000158380');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30843420')), '0000003100200000158380', 'florencia.silva.tb', 'ARS', 1983152.19 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000158380');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000158380'), v.* FROM (VALUES
  ('TRANSFERENCIA_EGRESO', 39500.00, 'Viaje', '2026-07-23 17:02:00'::timestamp, '0000003100200000063352', 'Martina Romero'),
  ('TRANSFERENCIA_INGRESO', 520000.00, 'Sueldo', '2026-07-24 13:51:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 6739.83, 'Pago de gas: Metrogas · Cliente 80034919', '2026-07-30 13:31:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 27000.00, 'Compra compartida', '2026-08-03 11:04:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_EGRESO', 77500.00, 'Expensas', '2026-08-17 16:47:00'::timestamp, '0000003100200000126704', 'Julieta Medina'),
  ('TRANSFERENCIA_INGRESO', 520000.00, 'Sueldo', '2026-08-22 13:53:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('TRANSFERENCIA_INGRESO', 76500.00, 'Varios', '2026-08-28 13:17:00'::timestamp, '0000003100200000095028', 'Isabella Ruiz'),
  ('TRANSFERENCIA_EGRESO', 63000.00, 'Cena', '2026-09-22 11:56:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_INGRESO', 520000.00, 'Sueldo', '2026-09-25 10:40:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 4621.29, 'Pago de agua: Aguas del Plata · Cliente 72205072', '2026-09-29 13:41:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 49500.00, 'Depósito en efectivo', '2026-10-13 15:16:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 4486.69, 'Pago de agua: Aguas del Plata · Cliente 51533423', '2026-10-15 17:01:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 520000.00, 'Sueldo', '2026-10-22 16:42:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000158380'));

-- Franco Rojas · DNI 30880591 · 16 movimientos · saldo $ 2246812.09
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Franco', 'Rojas', '30880591', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Urquiza 3853', 'franco.rojas@mail.com', '1145708388', '1998-08-12', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30880591');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30880591'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30880591'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:12:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000166299');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30880591')), '0000003100200000166299', 'franco.rojas.tb', 'ARS', 2246812.09 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000166299');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000166299'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 7250.92, 'Pago de luz: Edenor · Cliente 53893672', '2026-07-10 11:55:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 3000.00, 'Recarga Personal · 1145708388', '2026-07-21 14:19:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 141000.00, 'Depósito en efectivo', '2026-07-24 14:01:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 455000.00, 'Sueldo', '2026-07-26 10:00:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('DEPOSITO', 97000.00, 'Depósito en efectivo', '2026-08-02 17:40:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 9317.23, 'Pago de luz: Edenor · Cliente 52656849', '2026-08-09 14:59:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 455000.00, 'Sueldo', '2026-08-24 07:07:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('TRANSFERENCIA_EGRESO', 62000.00, 'Viaje', '2026-08-27 12:54:00'::timestamp, '0000003100200000015838', 'Sofía Fernández'),
  ('TRANSFERENCIA_INGRESO', 74500.00, 'Préstamo devuelto', '2026-09-14 13:29:00'::timestamp, '0000003100200000174218', 'Milagros Benítez'),
  ('TRANSFERENCIA_INGRESO', 455000.00, 'Sueldo', '2026-09-26 09:07:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur'),
  ('DEPOSITO', 130500.00, 'Depósito en efectivo', '2026-09-26 11:17:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 66000.00, 'Viaje', '2026-09-28 12:26:00'::timestamp, '0000003100200000055433', 'Benjamín Sánchez'),
  ('TRANSFERENCIA_INGRESO', 58000.00, 'Regalo de cumpleaños', '2026-09-30 08:46:00'::timestamp, '0000003100200000102947', 'Lautaro Suárez'),
  ('TRANSFERENCIA_EGRESO', 55000.00, 'Viaje', '2026-10-06 17:38:00'::timestamp, '0000003100200000182137', 'Ignacio Acosta'),
  ('SERVICIO_PAGO', 3619.76, 'Pago de gas: Metrogas · Cliente 75767327', '2026-10-08 07:24:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 455000.00, 'Sueldo', '2026-10-25 10:01:00'::timestamp, '0110599520000001234561', 'Estudio Contable Sur')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000166299'));

-- Milagros Benítez · DNI 30917762 · 16 movimientos · saldo $ 3709310.45
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Milagros', 'Benítez', '30917762', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Belgrano 2230', 'milagros.benitez@mail.com', '1145980216', '1996-08-17', 'Femenino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30917762');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30917762'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30917762'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:17:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000174218');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30917762')), '0000003100200000174218', 'milagros.benitez.tb', 'ARS', 3709310.45 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000174218');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000174218'), v.* FROM (VALUES
  ('TRANSFERENCIA_INGRESO', 62500.00, 'Clases', '2026-07-10 10:16:00'::timestamp, '0000003100200000087109', 'Tomás Torres'),
  ('DEPOSITO', 115000.00, 'Depósito en efectivo', '2026-07-13 11:57:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 45000.00, 'Alquiler', '2026-07-21 07:19:00'::timestamp, '0000003100200000063352', 'Martina Romero'),
  ('TRANSFERENCIA_INGRESO', 890000.00, 'Sueldo', '2026-07-26 12:05:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('SERVICIO_PAGO', 6299.29, 'Pago de gas: Metrogas · Cliente 96631593', '2026-08-02 12:48:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 89500.00, 'Regalo de cumpleaños', '2026-08-07 09:44:00'::timestamp, '0000003100200000087109', 'Tomás Torres'),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Claro · 1145980216', '2026-08-10 09:20:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 890000.00, 'Sueldo', '2026-08-23 09:38:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('SERVICIO_PAGO', 6890.26, 'Pago de gas: Metrogas · Cliente 50078202', '2026-08-25 11:26:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 74500.00, 'Préstamo devuelto', '2026-09-14 16:20:00'::timestamp, '0000003100200000166299', 'Franco Rojas'),
  ('RECARGA_CELULAR', 2000.00, 'Recarga Personal · 1145980216', '2026-09-15 07:04:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 890000.00, 'Sueldo', '2026-09-21 17:33:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA'),
  ('DEPOSITO', 23500.00, 'Depósito en efectivo', '2026-09-28 10:01:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 72500.00, 'Clases', '2026-10-04 07:57:00'::timestamp, '0000003100200000182137', 'Ignacio Acosta'),
  ('TRANSFERENCIA_INGRESO', 68000.00, 'Compra compartida', '2026-10-20 07:22:00'::timestamp, '0000003100200000031676', 'Valentina Martínez'),
  ('TRANSFERENCIA_INGRESO', 890000.00, 'Sueldo', '2026-10-23 17:30:00'::timestamp, '0170099220000004567892', 'Distribuidora Norte SA')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000174218'));

-- Ignacio Acosta · DNI 30954933 · 16 movimientos · saldo $ 2731477.08
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Ignacio', 'Acosta', '30954933', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Moreno 3657', 'ignacio.acosta@mail.com', '1146252044', '2000-11-02', 'Masculino' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30954933');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30954933'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30954933'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:51:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000182137');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30954933')), '0000003100200000182137', 'ignacio.acosta.tb', 'ARS', 2731477.08 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000182137');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000182137'), v.* FROM (VALUES
  ('TRANSFERENCIA_EGRESO', 17500.00, 'Cena', '2026-07-21 07:30:00'::timestamp, '0000003100200000047514', 'Camila Pérez'),
  ('TRANSFERENCIA_INGRESO', 650000.00, 'Sueldo', '2026-07-28 11:53:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('DEPOSITO', 37000.00, 'Depósito en efectivo', '2026-08-06 07:05:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 64500.00, 'Depósito en efectivo', '2026-08-09 12:53:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 108000.00, 'Depósito en efectivo', '2026-08-20 13:53:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 80000.00, 'Cena', '2026-08-20 14:33:00'::timestamp, '0000003100200000015838', 'Sofía Fernández'),
  ('SERVICIO_PAGO', 4662.03, 'Pago de gas: Metrogas · Cliente 26976604', '2026-08-21 14:19:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 650000.00, 'Sueldo', '2026-08-23 14:43:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('RECARGA_CELULAR', 1500.00, 'Recarga Claro · 1146252044', '2026-08-24 14:31:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 70500.00, 'Regalo de cumpleaños', '2026-08-27 08:00:00'::timestamp, '0000003100200000007919', 'Martín Rodríguez'),
  ('TRANSFERENCIA_EGRESO', 22500.00, 'Compra compartida', '2026-09-16 16:58:00'::timestamp, '0000003100200000079190', 'Emilia Álvarez'),
  ('TRANSFERENCIA_INGRESO', 650000.00, 'Sueldo', '2026-09-25 09:30:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús'),
  ('SERVICIO_PAGO', 8860.89, 'Pago de luz: Edenor · Cliente 42332421', '2026-09-29 12:49:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 72500.00, 'Clases', '2026-10-04 11:03:00'::timestamp, '0000003100200000174218', 'Milagros Benítez'),
  ('TRANSFERENCIA_INGRESO', 55000.00, 'Viaje', '2026-10-06 07:52:00'::timestamp, '0000003100200000166299', 'Franco Rojas'),
  ('TRANSFERENCIA_INGRESO', 650000.00, 'Sueldo', '2026-10-24 14:16:00'::timestamp, '0140000701000012345673', 'Municipalidad de Lanús')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000182137'));

-- Delfina Ortiz · DNI 30992104 · 15 movimientos · saldo $ 5259315.64
INSERT INTO Personas (nombre, apellido, dni, password_hash, direccion, email, telefono, fecha_nac, sexo) SELECT 'Delfina', 'Ortiz', '30992104', '$2b$10$hxROaEdLxxI6la7dvgKPiuwKMF2tDRN59hPy5F8YOJOG8LBTUe3Lm', 'Mitre 2694', 'delfina.ortiz@mail.com', '1146523872', '1994-02-15', 'Otro' WHERE NOT EXISTS (SELECT 1 FROM Personas WHERE dni = '30992104');
INSERT INTO Roles_x_Personas (id_persona, id_rol) SELECT (SELECT id FROM Personas WHERE dni = '30992104'), id_rol FROM Roles WHERE nombre_rol = 'Cliente Regular' ON CONFLICT DO NOTHING;
INSERT INTO Productos (id_persona, id_tipo_producto, id_estado_producto, fecha_alta) SELECT (SELECT id FROM Personas WHERE dni = '30992104'), (SELECT id_tipo_producto FROM Tipos_Producto WHERE nombre = 'CAJA_AHORRO'), 1, '2026-06-28 17:22:00' WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000190056');
INSERT INTO Cuentas_Bancarias (id_producto, cbu, alias, moneda, saldo) SELECT (SELECT MAX(id_producto) FROM Productos WHERE id_persona = (SELECT id FROM Personas WHERE dni = '30992104')), '0000003100200000190056', 'delfina.ortiz.tb', 'ARS', 5259315.64 WHERE NOT EXISTS (SELECT 1 FROM Cuentas_Bancarias WHERE cbu = '0000003100200000190056');
INSERT INTO Movimientos (id_cuenta, tipo_movimiento, monto, descripcion, fecha, cbu_contraparte, nombre_contraparte)
SELECT (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000190056'), v.* FROM (VALUES
  ('SERVICIO_PAGO', 5355.61, 'Pago de agua: Aguas del Plata · Cliente 27616973', '2026-07-15 13:49:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 3547.70, 'Pago de agua: Aguas del Plata · Cliente 47630246', '2026-07-16 13:12:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1285000.00, 'Sueldo', '2026-07-26 11:42:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('DEPOSITO', 148000.00, 'Depósito en efectivo', '2026-08-08 11:08:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 49000.00, 'Depósito en efectivo', '2026-08-09 11:25:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_INGRESO', 1285000.00, 'Sueldo', '2026-08-25 11:48:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('TRANSFERENCIA_EGRESO', 22500.00, 'Varios', '2026-09-03 16:35:00'::timestamp, '0000003100200000039595', 'Santiago González'),
  ('TRANSFERENCIA_INGRESO', 1285000.00, 'Sueldo', '2026-09-21 11:06:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga'),
  ('SERVICIO_PAGO', 5870.86, 'Pago de agua: Aguas del Plata · Cliente 28681589', '2026-09-21 12:05:00'::timestamp, NULL, NULL),
  ('DEPOSITO', 48500.00, 'Depósito en efectivo', '2026-10-01 14:22:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 1000.00, 'Recarga Movistar · 1146523872', '2026-10-02 09:13:00'::timestamp, NULL, NULL),
  ('RECARGA_CELULAR', 3000.00, 'Recarga Personal · 1146523872', '2026-10-09 08:24:00'::timestamp, NULL, NULL),
  ('SERVICIO_PAGO', 7910.19, 'Pago de gas: Metrogas · Cliente 86899024', '2026-10-18 10:44:00'::timestamp, NULL, NULL),
  ('TRANSFERENCIA_EGRESO', 77000.00, 'Viaje', '2026-10-22 12:15:00'::timestamp, '0000003100200000102947', 'Lautaro Suárez'),
  ('TRANSFERENCIA_INGRESO', 1285000.00, 'Sueldo', '2026-10-23 14:14:00'::timestamp, '0070999030004321098765', 'Panadería La Espiga')
) AS v(tipo, monto, descripcion, fecha, cbu_c, nombre_c)
WHERE NOT EXISTS (SELECT 1 FROM Movimientos WHERE id_cuenta = (SELECT id_cuenta FROM Cuentas_Bancarias WHERE cbu = '0000003100200000190056'));

COMMIT;

-- Total: 25 clientes y 369 movimientos.
