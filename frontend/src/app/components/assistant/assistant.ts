import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AssistantResponse {
  answer: string;
  sources: string[];
  canGenerate?: boolean;
}

interface GenerateResponse {
  answer: string;
  suggestedTitle: string;
}

interface SavedKnowledge {
  _id: string;
  title: string;
}

@Component({
  selector: 'app-assistant',
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css',
})
export class Assistant {
  question = signal('');
  lastQuestion = signal('');
  response = signal('');
  sources = signal<string[]>([]);
  loading = signal(false);
  canGenerate = signal(false);
  generating = signal(false);

  editingTitle = signal('');
  editingContent = signal('');
  isEditing = signal(false);
  saving = signal(false);
  savedTitle = signal('');

  constructor(private http: HttpClient) {}

  ask(): void {
    const q = this.question().trim();
    if (!q || this.loading()) return;

    this.loading.set(true);
    this.response.set('');
    this.sources.set([]);
    this.canGenerate.set(false);
    this.isEditing.set(false);
    this.savedTitle.set('');
    this.lastQuestion.set(q);

    this.http
      .post<AssistantResponse>('http://localhost:3000/assistant', { question: q })
      .subscribe({
        next: (res) => {
          this.response.set(res.answer);
          this.sources.set(res.sources ?? []);
          this.canGenerate.set(res.canGenerate ?? false);
          this.loading.set(false);
        },
        error: () => {
          this.response.set("Erreur : impossible de contacter l'assistant.");
          this.loading.set(false);
        },
      });
  }

  generateAnyway(): void {
    if (this.generating()) return;

    this.generating.set(true);

    this.http
      .post<GenerateResponse>('http://localhost:3000/assistant/generate', {
        question: this.lastQuestion(),
      })
      .subscribe({
        next: (res) => {
          this.editingTitle.set(res.suggestedTitle);
          this.editingContent.set(res.answer);
          this.isEditing.set(true);
          this.canGenerate.set(false);
          this.generating.set(false);
        },
        error: () => {
          this.response.set('Erreur : impossible de générer une réponse.');
          this.generating.set(false);
        },
      });
  }

  saveGenerated(): void {
    if (this.saving()) return;

    this.saving.set(true);

    this.http
      .post<SavedKnowledge>('http://localhost:3000/assistant/save-generated', {
        title: this.editingTitle(),
        content: this.editingContent(),
      })
      .subscribe({
        next: (res) => {
          this.response.set(this.editingContent());
          this.savedTitle.set(res.title);
          this.isEditing.set(false);
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }
}
