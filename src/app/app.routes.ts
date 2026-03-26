import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './presentation/home/home.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { PeriodoListComponent } from './periodos/components/periodo-list.component';
import { EmpresaConcesionariaListComponent } from './empresas/components/empresa-concesionaria-list.component';
import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';
import { FeriadoListComponent } from './feriados/components/feriado-list.component';
import { RolListComponent } from './roles/components/rol-list.component';
import { ParametroListComponent } from './parametros/components/parametro-list.component';
import { MuestraListComponent } from './muestras/components/muestra-list.component';
import { ResponsableListComponent } from './responsables/components/responsable-list.component';
import { UsuarioListComponent } from './usuarios/components/usuario-list.component';
import { CalculoCitFormComponent } from './cit/components/calculo-cit-form/calculo-cit-form.component';
import { AtencionComercialListComponent } from './atencionesComerciales/components/atencionComercial-list.component';
import { IndisponibilidadListComponent } from './cit/components/indisponibilidad-list/indisponibilidad-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [roleGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'periodos', component: PeriodoListComponent },
      { path: 'empresaConcesionaria', component: EmpresaConcesionariaListComponent },
      { path: 'feriados', component: FeriadoListComponent },
      { path: 'roles', component: RolListComponent },
      { path: 'parametros', component: ParametroListComponent },
      { path: 'muestras', component: MuestraListComponent },
      { path: 'responsables', component: ResponsableListComponent },
      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'cit/calculo', component: CalculoCitFormComponent },
      { path: 'atencionesComerciales', component: AtencionComercialListComponent },
      { path: 'indisponibilidades', component: IndisponibilidadListComponent },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }

];
