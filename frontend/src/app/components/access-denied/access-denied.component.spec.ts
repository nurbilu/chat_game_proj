import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AccessDeniedComponent } from './access-denied.component';
import { AuthService } from '../../services/auth.service';

describe('AccessDeniedComponent', () => {
  let component: AccessDeniedComponent;
  let fixture: ComponentFixture<AccessDeniedComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AccessDeniedComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout method when logout button is clicked', () => {
    const logoutButton = fixture.nativeElement.querySelector('button');
    logoutButton.click();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
