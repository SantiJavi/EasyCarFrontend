import { diasHasta, formatKm } from './format.js'

const MS_DIA = 86400000

/** tipoVista del backend: 1 = por kilometraje, 2 = por tiempo. */
export const TIPO_VISTA_KM = 1
export const TIPO_VISTA_TIEMPO = 2

export function esPorTiempo(tipo) {
  return Number(tipo?.tipoVista) === TIPO_VISTA_TIEMPO
}

export function esPorKilometraje(tipo) {
  return !esPorTiempo(tipo)
}

export function historialDe(vehiculo) {
  return vehiculo?.historial ?? []
}

export function tiposDe(vehiculo) {
  return vehiculo?.tiposMantenimiento ?? []
}

/** Kilometraje actual: el declarado en el vehiculo; si es legacy, el ultimo del historial. */
export function kmActual(vehiculo) {
  const declarado = vehiculo?.kilometrajeActual
  if (declarado !== null && declarado !== undefined) return declarado

  const registros = historialDe(vehiculo).filter(
    (registro) => registro.kilometrajeActual !== null && registro.kilometrajeActual !== undefined,
  )
  if (registros.length === 0) return null

  return [...registros].sort(
    (a, b) =>
      new Date(b.fechaMantenimiento) - new Date(a.fechaMantenimiento) || (b.id ?? 0) - (a.id ?? 0),
  )[0].kilometrajeActual
}

export function ultimaActualizacion(vehiculo) {
  const registros = historialDe(vehiculo).filter((registro) => registro.fechaMantenimiento)
  if (registros.length === 0) return null

  return [...registros].sort(
    (a, b) =>
      new Date(b.fechaMantenimiento) - new Date(a.fechaMantenimiento) || (b.id ?? 0) - (a.id ?? 0),
  )[0].fechaMantenimiento
}

export function registrosDeTipo(vehiculo, tipoId) {
  return historialDe(vehiculo).filter((registro) => registro.tipoMantenimientoId === tipoId)
}

export function ultimoRegistroDeTipo(vehiculo, tipoId) {
  const registros = registrosDeTipo(vehiculo, tipoId).filter(
    (registro) => registro.kilometrajeActual !== null && registro.kilometrajeActual !== undefined,
  )
  if (registros.length === 0) return null

  return [...registros].sort(
    (a, b) =>
      new Date(b.fechaMantenimiento) - new Date(a.fechaMantenimiento) || (b.id ?? 0) - (a.id ?? 0),
  )[0]
}

function limitar(valor) {
  return Math.min(1, Math.max(0, valor))
}

/**
 * Evalua un mantenimiento contra sus metas de kilometraje y de fecha.
 * Si tiene las dos, gana la que se vence primero (el "switch" km/tiempo).
 *
 * @param tipo      mantenimiento programado
 * @param vehiculo  vehiculo con su historial
 * @param opciones.km  kilometraje hipotetico, para previsualizar una actualizacion
 */
