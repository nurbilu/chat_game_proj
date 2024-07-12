import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChrcterCreationComponent } from './chrcter-creation.component';

describe('ChrcterCreationComponent', () => {
  let component: ChrcterCreationComponent;
  let fixture: ComponentFixture<ChrcterCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChrcterCreationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChrcterCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
