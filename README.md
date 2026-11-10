# EasyCar Frontend

Cliente React de EasyCar (API Spring Boot + PostgreSQL). Construido a partir de los
bosquejos `EasyCar1` y `EasyCar2` de la carpeta del proyecto.

Stack: Vite 8, React 19, React Router 7, Tailwind CSS 4 y Context API.

## Arranque

Requisitos: Node 20.19+ y el backend en `http://localhost:8080`.

```bash
npm install
npm run dev      # http://localhost:5173
```

El backend, en otra terminal:

```bash
cd ../easycar && ./gradlew bootRun
```

Build de produccion:

```bash
npm run build
npm run preview
```

En desarrollo `/api` y `/auth` pasan por el proxy de `vite.config.js`. Si el frontend y el
API no comparten dominio, define `VITE_API_URL` (ver `.env.example`) y el CORS del backend.

> `npm install` usa `legacy-peer-deps=true` (`.npmrc`) porque npm 10.8 falla al resolver
> las peer dependencies del bundler. Se puede quitar con npm 11+.

## Variables de entorno

Frontend (Vite expone al navegador **solo** las variables que empiezan por `VITE_`):

| Archivo | Uso |
| --- | --- |
| `.env.example` | plantilla versionada con las claves disponibles |
| `.env.local` | valores de tu maquina (no se versiona) |
| `.env.production` | valores del build de produccion |

`VITE_API_URL` se lee en `src/api/client.js` con `import.meta.env.VITE_API_URL`. Si no se
define, el cliente usa rutas relativas y el proxy de `vite.config.js` las reenvia a
`http://localhost:8080` en desarrollo.

Backend (`easycar/src/main/resources/application.properties`): datasource de PostgreSQL,
`security.jwt.secret` y `security.jwt.expiration-ms`. En produccion esos valores deberian
moverse a variables de entorno del sistema, no al repositorio.

## Pantallas (segun los bosquejos)

| Bosquejo | Ruta | Que hace |
| --- | --- | --- |
| Login | `/login` | POST /auth/login, guarda el JWT |
| — | `/registro` | POST /auth/register y sesion automatica (necesario para crear la cuenta) |
| Pantalla Principal | `/` | "User" + mis vehiculos con kilometraje y proximo mantenimiento |
| Agregar Vehiculo | `/vehiculos/nuevo` | Nombre, Marca, Año, Matrícula y Kilometraje actual |
| Pantalla Vista Por Vehiculo | `/vehiculos/:id` | Km actual, mantenimientos por vencimiento e historial |
| Agregar Mantenimiento | dialogo | Nombre, switch kilometraje/tiempo, frecuencia y observacion |
| Actualizar Kilometraje | dialogo | Solo el km nuevo; al guardar calcula que te toca |
| Registrar cambio | dialogo por mantenimiento | Nuevo objetivo (km o fecha) y crea el historial |

## Decisiones tomadas con el usuario

1. **Matrícula = placa** del vehiculo. **Año** se guarda como `fechaMatricula` con
   `AAAA-01-01`. El campo **Revisión** del bosquejo se omite porque el API no lo tiene.
2. **Kilometraje actual** es una columna propia del vehiculo (`kilometraje_actual` en la
   tabla y `kilometrajeActual` en el API). Se pide al crear el vehiculo y se actualiza con
   `PATCH /api/vehiculos/{id}/kilometraje`, sin registrar mantenimientos.
3. **"Carro Vinculado"** (id carro / clave) no se implementó en esta version.
4. **Frecuencia**: un switch elige el tipo y se guarda en `tipoVista` (1 = kilometraje,
   2 = tiempo). Por kilometraje se pide "cada cuántos km" y se guarda `kilometrajeObjetivo`
   (km actual + frecuencia); por tiempo se pide "cada cuántos meses" y se guarda
   `fechaSiguienteMantenimiento` (hoy + meses). El otro campo queda nulo.
