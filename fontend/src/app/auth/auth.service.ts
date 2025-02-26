import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://comp531finalwebproject-c7f61df603db.herokuapp.com';
  private authenticatedUser: any = null; // Store authenticated user data
  isAuthenticated: boolean = false; // Track authentication state
  

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    
    return this.http.post(`${this.apiUrl}/login`, { "username": username, "password": password }, { withCredentials: true, observe: 'response' });
  }

  logout() {
    return this.http.put(`${this.apiUrl}/logout`, {});
  }


}
