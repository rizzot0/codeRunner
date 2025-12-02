import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Selector } from './selector';

describe('Selector', () => {
  let component: Selector;
  let fixture: ComponentFixture<Selector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Selector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Selector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
