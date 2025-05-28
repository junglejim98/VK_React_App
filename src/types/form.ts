import { User, Address } from ".";

export interface ExtraField {
    key: string
    value: string
};

export type AddressInput = Omit<Address, 'id' | 'user_id'| 'is_deleted'>

export interface FormValues extends Omit<User, 'id' | 'created_at' | 'addresses' | 'extraFields'> {
    extraFields: ExtraField[];
    addresses: AddressInput[];
};