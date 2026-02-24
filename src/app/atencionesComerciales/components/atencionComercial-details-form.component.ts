import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatTabsModule} from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AtencionComercialService } from '../services/atencionComercial.service';
import { AtencionComercial } from '../models/atencionComercial.model';

@Component({
  selector: 'app-atencionComercial-details-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './atencionComercial-details-form.component.html',
  styleUrl: './atencionComercial-details-form.component.scss'
})
export class AtencionComercialDetailsFormComponent implements OnInit {
      form: FormGroup;
      isDetailMode: boolean;
    
      constructor(
        private fb: FormBuilder,
        private atencionComercialService: AtencionComercialService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<AtencionComercialDetailsFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: string; atencionComercial?: AtencionComercial }
        ) {
          this.isDetailMode = data.mode === 'details';
          this.form = this.fb.group({

            codigoAtencion: ['']
            
          });
      }
    
      ngOnInit(): void {
        if (this.isDetailMode && this.data.atencionComercial) {
          this.form.patchValue({
            
            codigoAtencion: this.data.atencionComercial.codigoAtencion || ''
            
          });
        }
      }

      private formatearFecha(fecha: Date): string {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    
      cancelar(): void {
        this.dialogRef.close();
      }
    
}