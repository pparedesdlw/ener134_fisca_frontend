import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './presentation/home/home.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { PeriodoListComponent } from './periodos/components/periodo-list.component';
import { EmpresaListComponent } from './empresas/components/empresa-list.component';
import { authGuard } from './auth/guards/auth.guard';
import { FeriadoListComponent } from './feriados/components/feriado-list.component';
import { RolListComponent } from './roles/components/rol-list.component';
import { ParametroListComponent } from './parametros/components/parametro-list.component';
import { MuestraListComponent } from './muestras/components/muestra-list.component';
import { ResponsableListComponent } from './responsables/components/responsable-list.component';
import { UsuarioListComponent } from './usuarios/components/usuario-list.component';
import { CalculoCitFormComponent } from './cit/components/calculo-cit-form/calculo-cit-form.component';
import { CitResumenDashboardComponent } from './cit/components/cit-resumen-dashboard/cit-resumen-dashboard.component';
import { CitResultadosListComponent } from './cit/components/cit-resultados-list/cit-resultados-list.component';
import { AtencionComercialListComponent } from './atencionesComerciales/components/atencionComercial-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'periodos', component: PeriodoListComponent },
      { path: 'empresas', component: EmpresaListComponent },
      { path: 'feriados', component: FeriadoListComponent },
      { path: 'roles', component: RolListComponent },
      { path: 'parametros', component: ParametroListComponent },
      { path: 'muestras', component: MuestraListComponent },
      { path: 'responsables', component: ResponsableListComponent },
      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'cit/calculo', component: CalculoCitFormComponent },
      { path: 'cit/resumen', component: CitResumenDashboardComponent },
      { path: 'cit/resultados', component: CitResultadosListComponent },
      { path: 'atencionesComerciales', component: AtencionComercialListComponent },
      { path: '', redirectTo: '/periodos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }

];
