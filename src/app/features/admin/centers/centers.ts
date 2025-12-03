import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-centers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centers.html',
  styleUrl: './centers.css',
})
export class Centers implements OnInit {
  constructor(private api: ApiService) {}

  centers: any[] = [];
  loading = false;
  currentId: number | null = null;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter = { name: '', city: '', phone: '', paid: false };

  ngOnInit(): void {
    this.loadCenters();
  }

  private loadCenters() {
    this.loading = true;
    this.api.get<any>('/centers').subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.centers = items.map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.subdomain || '',
          phone: c.owner?.phone || '',
          paid: !!c.is_active,
          raw: c,
        }));
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  openForm(center?: typeof this.formCenter) {
    this.isFormOpen = true;
    if (center) {
      this.isEditMode = true;
      this.formCenter = { ...center };
      this.currentIndex = this.centers.findIndex(c => c.name === center.name && c.phone === center.phone);
      this.currentId = this.centers[this.currentIndex]?.id ?? null;
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.currentId = null;
      this.formCenter = { name: '', city: '', phone: '', paid: false };
    }
  }

  save() {
    const payload = {
      name: this.formCenter.name,
      subdomain: this.formCenter.city,
      is_active: this.formCenter.paid,
    };

    if (this.isEditMode && this.currentId !== null) {
      this.api.put<any>(`/centers/${this.currentId}`, payload).subscribe(() => {
        this.loadCenters();
        this.closeForm();
      });
    } else {
      this.api.post<any>('/centers', payload).subscribe(() => {
        this.loadCenters();
        this.closeForm();
      });
    }
  }

  delete(center: typeof this.formCenter) {
    const found = this.centers.find(c => c.name === center.name && c.phone === center.phone);
    if (!found?.id) {
      this.centers = this.centers.filter(c => !(c.name === center.name && c.phone === center.phone));
      return;
    }

    this.api.delete(`/centers/${found.id}`).subscribe(() => {
      this.centers = this.centers.filter(c => c.id !== found.id);
    });
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
