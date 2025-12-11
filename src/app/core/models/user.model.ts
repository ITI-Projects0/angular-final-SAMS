export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    roles: string[];
    status: 'active' | 'pending' | 'inactive';
    approval_status?: 'pending' | 'approved' | 'rejected';
    is_data_complete?: boolean;
    firstName?: string;
    lastName?: string;
    token?: string;
    center_id?: number;
    avatar: string;
}
