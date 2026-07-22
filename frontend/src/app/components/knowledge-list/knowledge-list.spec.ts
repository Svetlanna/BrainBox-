import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeList } from './knowledge-list';

describe('KnowledgeList', () => {
  let component: KnowledgeList;
  let fixture: ComponentFixture<KnowledgeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeList],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
