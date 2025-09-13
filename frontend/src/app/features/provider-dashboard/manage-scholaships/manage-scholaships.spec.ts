import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageScholaships } from './manage-scholaships';

describe('ManageScholaships', () => {
  let component: ManageScholaships;
  let fixture: ComponentFixture<ManageScholaships>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageScholaships]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageScholaships);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
