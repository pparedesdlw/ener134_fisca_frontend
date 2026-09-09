# TISEC-WEB Frontend

Aplicación web Angular para el sistema **TISEC-WEB** de fiscalización del sector energético de OSINERGMIN.

| Atributo         | Valor                           |
|------------------|---------------------------------|
| Versión          | 0.0.0                           |
| Angular          | 18.2                            |
| Angular Material | 18.2                            |
| Angular CLI      | 18.2.21                         |
| TypeScript       | 5.5                             |
| Node             | ≥ 18 (recomendado LTS)          |
| Backend          | `http://localhost:8084` (local) |

----

## Requisitos previos

- **Node.js ≥ 18** (se recomienda la versión LTS)
- **npm ≥ 9** (incluido con Node.js)
- **Angular CLI 18**: `npm install -g @angular/cli@18`
- Acceso al backend TISEC corriendo (ver `ener134_fisca_backend`)

---

## Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo> && cd ener134_fisca_frontend

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo
ng serve
```

La aplicación queda disponible en `http://localhost:4200/`.  
Se recarga automáticamente al modificar archivos fuente.

---

## Entornos y builds

El proyecto dispone de tres configuraciones de entorno definidas en `src/environments/`:

| Configuración | Archivo                    | URL del backend                                                  |
|---------------|----------------------------|------------------------------------------------------------------|
| Local (por defecto) | `environment.ts`     | `http://localhost:8084`                                          |
| Desarrollo    | `environment.dev.ts`       | `https://srvdesatisecweb.osinergmin.gob.pe/tisecweb`             |
| Certificación | `environment.cert.ts`      | `https://srvcerttisecweb.osinergmin.gob.pe/tisecweb`             |
| Producción    | `environment.prod.ts`      | `https://tisecweb.osinergmin.gob.pe/tisecweb`                    |

### Comandos de build

```bash
# Build local/desarrollo (defecto)
ng build

# Build para certificación
npm run build:cert

# Build para producción
npm run build:prod
```

Los artefactos se generan en la carpeta `dist/`.

---

## Estructura del proyecto

```
src/
├── index.html
├── main.ts
├── styles.scss                     # Estilos globales
├── environments/                   # Variables por entorno
└── app/
    ├── app.component.{ts,html,scss}
    ├── app.config.ts               # Configuración global (providers, interceptores)
    ├── app.routes.ts               # Definición de rutas
    ├── auth/                       # Autenticación (login, guards, interceptor)
    ├── core/                       # Interceptores globales (error, loader)
    ├── layout/                     # Layout principal (sidebar/toolbar)
    ├── presentation/               # Pantalla de inicio (Home)
    ├── shared/                     # Componentes y utilidades compartidas
    │   ├── loader/                 # Spinner de carga global
    │   └── material/               # Módulo de Angular Material
    ├── periodos/                   # Gestión de periodos de fiscalización
    ├── empresas/                   # Empresas concesionarias
    ├── feriados/                   # Gestión de feriados
    ├── roles/                      # Gestión de roles
    ├── parametros/                 # Parámetros del sistema
    ├── muestras/                   # Gestión de muestras (CIT)
    ├── responsables/               # Gestión de responsables
    ├── usuarios/                   # Gestión de usuarios
    ├── asuntos/                    # Catálogo de asuntos
    ├── ubigeos/                    # Ubigeo (dpto/provincia/distrito)
    ├── atencionesComerciales/      # Atenciones comerciales
    ├── cit/                        # CIT: cálculo e indisponibilidades
    ├── evaluacionCit/              # Evaluación CIT por empresa
    ├── registroCerrado/            # Registros cerrados
    ├── muestraAiv/                 # Muestra AIV
    ├── evaluacionAiv/              # Evaluación AIV
    ├── sustentoAiv/                # Sustento AIV
    ├── historicoAiv/               # Histórico AIV
    └── indicadoresGraficos/        # Indicadores y gráficos
```

---

## Rutas

