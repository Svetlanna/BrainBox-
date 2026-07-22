import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeForm } from './knowledge-form';

describe('KnowledgeForm', () => {
  let component: KnowledgeForm;
  let fixture: ComponentFixture<KnowledgeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeForm],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
