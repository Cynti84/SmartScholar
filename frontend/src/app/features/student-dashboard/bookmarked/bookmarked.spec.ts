import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bookmarked } from './bookmarked';

describe('Bookmarked', () => {
  let component: Bookmarked;
  let fixture: ComponentFixture<Bookmarked>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bookmarked]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bookmarked);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
