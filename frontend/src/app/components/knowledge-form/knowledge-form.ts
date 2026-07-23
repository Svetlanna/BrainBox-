import { Component, OnInit, signal } from '@angular/core';
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

  saving = signal(false);
  error = signal('');

  title = signal('');
  category = signal('');
  content = signal('');
  tagsInput = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private knowledgeService: KnowledgeService,
  ) {}

  ngOnInit(): void {
    this.knowledgeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.knowledgeId;

    if (this.isEditMode && this.knowledgeId) {
      this.knowledgeService.getKnowledgeById(this.knowledgeId).subscribe({
        next: (data) => {
          this.title.set(data.title);
          this.category.set(data.category);
          this.content.set(data.content);
          this.tagsInput.set((data.tags || []).join(', '));
        },
        error: (err) => {
          console.error(err);
          this.error.set('Impossible de charger cette entrée.');
        },
      });
    }
  }

  onSubmit(): void {
    this.saving.set(true);
    this.error.set('');

    const formData: Knowledge = {
      title: this.title(),
      category: this.category(),
      content: this.content(),
      tags: this.tagsInput()
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };

    const request =
      this.isEditMode && this.knowledgeId
        ? this.knowledgeService.updateKnowledge(this.knowledgeId, formData)
        : this.knowledgeService.createKnowledge(formData);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/knowledge']);
      },
      error: (err) => {
        console.error(err);
        this.error.set("Erreur lors de l'enregistrement.");
        this.saving.set(false);
      },
    });
  }
}
