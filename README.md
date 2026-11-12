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
| Alta de usuario | `/registro-easycar` | POST /auth/register con codigo de registro y sesion automatica. Ruta no enlazada: el login ya no ofrece "crear cuenta" |
| Pantalla Principal | `/` | "User" + mis vehiculos con kilometraje y proximo mantenimiento |
| Agregar Vehiculo | `/vehiculos/nuevo` | Nombre, Marca, Año, Matrícula y Kilometraje actual |
| Pantalla Vista Por Vehiculo | `/vehiculos/:id` | Km actual, mantenimientos por vencimiento e historial |
| Agregar Mantenimiento | dialogo | Nombre, switch kilometraje/fecha, frecuencia y observacion |
| Editar Mantenimiento | dialogo por mantenimiento | Nombre, switch kilometraje/fecha, objetivo y observacion |
| Compartir vehiculo | dialogo por vehiculo | Codigos con vigencia, renovar/revocar y roles de acceso |
| Unirme con codigo | dialogo (Dashboard) | Canjea un codigo y da acceso al vehiculo |
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
   2 = fecha). La frecuencia se persiste en `frecuenciaKm` / `frecuenciaMeses`, y el objetivo
   (`kilometrajeObjetivo` o `fechaSiguienteMantenimiento`) se calcula como base + frecuencia:
   la base es el ultimo servicio de ese mantenimiento o, si nunca se hizo, el kilometraje
   actual / hoy. El boton **Editar** permite cambiar la frecuencia (por ejemplo de cada
   5.000 km a cada 10.000 km) y el objetivo se recalcula solo; al pasar de kilometraje a
   fecha (o al reves) el backend descarta el objetivo que ya no aplica. La frecuencia tambien
   alimenta la barra de progreso, por eso el avance se ve aunque no haya historial.
5. **Actualizar kilometraje** solo cambia el km del vehiculo y, al guardar, muestra que
   mantenimiento toca con ese kilometraje (no obliga a marcar nada). Los cambios de
   mantenimiento se registran con el boton **Registrar cambio** de cada tarjeta: ahi se
   crea el historial con el km actual y la fecha del servicio (por defecto hoy, modificable
   hacia atras, nunca futura) y el nuevo objetivo se mueve segun la frecuencia configurada.
6. El **historial** del vehiculo lista solo mantenimientos hechos (mantenimiento, km y
   fecha); las actualizaciones de kilometraje ya no generan registros.
7. **Acceso compartido**: el propietario genera un codigo con la vigencia que elige (1 a 365
   dias), lo comparte y puede renovarlo (reinicia la cuenta desde hoy) o revocarlo sin
   cambiar el codigo. Quien lo canjea queda como COLABORADOR; el propietario puede pasarlo a
   LECTURA o quitarle el acceso. Al expulsar a alguien se conserva el historial que haya
   registrado: los registros no se borran en cascada, solo se pierde el acceso.
   Permisos: PROPIETARIO administra codigos, roles y puede borrar el vehiculo; COLABORADOR
   edita kilometraje, mantenimientos e historial (incluso registros de otros); LECTURA solo
   consulta. El API valida esto en el servidor, la UI solo oculta los botones.
8. **Alta de usuarios restringida (provisional)**: el login ya no muestra el enlace de registro y
   la ruta publica `/registro` se retiro; el formulario vive en `/registro-easycar` y exige el
   codigo configurado en el backend (`app.registro.codigo`, variable `REGISTRO_CODIGO`). Si el
   servidor no define ese codigo, `POST /auth/register` responde 403 y no se puede crear ninguna
   cuenta. `POST /api/usuarios` tambien lo exige (header `X-Codigo-Registro`). Ocultar la ruta
   solo no protege nada: la restriccion real esta en el API.
9. **Campos de kilometraje**: todos usan el mismo componente (`KmInput` en `ui/Field.jsx`).
   Mientras se escribe se ve con separador de miles es-CO (`52.500`), debajo aparece el valor
   en grande con la cantidad de cifras, y si el numero parece tener un cero de mas se muestra
   un aviso no bloqueante (`lib/kilometraje.js`). El valor que se guarda y se envia al API son
   solo los digitos.

## Mapeo con el API

| UI | Endpoint |
| --- | --- |
| Login / Alta privada | `POST /auth/login`, `POST /auth/register` (requiere `codigo`) |
| Mis vehiculos | `GET /api/vehiculos` (devuelve solo los mios, con mi rol) |
| Crear vehiculo | `POST /api/vehiculos` (el API deja al creador como PROPIETARIO) |
| Detalle | `GET /api/vehiculos/{id}` (trae mantenimientos e historial anidados) |
| Agregar mantenimiento | `POST /api/tipos-mantenimiento` |
| Editar mantenimiento | `PUT /api/tipos-mantenimiento/{id}` |
| Actualizar kilometraje | `PATCH /api/vehiculos/{id}/kilometraje` |
| Registrar mantenimiento | `POST /api/historiales` + `PUT /api/tipos-mantenimiento/{id}` |
| Borrar registro | `DELETE /api/historiales/{id}` |
| Generar / listar codigos | `POST /api/invitaciones`, `GET /api/invitaciones/vehiculo/{vehiculoId}` |
| Renovar / revocar codigo | `PUT /api/invitaciones/{id}/renovar`, `DELETE /api/invitaciones/{id}` |
| Unirme con codigo | `POST /api/invitaciones/canjear/{codigo}` |
| Personas con acceso | `GET /api/vehiculos/{id}/accesos`, `PUT` y `DELETE .../accesos/{usuarioId}` |

Notas del contrato: `tipoVista` es 1 para mantenimientos por kilometraje y 2 para
mantenimientos por fecha; las fechas `java.util.Date` se envían como ISO completo
(`AAAA-MM-DDT00:00:00.000Z`). En `PUT /api/tipos-mantenimiento/{id}` el backend guarda
solo el objetivo que corresponde al `tipoVista` recibido y pone el otro en `null`.

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
    ui/           Button, Field (incluye KmInput), Modal (hoja inferior en movil), ConfirmDialog,
                  Badge, Feedback (spinner, skeleton, empty, alert)
    vehiculos/    VehiculoCard, CompartirVehiculoModal, UnirseConCodigoModal
    mantenimiento/ MantenimientoCard, AgregarMantenimientoModal, EditarMantenimientoModal,
                  TipoFrecuenciaToggle, ActualizarKilometrajeModal, RegistrarMantenimientoModal
    icons/        SVG propios
  context/        AuthContext (JWT) y ToastContext
  hooks/          useAuth, useToast, useApiResource, useFormState
  lib/            cn, buttonClasses, formato de fechas/km, kilometraje (avisos),
                  reglas de vehiculo, permisos (PROPIETARIO / COLABORADOR / LECTURA)
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
