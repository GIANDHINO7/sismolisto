import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Authservice, DEMOS } from '../../../services/authservice';
import { Toastservice } from '../../../services/toastservice';
import { Sismoservice } from '../../../services/sismoservice';
import { Iconcomponent } from '../../iconcomponent/iconcomponent';
import { TipoUsuario } from '../../../models/UsuarioDTO';

@Component({
  selector: 'app-ingresar',
  imports: [FormsModule, RouterLink, Iconcomponent],
  template: `
  <form class="auth-box" (ngSubmit)="entrar()" novalidate [class.shake-err]="sacudirError()">
    <a routerLink="/" fragment="portal" class="link" style="font-size:14px"><app-icon name="arrow-left" /> Volver al portal</a>

    <div class="role-switch" role="radiogroup" aria-label="Portal de acceso" [attr.data-rol]="rol()">
      <span class="rs-thumb"></span>
      <button type="button" role="radio" [attr.aria-checked]="rol() === 'estudiante'" (click)="cambiarRol('estudiante')"><span>🎓</span> Estudiante</button>
      <button type="button" role="radio" [attr.aria-checked]="rol() === 'oficina'" (click)="cambiarRol('oficina')"><span>💼</span> Oficina</button>
    </div>

    <h1>{{ rol() === 'estudiante' ? 'Hola, estudiante' : 'Hola, equipo de oficina' }}</h1>
    <p>Ingresa a tu portal {{ rol() === 'estudiante' ? 'de estudiante' : 'de oficina' }} para continuar tu preparación.</p>

    <button type="button" class="demo-card" (click)="autocompletar()" [disabled]="escribiendo()">
      <span class="dc-icon">{{ rol() === 'estudiante' ? '🎓' : '💼' }}</span>
      <span class="dc-txt"><b>Usar cuenta demo</b><small>{{ demo().correo }} · {{ demo().clave }}</small></span>
      <span class="dc-go">{{ escribiendo() ? 'Escribiendo…' : 'Autocompletar' }} <app-icon name="zap" /></span>
    </button>

    <div class="field">
      <label for="l-correo">Correo</label>
      <input id="l-correo" class="input" type="email" name="correo" [(ngModel)]="correo" autocomplete="email" [placeholder]="rol() === 'estudiante' ? 'tu@universidad.edu.pe' : 'tu@empresa.com'">
    </div>
    <div class="field">
      <label for="l-clave">Contraseña ficticia</label>
      <div class="pwd">
        <input id="l-clave" class="input" [type]="ver() ? 'text' : 'password'" name="clave" [(ngModel)]="clave" autocomplete="current-password" placeholder="••••••">
        <button type="button" (click)="ver.set(!ver())" [attr.aria-label]="ver() ? 'Ocultar contraseña' : 'Mostrar contraseña'"><app-icon [name]="ver() ? 'eye-off' : 'eye'" /></button>
      </div>
    </div>
    @if (error()) { <span class="err" role="alert">{{ error() }}</span> }
    <div style="display:flex;justify-content:flex-end">
      <button type="button" class="link" style="background:none;border:0;padding:0;font-size:14px" (click)="olvido()">¿Olvidaste tu contraseña?</button>
    </div>
    <button class="btn btn-primary btn-lg btn-block btn-glow" type="submit" [disabled]="entrando()">
      @if (entrando()) { <span class="spin"></span> Verificando… } @else { Ingresar al portal {{ rol() === 'estudiante' ? 'Estudiante' : 'Oficina' }} <app-icon name="arrow-right" /> }
    </button>
    <div class="demo-note"><app-icon name="info" /><span>Demostración académica: no uses contraseñas reales. Las cuentas existen solo en este navegador.</span></div>
    <p style="text-align:center;font-size:14px;color:var(--ink-2)">¿No tienes cuenta? <a class="link" routerLink="/registro" [queryParams]="{ rol: rol() }">Crear cuenta de {{ rol() }}</a></p>
  </form>`,
})
export class Ingresarcomponent implements OnInit, OnDestroy {
  private auth = inject(Authservice)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private toast = inject(Toastservice)
  private sismo = inject(Sismoservice)
  private cdr = inject(ChangeDetectorRef)
  correo = ''
  clave = ''
  rol = signal<TipoUsuario>(this.auth.rolElegido())
  ver = signal(false)
  error = signal('')
  escribiendo = signal(false)
  entrando = signal(false)
  sacudirError = signal(false)
  demo = () => DEMOS[this.rol()]
  private timers: ReturnType<typeof setTimeout>[] = []

  ngOnInit() {
    const r = this.route.snapshot.queryParamMap.get('rol')
    if (r === 'estudiante' || r === 'oficina') this.cambiarRol(r)
  }
  ngOnDestroy() { this.timers.forEach(clearTimeout) }

  cambiarRol(t: TipoUsuario) {
    this.rol.set(t); this.auth.elegirRol(t); this.error.set('')
    this.sismo.epicentro(innerWidth * .25, innerHeight * .5, .9)
  }

  /** Escribe las credenciales demo letra por letra. */
  autocompletar() {
    this.timers.forEach(clearTimeout); this.timers = []
    this.escribiendo.set(true); this.correo = ''; this.clave = ''; this.error.set('')
    const { correo, clave } = this.demo()
    let t = 0
    ;[...correo].forEach((c, i) => this.timers.push(setTimeout(() => { this.correo = correo.slice(0, i + 1); this.cdr.markForCheck() }, t += 28)))
    t += 120
    ;[...clave].forEach((c, i) => this.timers.push(setTimeout(() => { this.clave = clave.slice(0, i + 1); this.cdr.markForCheck() }, t += 45)))
    this.timers.push(setTimeout(() => this.escribiendo.set(false), t + 50))
  }

  entrar() {
    if (!this.correo || !this.clave) return this.fallo('Completa tu correo y contraseña.')
    const e = this.auth.login(this.correo, this.clave, this.rol())
    if (e) return this.fallo(e)
    this.entrando.set(true)
    this.sismo.bip(660, 90); setTimeout(() => this.sismo.bip(990, 120), 110)
    setTimeout(() => {
      this.toast.mostrar(`¡Hola, ${this.auth.primerNombre()}! Bienvenido a tu portal.`)
      this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('volver') || '/app')
    }, 650)
  }
  olvido() { this.toast.mostrar('En la demo no hay recuperación: usa la cuenta demo o crea una nueva.', 'warn') }

  private fallo(msg: string) {
    this.error.set(msg)
    this.sacudirError.set(false)
    requestAnimationFrame(() => this.sacudirError.set(true))
    this.sismo.bip(180, 200, .1)
  }
}
