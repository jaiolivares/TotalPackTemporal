import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentheaderComponent } from './contentheader.component';

describe('ContentheaderComponent', () => {
  let component: ContentheaderComponent;
  let fixture: ComponentFixture<ContentheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentheaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
