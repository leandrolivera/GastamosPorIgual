# Estado del Proyecto - GastamosPorIgual 💸

Este documento sirve como bitácora y contexto para reanudar el desarrollo del proyecto en la próxima sesión.

---

## 🎯 Qué se hizo hoy (Resumen de Cambios)

1. **Fase 1: Prototipo Local Completo**
   - Se construyó una aplicación React + Vite Mobile-First con diseño **Glassmorphic** (CSS Vanilla) y temas Claro/Oscuro.
   - Se programó el algoritmo de simplificación de deudas (`src/utils/debtSimplifier.js`).
   - Se implementó la **división selectiva de gastos** (poder tildar quiénes participaron del gasto para dividir en partes iguales sólo entre ellos) respondiendo a sugerencias de diseño.
   - Se vinculó e inicializó el repositorio Git local y se subió con éxito a GitHub: [leandrolivera/GastamosPorIgual](https://github.com/leandrolivera/GastamosPorIgual.git).

2. **Fase 2: Integración de Supabase (Base de datos y Auth)**
   - Se instaló `@supabase/supabase-js` y se configuró `.env` con las claves anon públicas de Supabase.
   - Se creó el archivo [supabase_schema.sql](supabase_schema.sql) con la estructura de las tablas (`profiles`, `groups`, `group_members`, `expenses`, `expense_splits`) y un trigger automático en Postgres para sincronizar registros de Auth con la tabla de perfiles.
   - Se desarrolló la pantalla [Auth.jsx](src/components/Auth.jsx) con login y registro de email/contraseña y soporte para Google.
   - Se reescribió la capa de datos [storage.js](src/services/storage.js) para realizar lecturas/escrituras directas en Supabase en lugar del localStorage.

---

## ⚠️ Detalle del Error Detectado al Crear Grupos

Al intentar crear un grupo, la aplicación arroja un cuadro emergente de **"Error al crear el grupo"** y entra en bucle de carga infinita.

### ¿Por qué ocurre esto?
* **Causa Principal**: Registraste tu cuenta de usuario *antes* de ejecutar el script `supabase_schema.sql` en Supabase.
* Al registrarte primero, la tabla `profiles` no existía o no tenía el trigger de base de datos activado. Por lo tanto, tu usuario existe en la tabla interna de Supabase (`auth.users`) pero **no se creó tu fila correspondiente en la tabla pública `public.profiles`**.
* Al intentar crear un grupo, la app intenta insertar tu `user_id` en la columna `created_by` de la tabla `groups`. Como `created_by` tiene una restricción de clave foránea (`REFERENCES public.profiles(id)`), Postgres rechaza la inserción porque tu ID no existe en perfiles, tirando un error de integridad.

### Solución Inmediata:
Debes ejecutar el siguiente bloque de código en el **SQL Editor** de Supabase para regularizar y copiar tu usuario actual a la tabla de perfiles:

```sql
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

---

## 📋 Tareas Pendientes para la Próxima Sesión

1. **Regularizar Base de Datos**: Ejecutar el SQL anterior en Supabase para sincronizar los perfiles creados previo al trigger.
2. **Mejorar Alertas de Error**: Modificar los bloques `catch` en `src/App.jsx` para mostrar el mensaje de error real devuelto por la base de datos (ej: `alert("Error: " + err.message)`) en lugar de strings genéricos, facilitando el diagnóstico.
3. **Validar Flujo del Grupo**:
   - Crear un grupo con integrantes y validar que no arroje errores de FK.
   - Registrar un gasto equitativo y selectivo desde la PC y el celular para corroborar que impacte en Supabase en tiempo real.
4. **Vincular integrantes registrados de forma dinámica**:
   - Si creás un integrante de texto "Flor" y luego un usuario se registra con ese mismo nombre de perfil, validar que la función de auto-vincular de `storage.js` reemplace el `user_id` nulo de "Flor" por el UUID del usuario logueado en la tabla `group_members`.
