import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipManagement } from './scholarship-management';

describe('ScholarshipManagement', () => {
  let component: ScholarshipManagement;
  let fixture: ComponentFixture<ScholarshipManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScholarshipManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(ScholarshipManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
