import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdResetUnrealComponent } from './pwd-reset-unreal.component';

describe('PwdResetUnrealComponent', () => {
  let component: PwdResetUnrealComponent;
  let fixture: ComponentFixture<PwdResetUnrealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PwdResetUnrealComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwdResetUnrealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
