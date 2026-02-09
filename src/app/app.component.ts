import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'tisec-frontend';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Inicializar usuario por defecto si no existe
    if (!this.authService.currentUserValue) {
      this.authService.setUser({
        username: 'admin',
        rol: 'ADMIN',
        nombre: 'Administrador del Sistema'
      });
    }
  }
}
