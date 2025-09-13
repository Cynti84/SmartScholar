import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostScholarships } from './post-scholarships';

describe('PostScholarships', () => {
  let component: PostScholarships;
  let fixture: ComponentFixture<PostScholarships>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostScholarships]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostScholarships);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
