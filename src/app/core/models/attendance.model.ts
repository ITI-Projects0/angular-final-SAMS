export interface AttendanceRecord {
    date: string;
    subject: string;
    status: 'present' | 'absent' | 'late';
}

export interface ChildAttendance {
    childId: number;
    childName: string;
    subject: string;
    date: string;
    status: 'present' | 'absent' | 'late';
}
