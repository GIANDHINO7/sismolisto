import { Component, inject } from '@angular/core';
import { Toastservice } from '../../services/toastservice';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toasts" role="status" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="t.tipo"><i>{{ t.tipo === 'ok' ? '✓' : t.tipo === 'warn' ? '!' : '×' }}</i>{{ t.texto }}</div>
      }
    </div>`,
})
export class Toastcomponent {
  toast = inject(Toastservice)
}
