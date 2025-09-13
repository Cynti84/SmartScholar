import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Applied } from './applied';

describe('Applied', () => {
  let component: Applied;
  let fixture: ComponentFixture<Applied>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Applied]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Applied);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
