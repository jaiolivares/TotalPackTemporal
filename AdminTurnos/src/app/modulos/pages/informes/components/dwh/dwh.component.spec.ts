import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DwhComponent } from './dwh.component';

describe('DwhComponent', () => {
  let component: DwhComponent;
  let fixture: ComponentFixture<DwhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DwhComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DwhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
