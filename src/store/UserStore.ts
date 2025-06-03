import { makeAutoObservable, runInAction } from "mobx";
import { User, Address, UserRole } from '../types';
import { 
    fetchUsers as apiFetchUsers, 
    addUser as apiAddUser, 
    fetchAllAddresses as apiFetchAllAddresses, 
    addAddress as apiAddAddress 
} from "../servises/api";

export class UserStore {
    users: User[] = [];
    addresses: Address[] = [];

    loadingUsers = false;
    loadingAddresses = false;

    limit = 10;
    hasMoreUsers = true;

    constructor() {
        makeAutoObservable(this);
    };

    get dynamicFieldKeys(): string[] {
        const keys = this.users.flatMap(u => u.extraFields ? Object.keys(u.extraFields) : [] );
        return Array.from(new Set(keys)); 
    }

    get addressesForUser(): Record<number, Address[]> {
        const map: Record<number, Address[]> = {}
        return this.addresses
            .filter(a => !a.is_deleted)
            .reduce((map, addr) => {
                map[addr.user_id] = map[addr.user_id] || []
                map[addr.user_id].push(addr)
                return map
            }, {} as Record<number, Address[]>)
    };


resetUsers() {
    this.users = [];
    this.hasMoreUsers = true;
    this.fetchUsers();
}

async fetchUsers(): Promise<User[]> {
    if(this.loadingUsers || !this.hasMoreUsers)
        return []
    this.loadingUsers = true;
    try {
        const offset = this.users.length
        const response = await apiFetchUsers(offset, this.limit);

        const totalHeader = response.headers['x-total-count'];
        const total = totalHeader !== undefined ? Number(totalHeader) : undefined;
        const data = response.data;

        runInAction(() => {
            this.users.push(...data);
            if(total !== undefined && !isNaN(total))
                this.hasMoreUsers = this.users.length < total;
            else
                this.hasMoreUsers = data.length === this.limit
        })
        return data;
    } catch (error) {
        console.error('Не могу загрузить пользователей', error);
        throw error;
    } finally {
        runInAction(() => {
            this.loadingUsers = false;
        })
    }
};

async addUser(user: Omit<User, 'id'>): Promise<User> {
    this.loadingUsers = true;

    const userToAdd: Omit<User, 'id'> = {
        ...user,
        role_id: user.role_id ?? UserRole.USER,
        created_at: user.created_at || new Date().toISOString(),
    }
    try {
        const response = await apiAddUser(userToAdd);
        runInAction(() => {
            this.users.unshift(response.data);
        });
        return response.data;
    } catch (error) {
        console.error('Не могу загрузить пользователя', error);
        throw error;
    } finally {
        runInAction(() => {
            this.loadingUsers = false;
        });
    }
};

async fetchAllAddresses(): Promise<Address[]> {
    this.loadingAddresses = true;
    try {
        const response = await apiFetchAllAddresses();
        runInAction(() => {
            this. addresses = response.data;
        });
        return response.data;
    } catch (error) {
        console.error('Не могу загрузить адрес пользователя', error);
        throw error
    } finally {
        runInAction(() => {
            this.loadingAddresses = false;
        });
    }
};



async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    this.loadingAddresses = true;

    const addressesToAdd: Omit<Address, 'id'> = {
        ...address,
        is_deleted: address.is_deleted ?? false,
    }

    try {
        const response = await apiAddAddress(addressesToAdd);
        runInAction(() => {
            this.addresses.unshift(response.data);
        });
        return response.data;
    } catch (error) {
        console.error('Не могу згрузить адреса пользователя', error);
        throw error;
    } finally {
        runInAction(() => {
            this.loadingAddresses = false;
        });
    }

};
};

export const userStore = new UserStore();