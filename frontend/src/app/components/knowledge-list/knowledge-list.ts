import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KnowledgeService, Knowledge } from '../../services/knowledge';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-knowledge-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './knowledge-list.html',
  styleUrl: './knowledge-list.css',
})
export class KnowledgeList implements OnInit {
  knowledgeList = signal<Knowledge[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(
    private knowledgeService: KnowledgeService,
    protected authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadKnowledge();
  }

  loadKnowledge(): void {
    this.loading.set(true);
    this.knowledgeService.getAllKnowledge().subscribe({
      next: (data) => {
        console.log('Réponse reçue :', data);
        this.knowledgeList.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur reçue :', err);
        this.error.set('Impossible de charger les données.');
        this.loading.set(false);
      },
    });
  }

  deleteKnowledge(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Supprimer cette entrée ?')) return;

    this.knowledgeService.deleteKnowledge(id).subscribe({
      next: () => {
        this.knowledgeList.update((list) => list.filter((k) => k._id !== id));
      },
      error: (err) => console.error(err),
    });
  }
}
