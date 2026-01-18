import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyScholarship } from './apply-scholarship';

describe('ApplyScholarship', () => {
  let component: ApplyScholarship;
  let fixture: ComponentFixture<ApplyScholarship>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyScholarship]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyScholarship);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
