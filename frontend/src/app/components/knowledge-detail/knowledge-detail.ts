import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  knowledge: Knowledge | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private knowledgeService: KnowledgeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Identifiant invalide.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.knowledgeService.getKnowledgeById(id).subscribe({
      next: (data: Knowledge) => {
        this.knowledge = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger cette connaissance.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
