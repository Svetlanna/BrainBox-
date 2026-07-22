import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assistant',
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css',
})
export class Assistant {
  question = '';
  response = '';

  ask(): void {
    // TODO: brancher sur une vraie route backend une fois qu'elle existe
    this.response = 'Fonctionnalité en cours de construction.';
  }
}
