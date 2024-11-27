import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsgResetPwdComponent } from './msg-reset-pwd.component';

describe('MsgResetPwdComponent', () => {
  let component: MsgResetPwdComponent;
  let fixture: ComponentFixture<MsgResetPwdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MsgResetPwdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsgResetPwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