5. **Actualizar kilometraje** solo cambia el km del vehiculo y, al guardar, muestra que
   mantenimiento toca con ese kilometraje (no obliga a marcar nada). Los cambios de
   mantenimiento se registran con el boton **Registrar cambio** de cada tarjeta: ahi se
   crea el historial con el km actual y la fecha de hoy, y se define el nuevo objetivo
   (proximo km si es por kilometraje, proxima fecha si es por tiempo).
6. El **historial** del vehiculo lista solo mantenimientos hechos (mantenimiento, km y
   fecha); las actualizaciones de kilometraje ya no generan registros.

## Mapeo con el API

| UI | Endpoint |
| --- | --- |
| Login / Registro | `POST /auth/login`, `POST /auth/register` |
| Mis vehiculos | `GET /api/user-vehiculo/usuario/{usuarioId}` + `GET /api/vehiculos` |
| Crear vehiculo | `POST /api/vehiculos` + `POST /api/user-vehiculo` |
| Detalle | `GET /api/vehiculos/{id}` (trae mantenimientos e historial anidados) |
| Agregar mantenimiento | `POST /api/tipos-mantenimiento` |
| Actualizar kilometraje | `PATCH /api/vehiculos/{id}/kilometraje` |
| Registrar mantenimiento | `POST /api/historiales` + `PUT /api/tipos-mantenimiento/{id}` |
| Borrar registro | `DELETE /api/historiales/{id}` |

Notas del contrato: `tipoVista` es 1 para mantenimientos por kilometraje y 2 para
mantenimientos por tiempo; las fechas `java.util.Date` se envían como ISO completo
(`AAAA-MM-DDT00:00:00.000Z`).

## Calculo de vencimientos

`src/lib/vehiculo.js` concentra la regla:

- Km restante = `kilometrajeObjetivo - kilometrajeActual` (el del vehiculo).
- Dias restantes = fecha objetivo - hoy.
- Estado: **Vencido** (km o fecha pasados), **Proximo** (queda 20% del intervalo de km o
  30 dias; si el mantenimiento no tiene historial se usan 1.000 km),
  **Al dia**, **Sin km** cuando aun no hay kilometraje registrado.
- La lista se ordena por el menor de esos dos cocientes, es decir "lo que primero se vence",
  como dice la nota del bosquejo.

## Avisos (campanita)

`NotificacionesProvider` calcula, para todos los vehiculos del usuario, los mantenimientos
vencidos o proximos. La campanita del header muestra el numero sin ver y el panel lista
"Te toca / Se acerca <mantenimiento>", indicando **por kilometraje** o **por tiempo** y el
detalle ("Excedido por 800 km", "En 10 dias"), con enlace al vehiculo. Se recalcula al
entrar y despues de guardar una actualizacion, agregar un mantenimiento o borrar un
registro. Al abrir el panel se marcan como vistas.

## Estructura

```
src/
  api/            cliente fetch + un modulo por recurso
  components/
    layout/       AppShell, AuthLayout, ProtectedRoute
    ui/           Button, Field, Modal (hoja inferior en movil), ConfirmDialog,
                  Badge, Feedback (spinner, skeleton, empty, alert)
    vehiculos/    VehiculoCard
    mantenimiento/ MantenimientoCard, AgregarMantenimientoModal, ActualizarKilometrajeModal
    icons/        SVG propios
  context/        AuthContext (JWT) y ToastContext
  hooks/          useAuth, useToast, useApiResource, useFormState
  lib/            cn, buttonClasses, formato de fechas/km, reglas de vehiculo
  pages/          Login, Registro, Panel, NuevoVehiculo, Vehiculo, 404
  router/         rutas
```

## Responsive

- Mobile first: una columna hasta `sm`, dos en escritorio.
- Header compacto con avatar y logout; los formularios usan `inputMode` numerico.
- Los dialogos entran como hoja inferior en movil (`rounded-t-3xl`, `max-h-[92dvh]`) y
  centrados en escritorio.
- La tabla del historial usa fecha corta y menos padding en movil.
- Verificado a 390x844: sin scroll horizontal y sin desbordes.
# EasyCar Frontend
