export interface Assignment {
    id: number;
    title: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded';
    grade?: number;
}