export function evaluarTipo(tipo, vehiculo, opciones = {}) {
  const km = opciones.km === undefined ? kmActual(vehiculo) : opciones.km
  const proximoKm = tipo?.kilometrajeObjetivo ?? null
  const proximaFecha = tipo?.fechaSiguienteMantenimiento ?? null
  const ultimo = ultimoRegistroDeTipo(vehiculo, tipo?.id)

  const kmRestantes = km !== null && proximoKm !== null ? proximoKm - km : null
  const diasRestantes = proximaFecha ? diasHasta(proximaFecha) : null

  const intervaloKm =
    ultimo?.kilometrajeActual !== null &&
    ultimo?.kilometrajeActual !== undefined &&
    proximoKm !== null
      ? Math.max(1, proximoKm - ultimo.kilometrajeActual)
      : null

  const intervaloDias =
    ultimo?.fechaMantenimiento && proximaFecha
      ? Math.max(
          1,
          Math.round((new Date(proximaFecha) - new Date(ultimo.fechaMantenimiento)) / MS_DIA),
        )
      : null

  const urgenciaKm = kmRestantes !== null ? kmRestantes / (intervaloKm ?? 5000) : null
  const urgenciaDias = diasRestantes !== null ? diasRestantes / (intervaloDias ?? 180) : null

  let motivo = null
  if (urgenciaKm !== null && urgenciaDias !== null) {
    motivo = urgenciaKm <= urgenciaDias ? 'kilometraje' : 'tiempo'
  } else if (urgenciaKm !== null) {
    motivo = 'kilometraje'
  } else if (urgenciaDias !== null) {
    motivo = 'tiempo'
  }

  const urgencia =
    urgenciaKm === null && urgenciaDias === null
      ? Number.POSITIVE_INFINITY
      : Math.min(
          urgenciaKm ?? Number.POSITIVE_INFINITY,
          urgenciaDias ?? Number.POSITIVE_INFINITY,
        )

  const vencido =
    (kmRestantes !== null && kmRestantes <= 0) || (diasRestantes !== null && diasRestantes < 0)
  // Sin historial no hay intervalo conocido: se usa 1.000 km como ventana de aviso.
  const umbralKm = intervaloKm !== null ? intervaloKm * 0.2 : 1000
  const cercaKm = kmRestantes !== null && kmRestantes > 0 && kmRestantes <= umbralKm
  const cercaDias = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 30

  const progresoKm = kmRestantes !== null && intervaloKm ? limitar(1 - kmRestantes / intervaloKm) : null
  const progresoDias =
    diasRestantes !== null && intervaloDias ? limitar(1 - diasRestantes / intervaloDias) : null
  const progreso = motivo === 'tiempo' ? (progresoDias ?? progresoKm) : (progresoKm ?? progresoDias)

  const textoRestante =
    motivo === 'kilometraje' && kmRestantes !== null
      ? kmRestantes >= 0
        ? `Faltan ${formatKm(kmRestantes)}`
        : `Excedido por ${formatKm(Math.abs(kmRestantes))}`
      : motivo === 'tiempo' && diasRestantes !== null
        ? diasRestantes >= 0
          ? `En ${diasRestantes} dias`
          : `Vencido hace ${Math.abs(diasRestantes)} dias`
        : null

  const base = {
    motivo,
    kmRestantes,
    diasRestantes,
    progreso,
    intervaloKm,
    intervaloDias,
    urgencia,
    textoRestante,
  }

  if (vencido) return { ...base, tono: 'rose', etiqueta: 'Vencido' }
  if (km === null) return { ...base, tono: 'slate', etiqueta: 'Sin km' }
  if (cercaKm || cercaDias) return { ...base, tono: 'amber', etiqueta: 'Proximo' }
  if (kmRestantes === null && diasRestantes === null) return { ...base, tono: 'slate', etiqueta: 'Sin meta' }
  return { ...base, tono: 'emerald', etiqueta: 'Al dia' }
}

export function estadoMantenimiento(tipo, vehiculo) {
  return evaluarTipo(tipo, vehiculo)
}

/** Ordena por lo que se vence primero (kilometraje o fecha). */
export function ordenarPorVencimiento(tipos, vehiculo) {
  return [...tipos].sort((a, b) => evaluarTipo(a, vehiculo).urgencia - evaluarTipo(b, vehiculo).urgencia)
}

export function proximoMantenimiento(vehiculo) {
  return ordenarPorVencimiento(tiposDe(vehiculo), vehiculo)[0] ?? null
}

/**
 * Alertas para la campanita: mantenimientos vencidos o proximos de todos los
 * vehiculos del usuario, ordenados por urgencia.
 */
export function calcularAlertas(vehiculos = []) {
  const alertas = []

  for (const vehiculo of vehiculos) {
    for (const tipo of tiposDe(vehiculo)) {
      const estado = evaluarTipo(tipo, vehiculo)
      if (estado.tono !== 'rose' && estado.tono !== 'amber') continue

      alertas.push({
        clave: `${vehiculo.id}:${tipo.id}:${estado.etiqueta}:${estado.motivo}:${estado.textoRestante}`,
        vehiculoId: vehiculo.id,
        placa: vehiculo.placa,
        nombreVehiculo: vehiculo.nombre || vehiculo.marca,
        tipoId: tipo.id,
        nombre: tipo.nombreMantenimiento,
        etiqueta: estado.etiqueta,
        tono: estado.tono,
        motivo: estado.motivo,
        detalle: estado.textoRestante,
        urgencia: estado.urgencia,
      })
    }
  }

  return alertas.sort((a, b) => a.urgencia - b.urgencia)
}
