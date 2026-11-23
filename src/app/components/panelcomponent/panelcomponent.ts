import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Logocomponent } from '../logocomponent/logocomponent';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Authservice } from '../../services/authservice';
import { Datosservice } from '../../services/datosservice';
import { Temaservice } from '../../services/temaservice';
import { Sismoservice } from '../../services/sismoservice';

@Component({
  selector: 'app-panel',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logocomponent, Iconcomponent],
  templateUrl: './panelcomponent.html',
})
export class Panelcomponent {
  auth = inject(Authservice)
  datos = inject(Datosservice)
  tema = inject(Temaservice)
  sismo = inject(Sismoservice)
  private router = inject(Router)
  menu = signal(false)

  titulo = toSignal(this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      let r = this.router.routerState.snapshot.root
      while (r.firstChild) r = r.firstChild
      return (r.data?.['titulo'] as string) ?? 'SismoListo'
    })
  ), { initialValue: 'SismoListo' })

  nav = [
    { grupo: 'Preparación', items: [
      { r: 'inicio', t: 'Inicio', i: 'home' },
      { r: 'evaluar', t: 'Evaluar espacio', i: 'clipboard' },
      { r: 'riesgos', t: 'Mis riesgos', i: 'alert', badge: true },
      { r: 'mapa', t: 'Zonas y rutas', i: 'map' },
    ] },
    { grupo: 'Práctica', items: [
      { r: 'simulacros', t: 'Micro-simulacros', i: 'timer' },
      { r: 'checklist', t: 'Mi checklist', i: 'list' },
      { r: 'progreso', t: 'Progreso', i: 'chart' },
    ] },
  ]

  salir() {
    this.auth.logout()
    this.router.navigate(['/'])
  }
}
