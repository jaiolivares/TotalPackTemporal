import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DwhPausaComponent } from './dwh-pausa.component';

describe('DwhPausaComponent', () => {
  let component: DwhPausaComponent;
  let fixture: ComponentFixture<DwhPausaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DwhPausaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DwhPausaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
