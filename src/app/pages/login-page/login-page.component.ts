import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core'; 
import {ChangeDetectionStrategy, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from './../../auth.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { API_URL, API_URL2 } from './../../app.config';
import { API_URLINTER, API_URL2INTER } from './../../app.config';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NgxSpinnerModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements AfterViewInit { 
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  userData = {
    user: '',
    password: '',
  };
  errorMessage: string = '';
  isLoading = false; 
  @ViewChild('userInput') userInput!: ElementRef;

  constructor(
    private route: Router,
    private http: HttpClient,
    public authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngAfterViewInit() {
    this.userInput.nativeElement.focus(); // Enfoca el input de usuario al cargar la página
  }

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true; 

    if (!this.userData.user || !this.userData.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      this.isLoading = false;
      return;
    }

    const formData = new FormData();
    formData.append('user', this.userData.user);
    formData.append('password', this.userData.password);

    const apiUrl = `${API_URL2INTER}logincli/logincli`;

    this.login(apiUrl, formData)

    
  }

  login(apiUrl: any, formData: any): void {
    localStorage.clear()
    this.http.post(apiUrl, formData).subscribe({
      next: (response: any) => {
        if (response.status === false) {
          this.errorMessage = response.message;
          this.isLoading = false;
          this.userData.user = ''; // Limpia el campo de usuario
          this.userData.password = ''; // Limpia el campo de contraseña
          this.userInput.nativeElement.focus(); // Enfoca el input de usuario
        } else {
          this.authService.setToken(response.api_key);
          localStorage.setItem('loginUser', this.userData.user.trim().toUpperCase());
          localStorage.setItem('nombre', response.userdata.nombre);
          localStorage.setItem('nomprv', response.userdata.nomprv);
          localStorage.setItem('usuario', response.userdata.usuario);
          localStorage.setItem('proveed', response.userdata.proveed);
          localStorage.setItem('emailprov', response.userdata.email);
          localStorage.setItem('userType', this.authService.getAccessRole());
          /*if(response.userdata.usuariopadre == 'MASTERPROV'){
            this.route.navigate(['/admin']);
          }else{*/
            this.route.navigate(['/home']);
         // }
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        this.isLoading = false;
        this.userData.user = ''; // Limpia el campo de usuario
        this.userData.password = ''; // Limpia el campo de contraseña
        this.userInput.nativeElement.focus(); // Enfoca el input de usuario
        console.error('Error de autenticación:', error);
      },
    });
  }
}