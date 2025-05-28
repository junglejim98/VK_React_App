export enum UserRole {
    ADMIN = 1,
    MODERATOR = 2,
    USER = 3
};

export interface Address{
    id: number;
    user_id: number;
    country: string;
    city: string;
    street: string;
    building: string;
    appartment?: string;
    postal_code: string;
    is_deleted: boolean;
};

export interface User {
    id: number;
    telegram_uid: number;
    first_name: string;
    last_name: string;
    tg_username: string;
    photo_url?: string;
    role_id: UserRole;
    created_at: string;
    extraFields?: Record<string,string>;
};