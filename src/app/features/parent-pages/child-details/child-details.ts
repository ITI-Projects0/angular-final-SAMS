import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ParentService } from '../../../core/services/parent.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-child-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './child-details.html',
  styleUrl: './child-details.css'
})
export class ParentChildDetails {
  private route = inject(ActivatedRoute);
  private parentService = inject(ParentService);

  childId = this.route.snapshot.paramMap.get('id');
  childDetails$ = this.parentService.getChildDetails(Number(this.childId));
}
