import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterationService } from './registeration.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registeration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registeration.component.html',
  styleUrl: './registeration.component.css'
})


export class RegisterationComponent {
  // Registration fields
  username: string = '';
  displayName: string = '';
  email: string = '';
  phone: string = '';
  dob: string = '';
  zipcode: string = '';
  newpassword: string = '';
  confirmPassword: string = '';
  timestamp: number = Date.now();

  private apiUrl = 'https://comp531finalwebproject-c7f61df603db.herokuapp.com';

  @Output() registerSuccess = new EventEmitter<void>();

  constructor(private http: HttpClient, private router: Router, private RegisterationService: RegisterationService) {}

  clearForm() {
    this.username = '';
    this.displayName = '';
    this.email = '';
    this.phone = '';
    this.dob = '';
    this.zipcode = '';
    this.newpassword = '';
    this.confirmPassword = '';
  }


  onRegister() {
    console.log(this.displayName);
    if (this.displayName == ''){
      this.displayName = "anonymity";
    }
    console.log('Form data before transfer:', this.username);
    const formValues = {
      accountName: this.username,
      email: this.email,
      phone: this.phone,
      dob: new Date(this.dob),
      zipcode: this.zipcode,
      newpassword: this.newpassword,
      confirmPassword: this.confirmPassword
    };

    if (this.RegisterationService.validateForm(formValues)) {
      this.http.post(`${this.apiUrl}/register`, { "username": this.username, "email":this.email, "dob": this.dob, "phone": this.phone, "zipcode": this.zipcode, "password": this.newpassword}, { withCredentials: true }).subscribe(
        (response) => {
          console.log('Register successful:', response);
          alert('Register Successful');
        },
        (error) => {
          alert('Register Failed. (user may exist.)');
          console.error('Register failed', error);
        }
      );
    }

  }
}
