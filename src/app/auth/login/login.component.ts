import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

import { MaterialModule } from '../../shared/material/material.module';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  hidePassword = true;
  isLoading = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor(public router: Router
  ) {
  }

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  login(): void {
    if (this.form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.form.disable();

    const request: LoginRequest = {
      username: this.form.value.username ?? undefined,
      password: this.form.value.password ?? undefined
    };

    console.log('Login attempt:', request.username);

    this.authService.login(request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.form.enable();
        })
      )
      .subscribe({
        next: (res) => {
          sessionStorage.setItem('isAuthenticated', 'true');
          this.router.navigate(['/periodos']);
        },
        error: (err) => {
          console.error('Error during login:', err);
          // Opcional: Mostrar algún mensaje de error al usuario
        }
      });
  }
}
