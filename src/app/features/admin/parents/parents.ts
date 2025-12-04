import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-parents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parents.html',
  styleUrl: './parents.css',
})
export class Parents implements OnInit {
  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  parents: any[] = [];
  loading = false;
  searchTerm = '';
  infoOpen = false;
  selectedParent: any = null;

  ngOnInit(): void {
    this.loadParents();
  }

  private loadParents() {
    this.loading = true;
    const params = new HttpParams().set('role', 'parent');
    this.api.get<any>('/users', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.parents = items.map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone || '',
          status: p.status || 'active',
          raw: p,
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredParents() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.parents;
    return this.parents.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q)
    );
  }

  openInfo(parent: any) {
    this.selectedParent = parent;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedParent = null;
  }
}
