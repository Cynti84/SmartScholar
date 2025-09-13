import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSignup } from './provider-signup';

describe('ProviderSignup', () => {
  let component: ProviderSignup;
  let fixture: ComponentFixture<ProviderSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
