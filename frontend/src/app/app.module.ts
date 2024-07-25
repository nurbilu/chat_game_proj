import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ChatComponent } from './components/chat/chat.component';
import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutComponent } from './components/about/about.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChrcterCreationComponent } from './components/chrcter-creation/chrcter-creation.component';
import { HttpClientModule } from '@angular/common/http';
import { EnvironmentsModule } from './environments.module';
import { SuperProfileComponent } from './components/super-profile/super-profile.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Import NgbModule
import { ToastsContainerComponent } from './components/toasts-container/toasts-container.component'; // Added this line
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // Required for animations

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChatComponent,
    ProfileComponent,
    AboutComponent,
    HomepageComponent,
    ChangePasswordComponent,
    ChrcterCreationComponent,
    SuperProfileComponent,
    ToastsContainerComponent // Added this line
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    EnvironmentsModule,
    RouterModule,
    NgbModule, // Add NgbModule to imports
    BrowserAnimationsModule, // Add BrowserAnimationsModule
    ToastrModule.forRoot() // Initialize ToastrModule
  ],
  providers: [
    AuthService,
    ChatService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }