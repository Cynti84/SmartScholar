import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSignup } from './student-signup';

describe('StudentSignup', () => {
  let component: StudentSignup;
  let fixture: ComponentFixture<StudentSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
