import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderManagement } from './provider-management';

describe('ProviderManagement', () => {
  let component: ProviderManagement;
  let fixture: ComponentFixture<ProviderManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
