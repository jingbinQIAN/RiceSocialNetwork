import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';  // Landing view
import { MainComponent } from './main/main.component';  // Main view

const routes: Routes = [
  { path: '', component: AuthComponent },  // Default route (landing view)
  { path: 'main', component: MainComponent }  // Main view after login or registration
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Set up router with routes
  exports: [RouterModule]  // Export RouterModule for use in the app
})
export class AppRoutingModule { }
