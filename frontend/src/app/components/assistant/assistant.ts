import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AssistantResponse {
  answer: string;
  sources: string[];
}

@Component({
  selector: 'app-assistant',
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css',
})
export class Assistant {
  question = '';
  response = signal("")
  sources: string[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ask(): void {
    if (!this.question.trim() || this.loading) return;

    this.loading = true;
    this.response.set("")
    this.sources = [];

    this.http
      .post<AssistantResponse>('http://localhost:3000/assistant', {
        question: this.question,
      })
      .subscribe({
        next: (res) => {
          console.log("FIN")
          this.response.set(res.answer);
          this.sources = res.sources ?? [];
          this.loading = false;
        },
        error: () => {
          this.response.set("Erreur : impossible de contacter l'assistant.");
          this.loading = false;
        },
      });
  }
}
