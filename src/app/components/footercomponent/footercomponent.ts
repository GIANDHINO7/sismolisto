import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logocomponent } from '../logocomponent/logocomponent';
import { EMERGENCIAS } from '../../data/contenido';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logocomponent],
  template: `
  <footer class="footer">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <app-logo fragment="inicio" />
          <p style="margin-top:16px;max-width:360px;font-size:14px">Preparación situacional ante sismos para estudiantes universitarios y trabajadores de oficina.</p>
          <p style="margin-top:10px;font-size:13px;color:rgba(255,255,255,.5)">Proyecto académico · UPC · IHC y Tecnologías Móviles 2026-2.</p>
          <div class="emergency" aria-label="Números de emergencia en Perú">
            @for (e of emergencias; track e.n) { <a [href]="'tel:' + e.n"><b>{{ e.n }}</b> {{ e.t }}</a> }
          </div>
        </div>
        <div>
          <h4>Producto</h4>
          <ul>
            <li><a routerLink="/" fragment="como-funciona">Cómo funciona</a></li>
            <li><a routerLink="/" fragment="simulacros">Simulacros</a></li>
            <li><a routerLink="/" fragment="beneficios">Beneficios</a></li>
            <li><a routerLink="/registro">Crear cuenta</a></li>
          </ul>
        </div>
        <div>
          <h4>Aprende</h4>
          <ul>
            <li><a routerLink="/" fragment="recursos">Recursos</a></li>
            <li><a routerLink="/" fragment="testimonios">Testimonios</a></li>
            <li><a routerLink="/" fragment="faq">Preguntas frecuentes</a></li>
            <li><a routerLink="/" fragment="contacto">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h4>Proyecto</h4>
          <ul>
            <li><button class="lk" (click)="privacidad.emit()">Política de privacidad (demo)</button></li>
            <li><button class="lk" (click)="compartir.emit()">Compartir SismoListo</button></li>
            <li><a href="mailto:equipo@sismolisto.example">Correo de ejemplo</a></li>
            <li><a href="https://www.instagram.com" target="_blank" rel="noopener">Red social de ejemplo</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 SismoListo. Derechos reservados para esta demostración académica.</span>
        <span>Ante un sismo real, sigue siempre los protocolos oficiales de INDECI y tu institución.</span>
      </div>
    </div>
  </footer>`,
})
export class Footercomponent {
  emergencias = EMERGENCIAS
  privacidad = output<void>()
  compartir = output<void>()
}
