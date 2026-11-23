import { Routes } from '@angular/router';
import { sesionGuard, invitadoGuard, cambiosGuard } from './shared/guards';
// Público
import { Landingcomponent } from './components/landingcomponent/landingcomponent';
// Cuenta
import { Authcomponent } from './components/authcomponent/authcomponent';
import { Ingresarcomponent } from './components/authcomponent/ingresarcomponent/ingresarcomponent';
import { Registrocomponent } from './components/authcomponent/registrocomponent/registrocomponent';
// App
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { Iniciocomponent } from './components/iniciocomponent/iniciocomponent';
import { Evaluarcomponent } from './components/evaluarcomponent/evaluarcomponent';
import { Riesgoscomponent } from './components/riesgoscomponent/riesgoscomponent';
import { Mapacomponent } from './components/mapacomponent/mapacomponent';
import { Simulacroscomponent } from './components/simulacroscomponent/simulacroscomponent';
import { Jugarcomponent } from './components/simulacroscomponent/jugarcomponent/jugarcomponent';
import { Checklistcomponent } from './components/checklistcomponent/checklistcomponent';
import { Progresocomponent } from './components/progresocomponent/progresocomponent';
import { Perfilcomponent } from './components/perfilcomponent/perfilcomponent';

export const routes: Routes = [
  { path: '', component: Landingcomponent, title: 'SismoListo · Preparación situacional ante sismos' },
  {
    path: 'ingresar', component: Authcomponent, canActivate: [invitadoGuard],
    children: [{ path: '', component: Ingresarcomponent, title: 'Ingresar · SismoListo' }]
  },
  {
    path: 'registro', component: Authcomponent, canActivate: [invitadoGuard],
    children: [{ path: '', component: Registrocomponent, title: 'Crear cuenta · SismoListo' }]
  },
  {
    path: 'app', component: Panelcomponent, canActivate: [sesionGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Iniciocomponent, title: 'Inicio · SismoListo', data: { titulo: 'Inicio' } },
      { path: 'evaluar', component: Evaluarcomponent, canDeactivate: [cambiosGuard], title: 'Evaluar espacio · SismoListo', data: { titulo: 'Evaluar espacio' } },
      { path: 'riesgos', component: Riesgoscomponent, title: 'Mis riesgos · SismoListo', data: { titulo: 'Mis riesgos' } },
      { path: 'mapa', component: Mapacomponent, title: 'Zonas y rutas · SismoListo', data: { titulo: 'Zonas y rutas' } },
      { path: 'simulacros', component: Simulacroscomponent, title: 'Micro-simulacros · SismoListo', data: { titulo: 'Micro-simulacros' } },
      { path: 'simulacros/:id', component: Jugarcomponent, title: 'Simulacro · SismoListo', data: { titulo: 'Micro-simulacro' } },
      { path: 'checklist', component: Checklistcomponent, title: 'Mi checklist · SismoListo', data: { titulo: 'Mi checklist' } },
      { path: 'progreso', component: Progresocomponent, title: 'Progreso · SismoListo', data: { titulo: 'Progreso' } },
      { path: 'perfil', component: Perfilcomponent, title: 'Perfil · SismoListo', data: { titulo: 'Perfil' } },
    ]
  },
  { path: '**', redirectTo: '' }
];
