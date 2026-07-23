import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { KnowledgeService, Knowledge } from '../../services/knowledge';

@Component({
  selector: 'app-knowledge-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './knowledge-detail.html',
  styleUrl: './knowledge-detail.css',
})
export class KnowledgeDetail implements OnInit {
  knowledge = signal<Knowledge | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private knowledgeService: KnowledgeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Identifiant invalide.');
      this.loading.set(false);
      return;
    }

    this.knowledgeService.getKnowledgeById(id).subscribe({
      next: (data: Knowledge) => {
        this.knowledge.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Impossible de charger cette connaissance.');
        this.loading.set(false);
      },
    });
  }
}
