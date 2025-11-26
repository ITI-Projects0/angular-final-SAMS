import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Status = 'Acceptable' | 'Pending' | 'Unacceptable';

interface Student {
  id: number;
  name: string;
  role: string;
  age: number;
  status: Status;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  searchText = '';
  statusFilter: 'All' | Status = 'All';

  pageSize = 5;
  currentPage = 1;

  students: Student[] = [
    {
      id: 1,
      name: 'Sufyan',
      role: 'Developer',
      age: 22,
      status: 'Acceptable',
      date: '6/4/2000',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 2,
      name: 'Stevens',
      role: 'Programmer',
      age: 27,
      status: 'Pending',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 3,
      name: 'Nora',
      role: 'Designer',
      age: 17,
      status: 'Unacceptable',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 4,
      name: 'Ali',
      role: 'Programmer',
      age: 23,
      status: 'Acceptable',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 5,
      name: 'Khalid',
      role: 'Designer',
      age: 20,
      status: 'Pending',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 6,
      name: 'Nasser',
      role: 'Pen Tester',
      age: 29,
      status: 'Acceptable',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 7,
      name: 'Mohammed',
      role: 'Web Designer',
      age: 38,
      status: 'Acceptable',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 8,
      name: 'Saad',
      role: 'Data',
      age: 19,
      status: 'Acceptable',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
    {
      id: 9,
      name: 'Sami',
      role: 'Developer',
      age: 21,
      status: 'Acceptable',
      date: '6/10/2020',
      avatar:
        'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
    },
  ];

  /** فلترة بالـ search + status */
  get filteredStudents(): Student[] {
    const q = this.searchText.toLowerCase().trim();

    return this.students.filter((s: Student) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q);

      const matchesStatus =
        this.statusFilter === 'All' || s.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  /** عدد الصفحات */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
  }

  /** البيانات المعروضة في الصفحة الحالية */
  get paginatedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredStudents.slice(start, end);
  }

  /** تغيير الفلتر */
  setStatusFilter(filter: 'All' | Status): void {
    this.statusFilter = filter;
    this.currentPage = 1;
  }

  /** تغيير الصفحة */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  /** استايل الـ status badge */
  getStatusClasses(status: Status): string {
    switch (status) {
      case 'Acceptable':
        return 'status-badge status-accept';
      case 'Pending':
        return 'status-badge status-pending';
      case 'Unacceptable':
        return 'status-badge status-reject';
      default:
        return 'status-badge';
    }
  }
}
