import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParentService } from '../../../core/services/parent.service';

@Component({
  selector: 'app-parent-children',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './children.html',
  styleUrl: './children.css'
})
export class ParentChildren {
  private parentService = inject(ParentService);
  childrenSummary$ = this.parentService.getChildren();
}
