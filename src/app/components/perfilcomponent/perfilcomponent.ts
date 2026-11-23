import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Authservice } from '../../services/authservice';
import { Datosservice } from '../../services/datosservice';
import { Temaservice } from '../../services/temaservice';
import { Toastservice } from '../../services/toastservice';
import { TipoUsuario } from '../../models/UsuarioDTO';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule, DatePipe, Iconcomponent],
  template: `
  <div class="page-head"><div><h2>Perfil</h2><p>Tus datos de demostración y preferencias.</p></div></div>
  <div class="grid-2" style="align-items:start">
    <form class="card" style="display:grid;gap:16px" (ngSubmit)="guardar()">
      <div style="display:flex;gap:16px;align-items:center">
        <span class="avatar" style="background:var(--safe);width:64px;height:64px;font-size:22px">{{ auth.iniciales() }}</span>
        <div><b style="font-size:18px">{{ auth.usuario()?.nombre }}</b><br><small style="color:var(--ink-3)">{{ auth.usuario()?.correo }} · desde {{ auth.usuario()?.creado | date:'MMM yyyy' }}</small></div>
      </div>
      <div class="field"><label for="p-n">Nombre</label><input id="p-n" class="input" name="nombre" [(ngModel)]="nombre"></div>
      <div class="field"><label for="p-i">Institución (opcional)</label><input id="p-i" class="input" name="inst" [(ngModel)]="institucion" placeholder="Ej. UPC · Campus Monterrico"></div>
      <div class="field">
        <span class="label">Perfil</span>
        <div class="type-pick">
          <button type="button" [class.on]="tipo() === 'estudiante'" (click)="tipo.set('estudiante')"><span>🎓</span><b>Estudiante</b></button>
          <button type="button" [class.on]="tipo() === 'oficina'" (click)="tipo.set('oficina')"><span>💼</span><b>Oficina</b></button>
        </div>
      </div>
      <button class="btn btn-primary" type="submit"><app-icon name="save" /> Guardar cambios</button>
    </form>

    <div style="display:grid;gap:16px">
      <div class="card">
        <h3 class="ct">Preferencias</h3>
        <label class="check" style="justify-content:space-between;align-items:center">
          <span><b style="color:var(--ink)">Modo oscuro</b><br><small style="color:var(--ink-3)">Ideal para la noche o ambientes con poca luz.</small></span>
          <input type="checkbox" [checked]="tema.oscuro()" (change)="tema.alternar()">
        </label>
      </div>
      <div class="card">
        <h3 class="ct">Privacidad</h3>
        <p style="color:var(--ink-2);font-size:14px">Todo se guarda solo en este navegador (localStorage). Nada se envía a servidores ni instituciones.</p>
        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" (click)="exportar()"><app-icon name="download" /> Exportar mis datos</button>
          <button class="btn btn-danger btn-sm" (click)="confirmar.set(true)"><app-icon name="trash" /> Reiniciar progreso</button>
        </div>
      </div>
      <button class="btn btn-ghost" (click)="salir()"><app-icon name="logout" /> Cerrar sesión</button>
    </div>
  </div>

  @if (confirmar()) {
    <div class="overlay" (click)="confirmar.set(false)">
      <div class="modal" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="modal-icon" style="background:var(--danger-soft);color:var(--danger)"><app-icon name="alert" /></div>
        <h3>Confirmar acción</h3>
        <p>Se eliminarán tus evaluaciones, riesgos, resultados y checklist. Tu cuenta se mantiene.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" (click)="confirmar.set(false)">Cancelar</button>
          <button class="btn btn-danger" (click)="reiniciar()">Eliminar</button>
        </div>
      </div>
    </div>
  }`,
})
export class Perfilcomponent {
  auth = inject(Authservice)
  tema = inject(Temaservice)
  private datos = inject(Datosservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  nombre = this.auth.usuario()?.nombre ?? ''
  institucion = this.auth.usuario()?.institucion ?? ''
  tipo = signal<TipoUsuario>(this.auth.usuario()?.tipo ?? 'estudiante')
  confirmar = signal(false)

  guardar() {
    if (this.nombre.trim().length < 2) { this.toast.mostrar('Ingresa un nombre válido', 'bad'); return }
    this.auth.actualizar({ nombre: this.nombre.trim(), institucion: this.institucion.trim(), tipo: this.tipo() })
    this.toast.mostrar('Perfil actualizado')
  }

  exportar() {
    const data = { usuario: this.auth.usuario(), evaluaciones: this.datos.evaluaciones(), riesgos: this.datos.riesgos(), resultados: this.datos.resultados(), checklist: [...this.datos.checklist()] }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = 'sismolisto-mis-datos.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  reiniciar() { this.datos.reiniciar(); this.confirmar.set(false); this.toast.mostrar('Progreso reiniciado', 'warn') }
  salir() { this.auth.logout(); this.router.navigate(['/']) }
}
