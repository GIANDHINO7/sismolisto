import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toastcomponent } from './components/toastcomponent/toastcomponent';
import { Alertacomponent } from './components/alertacomponent/alertacomponent';
import { Authservice } from './services/authservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toastcomponent, Alertacomponent],
  template: `<router-outlet /><app-toast /><app-alerta />`,
})
export class App {
  private auth = inject(Authservice)
  constructor() {
    // Cada rol tiene su propia identidad visual (variables CSS en [data-rol]).
    effect(() => document.documentElement.setAttribute('data-rol', this.auth.rol()))
  }
}
