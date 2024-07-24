import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutComponent } from './components/about/about.component';
import { AuthGuard } from './services/auth.guard';  // Import AuthGuard
import { HomepageComponent } from './components/homepage/homepage.component'; // Import HomepageComponent
import { ChangePasswordComponent } from './components/change-password/change-password.component'; // Import ChangePasswordComponent
import { ChrcterCreationComponent } from './components/chrcter-creation/chrcter-creation.component'; // Import ChrcterCreationComponent
import { SuperProfileComponent } from './components/super-profile/super-profile.component'; // Import SuperProfileComponent

const routes: Routes = [
    { path: 'homepage', component: HomepageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'about', component: AboutComponent },
    { path: '', redirectTo: '/homepage', pathMatch: 'full' },  // Redirect to homepage
    { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
    { path: 'character-creation', component: ChrcterCreationComponent, canActivate: [AuthGuard] },
    { path: 'super-profile', component: SuperProfileComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }