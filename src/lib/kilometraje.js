import { formatKm } from './format.js'

/**
 * Avisos de kilometraje: no bloquean el guardado, solo advierten cuando el valor
 * parece desproporcionado (tipico caso: 10.000 tecleado como 100.000).
 */
const UN_MILLON = 1_000_000
const SALTO_GRANDE = 100_000
const FRECUENCIA_ALTA = 50_000

function mitad(numero) {
  return formatKm(Math.max(1, Math.round(numero / 10)))
}

/** Kilometraje del vehiculo (alta o actualizacion). */
export function avisoKmActual(valor, actual = null) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero <= 0) return null

  if (numero >= UN_MILLON) {
    return `Son ${formatKm(numero)}. Si querias ${mitad(numero)}, sobra un cero.`
  }
  if (actual !== null && numero - actual > SALTO_GRANDE) {
    return `Sube ${formatKm(numero - actual)} de una vez; revisa el valor.`
  }
  return null
}

/**
 * Kilometraje por debajo del registrado. No bloquea el guardado: existe para
 * corregir un error de captura, pero se avisa porque puede dejar metas de
 * mantenimiento por delante del tablero real.
 */
export function avisoKmMenor(valor, actual = null) {
  if (valor === '' || valor === null || valor === undefined) return null
  if (actual === null || actual === undefined) return null

  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero >= actual) return null

  return `Queda ${formatKm(actual - numero)} por debajo de lo registrado (${formatKm(
    actual,
  )}). Se guarda igual: usalo solo para corregir un error.`
}

/** Proximo kilometraje objetivo de un mantenimiento. */
export function avisoProximoKm(valor, { actual = null, frecuencia = null } = {}) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero <= 0) return null
  if (actual === null || !frecuencia) return null

  const esperado = actual + frecuencia
  // Solo se avisa cuando el objetivo se aleja mas de un intervalo extra de lo esperado.
  if (numero <= esperado + frecuencia) return null

  const alternativa = Math.round(numero / 10)
  const pista =
    alternativa > actual && alternativa <= esperado + frecuencia
      ? ` Si querias ${formatKm(alternativa)}, sobra un cero.`
      : ''
  return `El objetivo de ${formatKm(numero)} queda muy por encima de lo esperado (${formatKm(
    esperado,
  )}).${pista}`
}

/** Frecuencia en kilometros de un mantenimiento. */
export function avisoFrecuenciaKm(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero <= 0) return null

  if (numero > FRECUENCIA_ALTA) {
    return `Cada ${formatKm(numero)} es una frecuencia poco comun. Si querias ${mitad(
      numero,
    )}, sobra un cero.`
  }
  return null
}
