import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutComponent } from './components/about/about.component';
import { AuthGuard } from './auth.guard';  // Import AuthGuard
import { HomepageComponent } from './components/homepage/homepage.component'; // Import HomepageComponent

const routes: Routes = [
    { path: 'homepage', component: HomepageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'chat', component: ChatComponent },  // Protect chat route
    { path: 'profile', component: ProfileComponent },  // Protect profile route
    { path: 'about', component: AboutComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'homepage', component: HomepageComponent },  // Add route for homepage
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }