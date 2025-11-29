export interface User {
    id: number;
    username: string;
    email: string;
    roles: Array<
      'admin' | 'center_admin' | 'teacher' | 'assistant' | 'student' | 'parent'
    >;
    status: 'active' | 'pending' | 'inactive';
    is_data_complete?: boolean;
    firstName?: string;
    lastName?: string;
    token?: string;
}
