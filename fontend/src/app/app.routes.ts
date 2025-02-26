import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthComponent } from './auth/auth.component';
import { MainComponent } from './main/main.component';
import { RegisterationComponent } from './auth/registeration/registeration.component';
import { ProfileComponent } from './profile/profile.component';
//import { NotFoundComponent } from './not-found/not-found.component'; // Optional: If you have a custom 404 page


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: AuthComponent },
    { path: 'register', component: RegisterationComponent }, // Route for registration
    { path: 'main', component: MainComponent },
    { path: 'profile', component: ProfileComponent},
    // Catch-all route to redirect to main or a 404 page
    { path: '**', redirectTo: '/main' },
    // // Catch-all routes with partial matching
    // { path: 'main**', component: MainComponent }, // Redirects all routes containing "main" to MainComponent
    // { path: 'login**', component: AuthComponent }, // Redirects all routes containing "login" to AuthComponent
    // { path: 'profile**', component: ProfileComponent }, // Redirects all routes containing "main" to MainComponent
    // // { path: '**', component: NotFoundComponent } // Use this if you want to display a custom 404 page
    ];
    
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
    