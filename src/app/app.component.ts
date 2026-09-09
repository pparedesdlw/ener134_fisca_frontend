import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { LoaderComponent } from './shared/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'tisecweb';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {

    if (!this.authService.currentUserValue) {
      this.authService.setUser({
        username: 'admin',
        rol: 'ADMIN',
        nombre: 'Administrador del Sistema'
      });
    }
  }
}
