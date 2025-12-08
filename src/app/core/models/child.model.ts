export interface Child {
    id: number;
    name: string;
    email?: string;
    center?: { id: number; name: string };
    className?: string;
    avatar?: string;
}
