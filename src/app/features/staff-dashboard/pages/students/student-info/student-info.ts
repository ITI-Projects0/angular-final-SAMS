import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
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

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

interface AttendanceSession {
  id: number;
  name: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

interface StudentGroup {
  name: string; // class / group name
  role: string; // Member / Leader
}

interface Grade {
  subject: string;
  score: number;
  letter: string;
}

interface ParentContact {
  name: string;
  relation: 'Father' | 'Mother' | 'Guardian';
  phone: string;
  email: string;
}

@Component({
  selector: 'app-student-info',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './student-info.html',
  styleUrl: './student-info.css',
})
export class StudentInfo {
  student: Student | undefined;

  attendanceHistory: AttendanceSession[] = [];
  groups: StudentGroup[] = [];
  grades: Grade[] = [];
  parents: ParentContact[] = [];

  // إدارة الكلاسات
  availableClasses: string[] = [
    'Frontend Class',
    'Backend Class',
    'UI/UX Class',
    'Security Class',
    'Database Class',
  ];
  selectedClass = '';

  private allStudents: Student[] = [
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
  ];

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.student = this.allStudents.find((s) => s.id === id);

    // Dummy per-student data (ممكن تربطها بـ API بعدين)
    const attendanceByStudent: Record<number, AttendanceSession[]> = {
      1: [
        { id: 1, name: 'Session 1', date: '2025-11-01', status: 'Present', note: 'On time' },
        { id: 2, name: 'Session 2', date: '2025-11-05', status: 'Late', note: '10 min late' },
        { id: 3, name: 'Session 3', date: '2025-11-10', status: 'Absent', note: 'Sick' },
        { id: 4, name: 'Session 4', date: '2025-11-15', status: 'Present' },
      ],
      2: [
        { id: 1, name: 'Session 1', date: '2025-11-01', status: 'Absent', note: 'No excuse' },
        { id: 2, name: 'Session 2', date: '2025-11-05', status: 'Present' },
      ],
      3: [
        { id: 1, name: 'Session 1', date: '2025-11-01', status: 'Late', note: 'Bus delay' },
        { id: 2, name: 'Session 2', date: '2025-11-05', status: 'Late' },
        { id: 3, name: 'Session 3', date: '2025-11-10', status: 'Present' },
      ],
    };

    const groupsByStudent: Record<number, StudentGroup[]> = {
      1: [
        { name: 'Frontend Class', role: 'Member' },
        { name: 'React Lab', role: 'Leader' },
      ],
      2: [
        { name: 'Backend Class', role: 'Member' },
        { name: 'Security Class', role: 'Member' },
      ],
      3: [
        { name: 'UI/UX Class', role: 'Member' },
      ],
    };

    const gradesByStudent: Record<number, Grade[]> = {
      1: [
        { subject: 'Algorithms', score: 92, letter: 'A' },
        { subject: 'Web Development', score: 88, letter: 'B+' },
        { subject: 'Databases', score: 81, letter: 'B' },
      ],
      2: [
        { subject: 'Networks', score: 75, letter: 'C+' },
        { subject: 'Security Basics', score: 83, letter: 'B' },
      ],
      3: [
        { subject: 'Design Principles', score: 90, letter: 'A' },
        { subject: 'Prototyping', score: 85, letter: 'B+' },
      ],
    };

    const parentsByStudent: Record<number, ParentContact[]> = {
      1: [
        {
          name: 'Ali Hassan',
          relation: 'Father',
          phone: '+20 100 000 0001',
          email: 'ali.hassan@example.com',
        },
        {
          name: 'Mona Hassan',
          relation: 'Mother',
          phone: '+20 100 000 0002',
          email: 'mona.hassan@example.com',
        },
      ],
      2: [
        {
          name: 'John Stevens Sr.',
          relation: 'Father',
          phone: '+20 100 000 0003',
          email: 'john.stevens@example.com',
        },
      ],
      3: [
        {
          name: 'Omar Youssef',
          relation: 'Guardian',
          phone: '+20 100 000 0004',
          email: 'omar.youssef@example.com',
        },
      ],
    };

    if (this.student) {
      this.attendanceHistory = attendanceByStudent[this.student.id] || [];
      this.groups = groupsByStudent[this.student.id] || [];
      this.grades = gradesByStudent[this.student.id] || [];
      this.parents = parentsByStudent[this.student.id] || [];
    }
  }

  /** Badges للـ Status الأساسي بتاع الطالب */
  getStatusBadgeClass(status: Status): string {
    switch (status) {
      case 'Acceptable':
        return 'badge badge-accept';
      case 'Pending':
        return 'badge badge-pending';
      case 'Unacceptable':
        return 'badge badge-reject';
      default:
        return 'badge';
    }
  }

  /** Badges للـ Attendance Status */
  getAttendanceBadgeClass(status: AttendanceStatus): string {
    switch (status) {
      case 'Present':
        return 'chip chip-present';
      case 'Absent':
        return 'chip chip-absent';
      case 'Late':
        return 'chip chip-late';
      default:
        return 'chip';
    }
  }

  /** إحصائيات attendance */
  get totalSessions(): number {
    return this.attendanceHistory.length;
  }

  get presentCount(): number {
    return this.attendanceHistory.filter((s) => s.status === 'Present').length;
  }

  get absentCount(): number {
    return this.attendanceHistory.filter((s) => s.status === 'Absent').length;
  }

  get lateCount(): number {
    return this.attendanceHistory.filter((s) => s.status === 'Late').length;
  }

  get attendancePercent(): number {
    if (this.totalSessions === 0) return 0;
    return Math.round((this.presentCount / this.totalSessions) * 100);
  }

  /** إدارة الكلاسات */
  isInClass(className: string): boolean {
    return this.groups.some((g) => g.name === className);
  }

  addToClass(): void {
    if (!this.selectedClass || this.isInClass(this.selectedClass)) return;

    this.groups.push({
      name: this.selectedClass,
      role: 'Member',
    });

    // في الحقيقة هنا هيكون في API call
    this.selectedClass = '';
  }

  removeFromClass(groupName: string): void {
    this.groups = this.groups.filter((g) => g.name !== groupName);
    // هنا برضه API في الحقيقة
  }
}
