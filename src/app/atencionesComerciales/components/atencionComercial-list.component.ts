import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AtencionComercialService } from '../services/atencionComercial.service';
import { AtencionComercial } from '../models/atencionComercial.model';
import { AtencionComercialDetailsFormComponent } from './atencionComercial-details-form.component';
import { Asunto } from '../../asuntos/models/asunto.model';
import { AsuntoService } from '../../asuntos/services/asunto.service';
import { Periodo } from '../../periodos/models/periodo.model';
import { PeriodoService } from '../../periodos/services/periodo.service';
import { Empresa } from '../../empresas/models/empresa.model';
import { EmpresaService } from '../../empresas/services/empresa.service';
import { Observable } from 'rxjs';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import {AfterViewInit, ViewChild, inject} from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  selector: 'app-atencionComercial-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './atencionComercial-list.component.html',
  styleUrl: './atencionComercial-list.component.scss',
  providers: [provideNativeDateAdapter(), DatePipe]
})
export class AtencionComercialListComponent implements OnInit, AfterViewInit {

  private _liveAnnouncer = inject(LiveAnnouncer);

  atencionesComerciales: AtencionComercial[] = [];
  displayedColumns: string[] = [
    'codigoAtencion',
    'fechaRecepcion',
    'descripcionCanal',
    'tipoDocumentoCliente',
    'nombreCliente',
    'correoElectronico',
    'telefonoContacto',
    'direccion',
    'descripcionUbigeo',
    'numeroSuministro',
    'razonSocial',
    'descripcionAsunto',
    'estadoAtencion',
    'fechaMaxima',
    'observacion',
    'acciones'
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  pageIndex = 0;
  pageSize = 500;
  totalElements = 0;

  selectedItem = null;

  rango = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  textNombreApellido = new FormControl('');

  dateIniLocal: string = '';
  dateFinLocal: string = '';

  optionsAsunto$!: Observable<Asunto[]>;
  selectedAsuntoOption: string = '';
  selectedAsunto: string = '';

  optionsPeriodo$!: Observable<Periodo[]>;
  selectedPeriodoOption: string = '';

  optionsEmpresa$!: Observable<Empresa[]>;
  selectedEmpresaOption: string = '';

  constructor(
    private asuntoService: AsuntoService,
    private periodoService: PeriodoService,
    private empresaService: EmpresaService,
    private atencionComercialService: AtencionComercialService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.optionsAsunto$ = this.asuntoService.listarTodos();
    this.optionsPeriodo$ = this.periodoService.listarTodos();
    this.optionsEmpresa$ = this.empresaService.listarTodos();
  }

  periodo: Periodo | undefined;
  onItemChangePeriodo(event: MatSelectChange) {
    let sPeriodo = this.validateString(event.value);
    console.log('Valor seleccionado:', sPeriodo);
    if (sPeriodo !== ''){

      let dFechaIni;
      let dFechaFin;
      let dDateIni: Date = new Date();
      let dDateFin: Date = new Date();
      this.periodoService.obtenerPorCodigo(sPeriodo).subscribe((datos) => {
        this.periodo = datos;
        dFechaIni = this.periodo.fechaInicio.split('/');
        dFechaFin = this.periodo.fechaFin.split('/');
        dDateIni = new Date(+dFechaIni[2], +dFechaIni[1] - 1, +dFechaIni[0])
        dDateFin = new Date(+dFechaFin[2], +dFechaFin[1] - 1, +dFechaFin[0])
        if (dFechaIni === undefined){
        this.rango = new FormGroup({
            start: new FormControl<Date | null>(null),
            end: new FormControl<Date | null>(null),
          });
        }else{
          this.rango = new FormGroup({
            start: new FormControl<Date | null>(dDateIni),
            end: new FormControl<Date | null>(dDateFin),
          });
        }
      });
    }
  }
  
  cargarAtencionesComerciales(): void {
    this.isLoadingResults = true;
    const observable = this.atencionComercialService.listarTodos(
        this.pageIndex, this.pageSize
    );

    observable.subscribe({
      next: (data) => {
        this.atencionesComerciales = data;
        this.dataSource.data = this.atencionesComerciales;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoadingResults = false;
        this.isRateLimitReached = data === null;
      },
      error: (error) => {
        this.mostrarError('Error al cargar atenciones comerciales', error);
      }
    });
  }

  isLoadingResults = true;
  isRateLimitReached = false;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.isLoadingResults = false;
    //this.cargarAtencionesComerciales();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  
  cargarAtencionesComercialesMultiples(): void {
    this.isLoadingResults = true;

    let sEmpresa = this.validateString(this.selectedEmpresaOption);
    let sPeriodo = this.validateString(this.selectedPeriodoOption);
    let sAsunto = this.validateString(this.selectedAsunto);

    console.log('periodos:', sPeriodo);
    console.log('groupEmpresas:', sEmpresa);
    console.log('Inicio:', this.rango.value.start?.toString());
    console.log('Fin:', this.rango.value.end?.toString());
    console.log('asunto:', sAsunto);
    console.log('NombreApellido:', this.textNombreApellido.value);
  
    let fechaInicial = this.datePipe.transform(this.rango.value.start, 'yyyy-MM-dd');
    this.dateIniLocal = fechaInicial!;

    let fechaFinal = this.datePipe.transform(this.rango.value.end, 'yyyy-MM-dd');
    this.dateFinLocal = fechaFinal!;
    
    if (fechaFinal === null || fechaFinal === undefined){
      this.isLoadingResults = false;
      this.mostrarInfo("Elegir un rango de fecha Periodo FIscalizacion");
      return;
    }

    if (fechaInicial === null || fechaInicial === undefined){
      this.isLoadingResults = false;
      this.mostrarInfo("Elegir un rango de fecha Periodo FIscalizacion");
      return;
    }

    const observable = this.atencionComercialService.listarPage(
                            this.dateIniLocal, this.dateFinLocal, sAsunto,
                            this.textNombreApellido.value!, sEmpresa
                        );
    observable.subscribe({
      next: (data) => {        
          this.atencionesComerciales = data;
          this.dataSource.data = this.atencionesComerciales;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;
      },
      error: (error) => {
        this.mostrarError('Error al cargar atenciones comerciales', error);
      }
    });
  }

  selectedRow: any;
  detalles(atencionComercial: AtencionComercial, row?: any): void {
    if (row !== undefined){
      this.selectedRow = row;
    }
    const dialogRef = this.dialog.open(AtencionComercialDetailsFormComponent, {
      width: '80%',
      maxWidth: '100vw',
      maxHeight: '85vh',
      data: { mode: 'details', atencionComercial }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarAtencionesComerciales();
      }
    });
  }

  public validateString(sTextValue: string): string {
    let sText = "";
    if (sTextValue === undefined) {
    } else if (sTextValue === null) {
    } else if (sTextValue === "") {
    } else {
      sText = sTextValue;
    }
    return `${sText}`;
  }

  private mostrarError(mensaje: string, error: any): void {
    const errorMsg = error.error?.message || error.message || mensaje;
    this.snackBar.open(errorMsg, 'Cerrar', { duration: 5000 });
    console.error(error);
  }

  private mostrarInfo(mensaje: string): void {
    const infoMsg = mensaje;
    this.snackBar.open(infoMsg, 'Cerrar', { duration: 3000 });
  }

  getEstadoColor(estado?: string): string {
    switch (estado) {
      case 'Activo': return 'primary';
      case 'Inactivo': return 'warn';
      case '': return 'accent';
      default: return '';
    }
  }

}