| Ruta                    | Componente                      | Descripción                          |
|-------------------------|---------------------------------|--------------------------------------|
| `/login`                | `LoginComponent`                | Pantalla de inicio de sesión         |
| `/home`                 | `HomeComponent`                 | Pantalla principal                   |
| `/periodos`             | `PeriodoListComponent`          | Gestión de periodos                  |
| `/empresaConcesionaria` | `EmpresaConcesionariaListComponent` | Empresas concesionarias          |
| `/feriados`             | `FeriadoListComponent`          | Feriados                             |
| `/roles`                | `RolListComponent`              | Roles de usuario                     |
| `/parametros`           | `ParametroListComponent`        | Parámetros del sistema               |
| `/muestras`             | `MuestraListComponent`          | Muestras CIT                         |
| `/responsables`         | `ResponsableListComponent`      | Responsables                         |
| `/usuarios`             | `UsuarioListComponent`          | Usuarios                             |
| `/cit/calculo`          | `CalculoCitFormComponent`       | Cálculo del CIT                      |
| `/atencionesComerciales`| `AtencionComercialListComponent`| Atenciones comerciales               |
| `/indisponibilidades`   | `IndisponibilidadListComponent` | Periodos de indisponibilidad         |
| `/registros-cerrados`   | `RegistroCerradoListComponent`  | Registros cerrados                   |
| `/muestra-aiv`          | `MuestraAivListComponent`       | Muestra AIV                          |
| `/evaluacion-aiv`       | `EvaluacionAivComponent`        | Evaluación AIV                       |
| `/sustento-aiv`         | `SustentoAivComponent`          | Sustento AIV                         |
| `/historico-aiv`        | `HistoricoAivComponent`         | Histórico AIV                        |
| `/indicadores-graficos` | `IndicadoresGraficosComponent`  | Indicadores y gráficos               |
| `/evaluacion-cit`       | `EvaluacionCitComponent`        | Evaluación CIT                       |

Todas las rutas bajo el layout principal están protegidas por `authGuard` y `roleGuard`.

---

## Interceptores HTTP

| Interceptor        | Archivo                              | Función                                               |
|--------------------|--------------------------------------|-------------------------------------------------------|
| `authInterceptor`  | `auth/interceptors/auth.interceptor` | Adjunta el JWT al header `Authorization: Bearer ...`  |
| `errorInterceptor` | `core/interceptors/error.interceptor`| Manejo centralizado de errores HTTP (401, 403, 5xx)   |
| `loaderInterceptor`| `core/interceptors/loader.interceptor`| Muestra/oculta el spinner global durante peticiones  |

---

## Guards de rutas

| Guard        | Descripción                                                      |
|--------------|------------------------------------------------------------------|
| `authGuard`  | Verifica que el usuario esté autenticado (token válido)          |
| `roleGuard`  | Verifica que el usuario tenga el rol requerido para la ruta      |

---

## Stack tecnológico

| Librería                  | Versión  | Uso                                  |
|---------------------------|----------|--------------------------------------|
| `@angular/core`           | 18.2     | Framework principal                  |
| `@angular/material`       | 18.2     | Componentes UI (tablas, dialogs, etc)|
| `@angular/cdk`            | 18.2     | Primitivas de UI                     |
| `@angular/router`         | 18.2     | Enrutamiento SPA                     |
| `@angular/forms`          | 18.2     | Formularios reactivos                |
| `ngx-spinner`             | 18.0     | Spinner de carga global              |
| `rxjs`                    | 7.8      | Programación reactiva                |

---

## Tests unitarios

```bash
ng test
```

Ejecuta los tests con [Karma](https://karma-runner.github.io) y Jasmine.  
El reporte de cobertura se genera en `coverage/`.

---

## Generación de código (CLI)

```bash
# Componente
ng generate component nombre-del-componente

# Servicio
ng generate service nombre-del-servicio

# Guard
ng generate guard nombre-del-guard
```

---

## Referencias

- [Angular CLI](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io)
- [TISEC-WEB Backend](../ener134_fisca_backend/README.md)
