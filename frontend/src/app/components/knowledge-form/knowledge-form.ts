import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KnowledgeService, Knowledge } from '../../services/knowledge';

@Component({
  selector: 'app-knowledge-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './knowledge-form.html',
  styleUrl: './knowledge-form.css',
})
export class KnowledgeForm implements OnInit {
  isEditMode = false;
  knowledgeId: string | null = null;
  saving = false;
  error = '';

  formData: Knowledge = {
    title: '',
    content: '',
    category: '',
    tags: [],
  };

  tagsInput = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private knowledgeService: KnowledgeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.knowledgeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.knowledgeId;

    if (this.isEditMode && this.knowledgeId) {
      this.knowledgeService.getKnowledgeById(this.knowledgeId).subscribe({
        next: (data) => {
          this.formData = data;
          this.tagsInput = (data.tags || []).join(', ');
          this.cdr.detectChanges(); // ← force l'affichage des valeurs dans les inputs
        },
        error: (err) => {
          console.error(err);
          this.error = 'Impossible de charger cette entrée.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  onSubmit(): void {
    this.saving = true;
    this.error = '';

    this.formData.tags = this.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const request =
      this.isEditMode && this.knowledgeId
        ? this.knowledgeService.updateKnowledge(this.knowledgeId, this.formData)
        : this.knowledgeService.createKnowledge(this.formData);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/knowledge']);
      },
      error: (err) => {
        console.error(err);
        this.error = "Erreur lors de l'enregistrement.";
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
