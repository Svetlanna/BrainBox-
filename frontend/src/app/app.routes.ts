import { Routes } from '@angular/router';
import { KnowledgeList } from './components/knowledge-list/knowledge-list';
import { KnowledgeDetail } from './components/knowledge-detail/knowledge-detail';
import { KnowledgeForm } from './components/knowledge-form/knowledge-form';
import { Assistant } from './components/assistant/assistant';

export const routes: Routes = [
  { path: '', redirectTo: 'knowledge', pathMatch: 'full' },
  { path: 'knowledge', component: KnowledgeList },
  { path: 'knowledge/new', component: KnowledgeForm },
  { path: 'knowledge/:id/edit', component: KnowledgeForm },
  { path: 'knowledge/:id', component: KnowledgeDetail },
  { path: 'assistant', component: Assistant },
];
