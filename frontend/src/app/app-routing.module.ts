import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutComponent } from './components/about/about.component';
import { AuthGuard } from './services/auth.guard';
import { HomepageComponent } from './components/homepage/homepage.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChrcterCreationComponent } from './components/chrcter-creation/chrcter-creation.component';
import { SuperProfileComponent } from './components/super-profile/super-profile.component';
import { ForgetPwdComponent } from './components/forget-pwd/forget-pwd.component';
import { ResetPwdComponent } from './components/reset-pwd/reset-pwd.component';
import { LibraryComponent } from './components/librarys/library.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

const routes: Routes = [
    { path: 'homepage', component: HomepageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
    { path: 'library', component: LibraryComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/homepage', pathMatch: 'full' },
    { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
    { path: 'character-creation', component: ChrcterCreationComponent, canActivate: [AuthGuard] },
    { path: 'super-profile', component: SuperProfileComponent, canActivate: [AuthGuard] },
    { path: 'forget-password', component: ForgetPwdComponent, canActivate: [AuthGuard] },
    { path: 'reset-password', component: ResetPwdComponent, canActivate: [AuthGuard] },
    { path: 'access-denied', component: AccessDeniedComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
