import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth.component';  // Import AuthComponent
import { RegisterationComponent } from './auth/registeration/registeration.component';  // Import AuthComponent
import { MainComponent } from './main/main.component';  // Import MainComponent
import { ProfileComponent } from './profile/profile.component';  // Import MainComponent
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}
