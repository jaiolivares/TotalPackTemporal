import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DwhAtencionProveedorComponent } from './dwh-atencion-proveedor.component';

describe('DwhAtencionProveedorComponent', () => {
  let component: DwhAtencionProveedorComponent;
  let fixture: ComponentFixture<DwhAtencionProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DwhAtencionProveedorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DwhAtencionProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
