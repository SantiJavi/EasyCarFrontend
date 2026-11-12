/**
 * Roles de acceso a un vehiculo. Si la API no manda rol (respuestas antiguas),
 * se asume PROPIETARIO para no bloquear al dueño.
 */
export const ROL = {
  PROPIETARIO: 'PROPIETARIO',
  COLABORADOR: 'COLABORADOR',
  LECTURA: 'LECTURA',
}

export function rolDe(vehiculo) {
  return vehiculo?.rol ?? ROL.PROPIETARIO
}

export function esPropietario(vehiculo) {
  return rolDe(vehiculo) === ROL.PROPIETARIO
}

export function puedeEditar(vehiculo) {
  const rol = rolDe(vehiculo)
  return rol === ROL.PROPIETARIO || rol === ROL.COLABORADOR
}

export function esSoloLectura(vehiculo) {
  return rolDe(vehiculo) === ROL.LECTURA
}

export function etiquetaRol(rol) {
  if (rol === ROL.COLABORADOR) return 'Compartido'
  if (rol === ROL.LECTURA) return 'Solo lectura'
  return 'Propietario'
}
