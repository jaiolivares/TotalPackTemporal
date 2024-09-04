import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoFilasComponent } from './info-filas.component';

describe('InfoFilasComponent', () => {
  let component: InfoFilasComponent;
  let fixture: ComponentFixture<InfoFilasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoFilasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoFilasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
