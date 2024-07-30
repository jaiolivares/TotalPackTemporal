import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformativeTicketComponent } from './informative-ticket.component';

describe('InformativeTicketComponent', () => {
  let component: InformativeTicketComponent;
  let fixture: ComponentFixture<InformativeTicketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InformativeTicketComponent]
    });
    fixture = TestBed.createComponent(InformativeTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
