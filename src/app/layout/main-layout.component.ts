import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { RUTAS_PERMITIDAS_NO_ADMIN } from '../auth/config/rutas-permitidas.config';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  menuSections: any[] = [];

  allMenuSections = [
    {
      label: 'Atención Comercial',
      icon: 'storefront',
      expanded: true,
      subsections: [
        {
          label: 'Fiscalización',
          items: [
            { label: 'Acceso a la información', path: '', disabled: true },
            { label: 'Comprobación de la información a transferir', path: '/cit/calculo', disabled: false }
          ]
        },
        {
          label: 'Consultas',
          items: [
            { label: 'Atenciones Comerciales', path: '/atencionesComerciales', disabled: false }
          ]
        },
        {
          label: 'Maestros',
          items: [
            { label: 'Definir tamaño de muestra', path: '/muestras', disabled: false },
            { label: 'Definir parámetros', path: '/parametros', disabled: false }
          ]
        }
      ]
    },
    {
      label: 'Fiscalización',
      icon: 'gavel',
      expanded: false,
      subsections: [
        {
          label: 'Distribución',
          items: [
            { label: 'Alumbrado público', path: '', disabled: true },
            { label: 'Seguridad pública', path: '', disabled: true }
          ]
        },
        {
          label: 'Comercialización',
          items: [
            { label: 'Reclamos', path: '', disabled: true },
            { label: 'Atención telefónica', path: '', disabled: true },
            { label: 'Factura', path: '', disabled: true }
          ]
        },
        {
          label: 'Calidad de Servicio',
          items: [
            { label: 'Calidad procedimiento', path: '', disabled: true }
          ]
        },
        {
          label: 'Fuerza Mayor',
          items: []
        }
      ]
    },
    {
      label: 'Fiscalización AIV / CIT',
      icon: 'rule',
      expanded: true,
      subsections: [
        {
          label: 'AIV',
          items: [
            { label: 'Registros cerrados', path: '/registros-cerrados', disabled: false },
            { label: 'Muestra AIV', path: '/muestra-aiv', disabled: false },
            { label: 'Evaluación AIV', path: '/evaluacion-aiv', disabled: false },
            { label: 'Sustentos', path: '/sustento-aiv', disabled: false },
            { label: 'Histórico AIV', path: '/historico-aiv', disabled: false },
            { label: 'Indicadores y gráficos', path: '/indicadores-graficos', disabled: false }
          ]
        }
      ]
    },
    {
      label: 'Configuración',
      icon: 'settings',
      expanded: false,
      subsections: [
        {
          label: 'Maestros',
          items: [
            { label: 'Feriados', path: '/feriados', disabled: false },
            { label: 'Periodo de fiscalización', path: '/periodos', disabled: false },
            { label: 'Empresas concesionarias', path: '/empresaConcesionaria', disabled: false },
            { label: 'Empresas supervisoras', path: '/empresas-supervisoras', disabled: true },
            { label: 'Responsables instrucción', path: '/responsables', disabled: false },
            { label: 'Roles', path: '/roles', disabled: false }
          ]
        }
      ]
    }
  ];

  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    this.filterMenus();
  }

  filterMenus(): void {
    const currentUserStr = sessionStorage.getItem('currentUser');
    let isTisecAdmin = false;

    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser && currentUser.roles && Array.isArray(currentUser.roles)) {
          isTisecAdmin = currentUser.roles.some((role: any) => role.nombre === 'TISEC-ADMIN');
        }
      } catch (e) {
        console.error('Error parsing currentUser from sessionStorage:', e);
      }
    }

    if (isTisecAdmin) {
      this.menuSections = [...this.allMenuSections];
    } else {
      this.menuSections = this.allMenuSections.map(section => {
        const newSubsections = section.subsections.map(sub => {
          const newItems = sub.items.filter(item => RUTAS_PERMITIDAS_NO_ADMIN.includes(item.path));
          return { ...sub, items: newItems };
        }).filter(sub => sub.items.length > 0);
        
        return { ...section, subsections: newSubsections };
      }).filter(section => section.subsections.length > 0);
    }
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
}
