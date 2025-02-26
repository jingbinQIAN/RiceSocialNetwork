import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegisterationService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) { }
  validateForm(formValues: any): boolean {
    const { accountName, email, phone, dob, zipcode, newpassword, confirmPassword } = formValues;
    console.log(formValues);
    const age = this.calculateAge(dob);
    console.log(dob);

    // All fields are required to input
    if (!accountName || !email || !phone || dob=='Invalid Date' || !zipcode || !newpassword || !confirmPassword) {
      alert('All fields are required to input!');
      return false;
    }

    // Account name validation: must be letters and numbers, not starting with a number
    const accountNamePattern = /^[A-Za-z][A-Za-z0-9]*$/;
    if (!accountNamePattern.test(accountName)) {
      alert('Account name must start with a letter and can only contain letters and numbers.');
      return false;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    // Phone number validation
    const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    if (!phonePattern.test(phone)) {
      alert('Phone number must be in the format XXX-XXX-XXXX.');
      return false;
    }

    // Age validation: 18 or older
    if (age < 18) {
      alert('You must be at least 18 years old to register.');
      return false;
    }

    // Password confirmation validation
    if (newpassword !== confirmPassword) {
      alert('Passwords do not match.');
      return false;
    }

    // Zip code validation
    const zipPattern = /^[0-9]{5}(?:-[0-9]{4})?$/;
    if (!zipPattern.test(zipcode)) {
      alert('Please enter a valid US ZipCode (5-digit or 5+4 format).');
      return false;
    }

    // If everything is valid, return true
    return true;
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    const dayDifference = today.getDate() - dob.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  // Check if the username is unique
  isUsernameUnique(username: string) {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(users => {
        const userExists = users.some(user => user.username === username);
        return !userExists; // Return true if unique, false if already exists
      }),
      catchError(err => {
        console.error('Error checking username:', err);
        return of(true); // Assume unique on error to allow registration to proceed
      })
    );
  }
}
