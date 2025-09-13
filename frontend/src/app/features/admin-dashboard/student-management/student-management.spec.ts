import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentManagement } from './student-management';

describe('StudentManagement', () => {
  let component: StudentManagement;
  let fixture: ComponentFixture<StudentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
