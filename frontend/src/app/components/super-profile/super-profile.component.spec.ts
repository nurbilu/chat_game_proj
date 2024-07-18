import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperProfileComponent } from './super-profile.component';

describe('SuperProfileComponent', () => {
  let component: SuperProfileComponent;
  let fixture: ComponentFixture<SuperProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
