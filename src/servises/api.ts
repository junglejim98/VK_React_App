import axios from 'axios';
import { User, Address, UserRole } from '../types/index';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/'
});

export const fetchUsers = (start: number, limit: number) => 
    api.get<User[]>(`/users?_sort=created_at&_order=desc&_start=${start}&_limit=${limit}`);


export const addUser = (user: Omit<User, 'id'>) => {
    const payload: Omit<User, 'id'> = {
        ...user,
        role_id: user.role_id ?? UserRole.USER,
        created_at: user.created_at || new Date().toISOString(),
    };
    return api.post<User>('/users', payload);
};

export const fetchAllAddresses = () =>
  api.get<Address[]>('/addresses?is_deleted=false')

export const addAddress = (address: Omit<Address, 'id'>) => {
    const payload: Omit<Address, 'id'> = {
        ...address,
        is_deleted: address.is_deleted ?? false
    };
    return api.post<Address>('/addresses', payload);
};

export default api;