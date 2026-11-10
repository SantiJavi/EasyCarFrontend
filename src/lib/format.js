const LOCALE = 'es-CO'
const MS_DIA = 86400000

export function formatKm(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return `${new Intl.NumberFormat(LOCALE).format(valor)} km`
}

export function formatNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return new Intl.NumberFormat(LOCALE).format(valor)
}

export function formatFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatFechaCorta(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** yyyy-MM-dd para <input type="date"> */
export function toInputDate(valor) {
  if (!valor) return ''
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toISOString().slice(0, 10)
}

/** El backend usa java.util.Date: se envia ISO completo. */
export function toIsoDateTime(inputValue) {
  if (!inputValue) return null
  return `${inputValue}T00:00:00.000Z`
}

export function inicioDelDia(fecha = new Date()) {
  const copia = new Date(fecha)
  copia.setHours(0, 0, 0, 0)
  return copia
}

export function diasHasta(valor, desde = new Date()) {
  if (!valor) return null
  const objetivo = new Date(valor)
  if (Number.isNaN(objetivo.getTime())) return null
  return Math.round((inicioDelDia(objetivo) - inicioDelDia(desde)) / MS_DIA)
}

export function sumarMeses(fecha, meses) {
  const copia = new Date(fecha)
  copia.setMonth(copia.getMonth() + Number(meses || 0))
  return copia
}

export function sumarDias(fecha, dias) {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() + Number(dias || 0))
  return copia
}

/** yyyy-MM-dd de hoy + N dias (la matematica de fechas vive aqui, no en los componentes). */
export function fechaDesdeHoy(dias = 0) {
  return toInputDate(sumarDias(new Date(), dias))
}

export function hoyIso() {
  return new Date().toISOString()
}

export function iniciales(texto = '') {
  return texto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}
