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
  page = 1;
  perPage = 15;
  total = 0;
  lastPage = 1;
  infoOpen = false;
  selectedParent: any = null;

  ngOnInit(): void {
    this.loadParents();
  }

  private loadParents(page = this.page) {
    this.loading = true;
    const params = new HttpParams()
      .set('role', 'parent')
      .set('per_page', this.perPage)
      .set('page', page)
      .set('search', this.searchTerm.trim());
    this.api.get<any>('/users', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.parents = items.map((p: any) => {
          const children = Array.isArray(p.children?.data)
            ? p.children.data
            : Array.isArray(p.children)
              ? p.children
              : [];

          return {
            id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone || '',
            status: p.status || 'active',
            childCount: p.children_count ?? p.childrenCount ?? children.length,
            children: children.map((c: any) => {
              const courses = Array.isArray(c.groups?.data)
                ? c.groups.data
                : Array.isArray(c.groups)
                  ? c.groups
                  : [];

              return {
                id: c.id,
                name: c.name,
                email: c.email,
                courses: courses.map((g: any) => ({
                  id: g.id,
                  name: g.name,
                  center: g.center?.name || '',
                  studentsCount: g.students_count ?? g.studentsCount ?? 0,
                })),
              };
            }),
            raw: p,
          };
        });
        const pagination = res?.meta?.pagination ?? payload?.meta ?? {};
        this.page = pagination.current_page ?? page;
        this.perPage = pagination.per_page ?? this.perPage;
        this.total = pagination.total ?? this.parents.length;
        this.lastPage = pagination.last_page ?? this.lastPage ?? 1;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredParents() {
    return this.parents;
  }

  openInfo(parent: any) {
    this.selectedParent = parent;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedParent = null;
  }

  changePage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadParents(page);
  }

  changePerPage(value: number) {
    this.perPage = value;
    this.page = 1;
    this.loadParents(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadParents(1);
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.parents.length - 1, this.total);
  }
}
