import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeDetail } from './knowledge-detail';

describe('KnowledgeDetail', () => {
  let component: KnowledgeDetail;
  let fixture: ComponentFixture<KnowledgeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
