export interface AttendanceRecord {
    id?: number | string;
    date: string;
    subject: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'unknown';
}

export interface ChildAttendance {
    childId: number;
    childName: string;
    subject: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'unknown';
}
