import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service'; // Import the AuthService
import { RegisterationComponent } from './registeration/registeration.component';
import { Router } from '@angular/router';
import { response } from 'express';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RegisterationComponent]
})
export class AuthComponent {
  // Login fields
  username: string = '';
  password: string = '';
  showLogin: boolean = true;

  @Output() loginSuccess = new EventEmitter<void>();

  constructor(private http: HttpClient,private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        console.log('Login successful:', response);
        alert('Login Successful');
        this.router.navigate(['/main']);
      },
      (error) => {
        console.error('Login failed', error);
        alert('Invalid username or password');
      }
    )
  }

  showRegistration: boolean = false;
  // Toggle between login and registration
  toggleRegistration() {
    this.showRegistration = !this.showRegistration;
    this.showLogin = !this.showLogin;
  }

  googleLogin() {
    window.location.href = 'https://comp531finalwebproject-c7f61df603db.herokuapp.com/auth/google';
  }

  // After Google login, Angular can catch the response if you handle it on the frontend
  handleLoginResponse(response: any) {

    if (response.body.message && response.body.message == "google login successful"){
        // Redirect the user to the main page
        this.router.navigate(['/main']);
    }


  }

}
