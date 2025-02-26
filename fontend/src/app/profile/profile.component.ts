import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {
  currentuser: string = '';
  currentID: number = 0;
  currentEmail: string = '';
  currentPhone: string = '';
  currentZipcode: string = '';
  currentPassword: string = ''
  currentDOB: string = ''; // Add current date of birth
  currentName: string = ''; // Add current user's name;
  profilePicture: string = '';
  providers: { [key: string]: string } = {};

  // Temporary variables for input changes
  updatedUser: string = '';
  updatedEmail: string = '';
  updatedPhone: string = '';
  updatedZipcode: string = '';
  updatedPassword: string = '';

  

  private apiUrl = 'https://comp531finalwebproject-c7f61df603db.herokuapp.com';

  newProfilePicture: File | null = null; // To store the selected profile picture
  previewProfilePictureUrl: string | null = null; // URL for image preview
  uploadMessage: string | null = null;

  // Utility function to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}


  // get the user profile's from backend
  ngOnInit(): void {
    this.http.get(`${this.apiUrl}/email`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.currentuser = response.body.username;
      this.currentEmail = response.body.email;
    });
    this.http.get(`${this.apiUrl}/phone`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.currentPhone = response.body.phone;
    });
    this.http.get(`${this.apiUrl}/zipcode`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.currentZipcode = response.body.zipcode;
    });
    this.currentPassword = "*******"; // show a fixed number of "*" for the password because we haven't implemented it in backend.
    this.http.get(`${this.apiUrl}/dob`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.currentDOB = this.formatDate(response.body.dob);
    });
    this.http.get(`${this.apiUrl}/avatar`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.profilePicture = response.body.avatar;
    });

    this.http.get(`${this.apiUrl}/authprovider`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
      this.providers = response.body.provider;
      console.log("test provider: ", this.providers["local"]);
    });
  }

  showLinkButton(): boolean {
    return !!this.providers['google'] && !this.providers['local'];
  }
  
  showUnlinkButton(): boolean {
    return !!this.providers['google'] && !!this.providers['local'];
  }   


  // Handle linking of local account
  linkAccount(username: string, password: string): void {
    this.http.put(`${this.apiUrl}/link`, {"localusername": username, "localpassword": password, "googleId": this.providers['google']}, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response) => {
          console.log('Account linked successfully:', response.body);
          alert("Link successfully! Please Login again using Local Account or Google Account!");
          this.router.navigate(['/login']); // Navigate to the main view
        },
        error: (error) => {
          console.error('Failed to link account:', error);
          alert("Failed to link account. Please check username and password");
        }
      });
  }

  // Handle unlinking of local account
  unlinkAccount(): void {
    this.http.put(`${this.apiUrl}/unlink`, {}, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response) => {
          console.log('Account unlinked successfully:', response.body);
          alert("Unlink successfully! Please Login again using Local Account!");
          this.router.navigate(['/login']); // Navigate to the main view
        },
        error: (error) => {
          console.error('Failed to unlink account:', error);
        }
      });
  }

  

  onProfilePictureSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.newProfilePicture = event.target.files[0];
      // Check if newProfilePicture is not null before using it
      if (this.newProfilePicture) {
        const reader = new FileReader();
        reader.onload = (e) => this.previewProfilePictureUrl = e.target?.result as string;
        reader.readAsDataURL(this.newProfilePicture);
      }
    }
  }

  uploadProfilePicture(): void {
    if (!this.newProfilePicture) return;

    const formData = new FormData();
    formData.append('image', this.newProfilePicture);

    this.http.put(`${this.apiUrl}/avatar`, formData, { withCredentials: true, observe: 'response'  }).subscribe(
      (response: any) => {
        this.http.get(`${this.apiUrl}/avatar`, { withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.profilePicture = response.body.avatar;
        });
        console.log("Update avatar successful ", response.body);
        this.uploadMessage = 'Profile picture uploaded successfully!';
        this.clearProfilePicturePreview();
      },
      (error) => {
        console.error('Upload failed:', error);
        this.uploadMessage = 'Failed to upload profile picture. Please try again.';
      }
    );
  }

  

  // Save changes and update the displayed user data (non-persistent)
  saveProfile() {
    // Validate only changed fields
    // Check if all fields are empty or null
    if (
      !this.updatedEmail && 
      !this.updatedPhone && 
      !this.updatedZipcode && 
      !this.updatedPassword && 
      !this.newProfilePicture
    ) 
    {
      alert('Please make at least one change to your profile.');
      return; // Stop further execution
    }

    // If the email field has changed
    if (this.updatedEmail !== this.currentEmail && this.updatedEmail !== '') {
      if (!this.validateEmail(this.updatedEmail)) {
        alert('Please enter a valid email address.');
        return;
      } else {
        this.http.put(`${this.apiUrl}/email`, {"email": this.updatedEmail},{ withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.currentEmail = response.body.email;
          console.log("update email success: ", response.body.email);
        });
      }
    }


    // If the phone field has changed
    if (this.updatedPhone !== this.currentPhone && this.updatedPhone !== '') {
      if (!this.validatePhone(this.updatedPhone)) {
        alert('Please enter a valid phone number (format: xxx-xxx-xxxx).');
        return;
      } else {
        this.http.put(`${this.apiUrl}/phone`, {"phone": this.updatedPhone},{ withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.currentPhone = response.body.phone;
          console.log("update phone success: ", response.body.phone);
        });
      }
    }

    // If the zipcode field has changed
    if (this.updatedZipcode !== this.currentZipcode && this.updatedZipcode !== '') {
      if (!this.validateZipcode(this.updatedZipcode)) {
        alert('Please enter a valid zipcode (format: 12345 or 12345-6789).');
        return;
      } else {
        this.http.put(`${this.apiUrl}/zipcode`, {"zipcode": this.updatedZipcode},{ withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
          this.currentZipcode = response.body.zipcode;
          console.log("update zipcode success: ", response.body.zipcode);
        });
      }
    }

    // // If the username field has changed
    // if (this.updatedUser !== this.currentName && this.updatedUser !== '') {
    //   this.currentName = this.updatedUser;
    // }

    // If the password field has changed
    if (this.updatedPassword !== '') {
      this.http.put(`${this.apiUrl}/password`, {"password": this.updatedPassword},{ withCredentials: true, observe: 'response' }).subscribe((response: any) =>{
        this.currentPassword = this.updatedPassword;
        this.getPasswordMask();
        console.log("update password success: ", response.body.result);
      });
      
    }

    // Update the profile picture if a new one was selected
    if (this.newProfilePicture) {
      this.uploadProfilePicture();
    }

    alert('Profile Updated Success.');
  }

  // Method to display the password as asterisks
  getPasswordMask(): string {
    return '*'.repeat(this.currentPassword.length); // Display asterisks based on password length
  }

  // Clear the profile picture preview and reset file input
  clearProfilePicturePreview() {
    this.newProfilePicture = null;
    this.previewProfilePictureUrl = null;
  }

  // Simple email validation (you can expand this)
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Simple phone validation (US format: xxx-xxx-xxxx)
  validatePhone(phone: string): boolean {
    const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    return phonePattern.test(phone);
  }

  // Zipcode validation (US format: 12345 or 12345-6789)
  validateZipcode(zipcode: string): boolean {
    const zipcodePattern = /^[0-9]{5}(?:-[0-9]{4})?$/;
    return zipcodePattern.test(zipcode);
  }

  // Navigate back to the main view
  goToMain() {
    this.router.navigate(['/main']); // Navigate to the main view
  }
}
