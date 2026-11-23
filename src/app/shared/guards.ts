import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const sesionGuard: CanActivateFn = (_r, state) => {
  const auth = inject(Authservice)
  return auth.logueado() ? true : inject(Router).createUrlTree(['/ingresar'], { queryParams: { volver: state.url } })
}

export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Authservice)
  return auth.logueado() ? inject(Router).createUrlTree(['/app']) : true
}

/** Componentes con cambios sin guardar implementan esta interfaz. */
export interface ConCambios { puedeSalir(): boolean | Promise<boolean> }
export const cambiosGuard: CanDeactivateFn<ConCambios> = c => c.puedeSalir()
