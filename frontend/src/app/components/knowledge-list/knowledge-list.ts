import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KnowledgeService, Knowledge } from '../../services/knowledge';

@Component({
  selector: 'app-knowledge-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './knowledge-list.html',
  styleUrl: './knowledge-list.css',
})
export class KnowledgeList implements OnInit {
  knowledgeList: Knowledge[] = [];
  loading = true;
  error = '';

  constructor(
    private knowledgeService: KnowledgeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadKnowledge();
  }

  loadKnowledge(): void {
    this.loading = true;
    this.knowledgeService.getAllKnowledge().subscribe({
      next: (data) => {
        console.log('Réponse reçue :', data);
        this.knowledgeList = data;
        this.loading = false;
        this.cdr.detectChanges(); // ← force la mise à jour de la vue
      },
      error: (err) => {
        console.error('Erreur reçue :', err);
        this.error = 'Impossible de charger les données.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteKnowledge(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Supprimer cette entrée ?')) return;

    this.knowledgeService.deleteKnowledge(id).subscribe({
      next: () => {
        this.knowledgeList = this.knowledgeList.filter((k) => k._id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }
}
