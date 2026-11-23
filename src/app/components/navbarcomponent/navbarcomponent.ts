import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logocomponent } from '../logocomponent/logocomponent';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Temaservice } from '../../services/temaservice';
import { Authservice } from '../../services/authservice';
import { Sismoservice } from '../../services/sismoservice';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Logocomponent, Iconcomponent],
  templateUrl: './navbarcomponent.html',
})
export class Navbarcomponent implements OnInit, OnDestroy {
  tema = inject(Temaservice)
  auth = inject(Authservice)
  sismo = inject(Sismoservice)
  menu = signal(false)
  solid = signal(false)
  activa = signal('inicio')
  private io?: IntersectionObserver

  links = [
    { id: 'portal', t: 'Portal' },
    { id: 'laboratorio', t: 'Laboratorio' },
    { id: 'como-funciona', t: 'Cómo funciona' },
    { id: 'simulacros', t: 'Simulacros' },
    { id: 'recursos', t: 'Recursos' },
    { id: 'contacto', t: 'Contacto' },
  ]

  ngOnInit() {
    this.onScroll()
    setTimeout(() => {
      this.io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && this.activa.set(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
      document.querySelectorAll('section[id]').forEach(s => this.io!.observe(s))
    })
  }
  ngOnDestroy() { this.io?.disconnect() }

  @HostListener('window:scroll')
  onScroll() { this.solid.set(window.scrollY > 40) }

  @HostListener('document:keydown.escape')
  cerrar() { this.menu.set(false) }
}
