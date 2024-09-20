import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 
import { ToastsContainerComponent } from './components/toasts-container/toasts-container.component'; 
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { ForgetPwdComponent } from './components/forget-pwd/forget-pwd.component';
import { ResetPwdComponent } from './components/reset-pwd/reset-pwd.component';
import { LibraryComponent } from './components/librarys/library.component'; 
import { NgxSimpleTextEditorModule } from 'ngx-simple-text-editor'; 
import { CleanTextPipe } from './clean-text.pipe'; 
import { SearchService } from './services/search.service'; 
import { LibSearchComponent } from './components/lib-search/lib-search.component'; 
import { EditProfileComponent } from './components/edit-profile/edit-profile.component'; // Ensure EditProfileComponent is declared here
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

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
    ToastsContainerComponent, 
    ForgetPwdComponent,
    ResetPwdComponent,
    LibraryComponent, 
    CleanTextPipe, 
    LibSearchComponent,
    EditProfileComponent // Ensure EditProfileComponent is declared here
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    HttpClientModule,
    EnvironmentsModule,
    RouterModule.forRoot([]), 
    NgbModule, 
    BrowserAnimationsModule, 
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }), 
    NgxSimpleTextEditorModule,
    NgbPopoverModule
  ],
  providers: [
    AuthService,
    ChatService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    provideHttpClient(withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    SearchService 
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA] 
})
export class AppModule { }