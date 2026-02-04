import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './presentation/home/home.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { PeriodoListComponent } from './periodos/components/periodo-list.component';
import { authGuard } from './auth/guards/auth.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'periodos', component: PeriodoListComponent },
      { path: '', redirectTo: '/periodos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }

];
