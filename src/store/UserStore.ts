import { makeAutoObservable, runInAction } from "mobx";
import { User, Address, UserRole } from '../types';
import { 
    fetchUsers as apiFetchUsers, 
    addUser as apiAddUser, 
    fetchAddresses as apiFetchAddresses, 
    addAddress as apiAddAddress 
} from "../servises/api";

export class UserStore {
    users: User[] = [];
    addresses: Address[] = [];

    loadingUsers = false;
    loadingAddresses = false;

    page = 1;
    limit = 10;
    hasMoreUsers = true;

    constructor() {
        makeAutoObservable(this);
    };



resetUsers() {
    this.users = [];
    this.page = 1;
    this.hasMoreUsers = true;
    this.fetchUsers();
}

async fetchUsers() {
    if(this.loadingUsers || !this.hasMoreUsers)
        return
    this.loadingUsers = true;
    try {
        const response = await apiFetchUsers(this.page, this.limit);
        const data = response.data;
        runInAction(() => {
            this.users = [...this.users, ...data];
            if(data.length < this.limit){
                this.hasMoreUsers = false;
            }
            else {
                this.page += 1;
            }
        })
        return response.data;
    } catch (error) {
        console.error('Не могу загрузить пользователей', error);
        throw error;
    } finally {
        runInAction(() => {
            this.loadingUsers = false;
        })
    }
};

async addUser(user: Omit<User, 'id'>) {
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

async fetchAddress(user_id: number) {
    this.loadingAddresses = true;
    try {
        const response = await apiFetchAddresses(user_id);
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

async addAddress(address: Omit<Address, 'id'>) {
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