-- ============================================================
-- 14_empleado_role.sql — Alta del rol EMPLEADO (soporte tecnico)
-- Ejecutar en el SQL Editor de Supabase (o con psql).
-- Es seguro ejecutarlo mas de una vez.
--
-- El EMPLEADO entra al mismo panel (/admin) que el ADMIN, pero en modo
-- consulta: ve cuentas, prestamos, tarjetas y seguros, y puede atender los
-- reportes de problemas. No puede bloquear, cerrar, eliminar, marcar mora ni
-- tocar tarjetas.
-- ============================================================

-- 1. Crear el rol EMPLEADO si todavia no existe
INSERT INTO Roles (nombre_rol, descripcion)
SELECT 'EMPLEADO', 'Soporte tecnico: consulta cuentas y atiende reportes, sin permisos para modificar ni eliminar'
WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'EMPLEADO');

-- 2. Asignar el rol EMPLEADO a una persona ya existente
-- Reemplazar '30111222' por el DNI real del empleado
-- (esa persona debe tener ya su contrasena creada via POST /api/auth/register)
INSERT INTO Roles_x_Personas (id_persona, id_rol)
SELECT per.id, rol.id_rol
FROM Personas per, Roles rol
WHERE per.dni = '30111222' AND rol.nombre_rol = 'EMPLEADO'
ON CONFLICT (id_persona, id_rol) DO NOTHING;
