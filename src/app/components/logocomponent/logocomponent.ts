import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a class="brand" [routerLink]="link()" [fragment]="fragment()" aria-label="SismoListo, ir al inicio">
      <span class="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#19C37D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 13h4l2-6 3 11 3-8 2 3h6"/>
        </svg>
      </span>
      <span>Sismo<b>Listo</b></span>
    </a>`,
  host: { style: 'display:contents' },
})
export class Logocomponent {
  link = input<string>('/')
  fragment = input<string | undefined>(undefined)
}
