import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Authservice } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';
import { Iconcomponent } from '../../iconcomponent/iconcomponent';
import { TipoUsuario } from '../../../models/UsuarioDTO';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink, Iconcomponent],
  template: `
  <form class="auth-box" (ngSubmit)="crear()" novalidate>
    <a routerLink="/" class="link" style="font-size:14px"><app-icon name="arrow-left" /> Volver al inicio</a>
    <h1>Crea tu cuenta</h1>
    <p>Te tomará 30 segundos. Personalizamos los espacios y simulacros según tu perfil.</p>
    <div class="type-pick" role="radiogroup" aria-label="Tipo de usuario">
      <button type="button" role="radio" [attr.aria-checked]="tipo() === 'estudiante'" [class.on]="tipo() === 'estudiante'" (click)="elegir('estudiante')"><span>🎓</span><b>Estudiante</b><small>Aulas, labs, biblioteca</small></button>
      <button type="button" role="radio" [attr.aria-checked]="tipo() === 'oficina'" [class.on]="tipo() === 'oficina'" (click)="elegir('oficina')"><span>💼</span><b>Oficina</b><small>Escritorios y salas</small></button>
    </div>
    <div class="field">
      <label for="r-nombre">Nombre completo</label>
      <input id="r-nombre" class="input" name="nombre" [(ngModel)]="nombre" [class.invalid]="intento() && nombre.trim().length < 2" autocomplete="name" placeholder="Ej. Valeria Ramos">
      @if (intento() && nombre.trim().length < 2) { <span class="err">Ingresa tu nombre.</span> }
    </div>
    <div class="field">
      <label for="r-correo">Correo</label>
      <input id="r-correo" class="input" type="email" name="correo" [(ngModel)]="correo" [class.invalid]="intento() && !correoOk()" autocomplete="email" placeholder="tu@correo.com">
      @if (intento() && !correoOk()) { <span class="err">Ingresa un correo válido.</span> }
    </div>
    <div class="field">
      <label for="r-clave">Contraseña ficticia</label>
      <div class="pwd">
        <input id="r-clave" class="input" [type]="ver() ? 'text' : 'password'" name="clave" [(ngModel)]="clave" [class.invalid]="intento() && clave.length < 6" autocomplete="new-password" placeholder="Mínimo 6 caracteres">
        <button type="button" (click)="ver.set(!ver())" [attr.aria-label]="ver() ? 'Ocultar contraseña' : 'Mostrar contraseña'"><app-icon [name]="ver() ? 'eye-off' : 'eye'" /></button>
      </div>
      <div class="bar" style="height:6px;margin-top:4px"><i [style.width.%]="fuerza() * 25" [style.background]="fuerza() < 2 ? 'var(--danger)' : fuerza() < 3 ? 'var(--alert)' : ''"></i></div>
      <span class="hint">No uses una contraseña real: se guarda solo en este navegador.</span>
    </div>
    <label class="check"><input type="checkbox" name="acepto" [(ngModel)]="acepto"> <span>Entiendo que es una demostración académica y que mis datos se guardan localmente.</span></label>
    @if (intento() && !acepto) { <span class="err">Debes aceptar para continuar.</span> }
    @if (error()) { <span class="err">{{ error() }}</span> }
    <button class="btn btn-primary btn-lg btn-block" type="submit">Crear cuenta</button>
    <p style="text-align:center;font-size:14px;color:var(--ink-2)">¿Ya tienes cuenta? <a class="link" routerLink="/ingresar" queryParamsHandling="preserve">Iniciar sesión</a></p>
  </form>`,
})
export class Registrocomponent implements OnInit {
  private auth = inject(Authservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private toast = inject(Toastservice)
  tipo = signal<TipoUsuario>(this.auth.rolElegido())
  ngOnInit() {
    const r = this.route.snapshot.queryParamMap.get('rol')
    if (r === 'estudiante' || r === 'oficina') this.elegir(r)
  }
  elegir(t: TipoUsuario) { this.tipo.set(t); this.auth.elegirRol(t) }
  nombre = ''
  correo = ''
  clave = ''
  acepto = false
  ver = signal(false)
  intento = signal(false)
  error = signal('')

  correoOk() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo) }
  fuerza() {
    const c = this.clave
    return [c.length >= 6, /[A-Z]/.test(c), /\d/.test(c), /[^A-Za-z0-9]/.test(c) || c.length >= 10].filter(Boolean).length
  }

  crear() {
    this.intento.set(true)
    if (this.nombre.trim().length < 2 || !this.correoOk() || this.clave.length < 6 || !this.acepto) return
    const e = this.auth.registrar(this.nombre, this.correo, this.clave, this.tipo())
    if (e) { this.error.set(e); return }
    this.toast.mostrar('¡Cuenta creada! Empecemos tu preparación.')
    this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('volver') || '/app')
  }
}
