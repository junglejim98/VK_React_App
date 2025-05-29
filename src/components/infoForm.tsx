import React from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { userStore } from '../store/UserStore';
import { User, Address, UserRole } from '../types';
import type { FormValues } from '../types/form';
import style from "./form.module.scss";

export const InfoForm: React.FC = observer(() => {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            telegram_uid: 0,
            role_id: UserRole.USER,
            extraFields: [],
            addresses: [{country: '', city: '', street: '', building: '', appartment: '', postal_code: ''}],
        },
    })

    const {
        fields: extraFields,
        append: appendUserExtra,
        remove: removeUserExtra,
    } = useFieldArray({ control, name: 'extraFields' })

    const {
        fields: addresses,
        append: appendAddress,
        remove: removeAddress,
    } = useFieldArray({ control, name: 'addresses' })

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        const userPayload: Omit<User, 'id'> = {
            telegram_uid: data.telegram_uid,
            first_name: data.first_name,
            last_name: data.last_name,
            tg_username: data.tg_username,
            photo_url: data.photo_url,
            role_id: data.role_id,
            created_at: new Date().toISOString(),
            extraFields: data.extraFields.reduce<Record<string,string>>((acc, cur) => {
                if (cur.key)
                    acc[cur.key] = cur.value
                return acc
            }, {}),
        }
   
        try {
            console.log('form data:', data)
        const created: User = await userStore.addUser(userPayload)

        for (const addr of data.addresses) {
            const addressPayload: Omit<Address, 'id'> = {
                user_id: created.id,
                country: addr.country,
                city: addr.city,
                street: addr.street,
                building: addr.building,
                appartment: addr.appartment,
                postal_code: addr.postal_code,
                is_deleted: false,
            }
            await userStore.addAddress(addressPayload);
        }
        reset();
        userStore.resetUsers()
        } catch (error) {
            console.error('Ошибка при добавлении данных в базу', error);
        }
    }

    const isSubmitting = userStore.loadingUsers || userStore.loadingAddresses
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <h2>Добавить пользователя</h2>
        <div className={style.formRow}>
        <div className={style.inputBlock}>
            <label className={style.label}>Telegram UID*</label>
            <input type="number" {...register('telegram_uid', { required: 'UID обязателен', valueAsNumber: true })} className={style.input}/>
            {errors.telegram_uid && <span>{errors.telegram_uid.message}</span>}
        </div>

        <div className={style.inputBlock}>
            <label className={style.label}>Имя*</label>
            <input type="text" {...register('first_name', { required: 'Имя обязательно' })} className={style.input}/>
            {errors.first_name && <span>{errors.first_name.message}</span>}
        </div>

        <div className={style.inputBlock}>
            <label className={style.label}>Фамилия*</label>
            <input type="text" {...register('last_name', { required: 'Фамилия обязательно' })} className={style.input}/>
            {errors.last_name && <span>{errors.last_name.message}</span>}
        </div>

        <div className={style.inputBlock}>
            <label className={style.label}>TG username</label>
            <input type="text" {...register('tg_username')} className={style.input}/>
        </div>

        <div className={style.inputBlock}>
            <label className={style.label}>Ссылка на фото профиля</label>
            <input {
                ...register('photo_url', {
                    pattern: {
                        value: /^(https?:\/\/\S+)$/,
                        message: 'Неверная ссылка',
                    },
                })
            } className={style.input}/>
            {errors.photo_url && <span>{errors.photo_url.message}</span>}
        </div>
        <div className={style.inputBlock}>
            <label className={style.label}>Роль*</label>
            <select {...register('role_id', {required: true})} className={style.input}>
                <option value = {UserRole.ADMIN}>ADMIN</option>
                <option value = {UserRole.MODERATOR}>MODERATOR</option>
                <option value = {UserRole.USER}>USER</option>
            </select>
        </div>

        <fieldset className={style.field}>
            <legend className={style.legend}> Дополнительные поля </legend>
            {extraFields.map((userField, idx) => (
                <div key = {userField.id} className={style.inputBlock}>
                    <input
                        placeholder='Название поля'
                        {
                            ...register(`extraFields.${idx}.key` as const, {
                                required: 'Введите имя поля',
                            })
                        } className={style.input}/>
                    <input placeholder='Значение для нового поля'
                    {
                        ...register(`extraFields.${idx}.value` as const, {
                            required: ' Задайте значение для поля',
                        })
                    } className={style.input}/>
                    <button type='button' onClick={() => removeUserExtra(idx)} className={style.button}>
                        Удалить поле
                    </button>
                </div>
            ))}
            <button type='button' onClick={() => appendUserExtra({key: '', value: ''})} className={style.button}>
                Добавить дополнительное поле
            </button>
        </fieldset>

        <fieldset className={style.field}>
            <legend className={style.legend}>Адрес</legend>
            {addresses.map((addrField, idx) => (
                <div key = {addrField.id} className={style.inputBlock}>
                    <h4>Адрес №{idx + 1}</h4>
                    <input
                        placeholder='Страна'
                        {
                            ...register(`addresses.${idx}.country`, { required: 'Страна обязателен' })
                        } className={style.input}/>
                    <input
                        placeholder='Город'
                        {
                            ...register(`addresses.${idx}.city`, { required: 'Город обязателен' })
                        } className={style.input}/>
                    <input
                        placeholder='Улица'
                        {
                            ...register(`addresses.${idx}.street`, { required: 'Улица обязателна' })
                        } className={style.input}/>
                    <input
                        placeholder='Дом'
                        {
                            ...register(`addresses.${idx}.building`, { required: 'Номер дома обязателен' })
                        } className={style.input}/>
                    <input
                        placeholder='Квартира'
                        {
                            ...register(`addresses.${idx}.appartment`)
                        } className={style.input}/>
                    <input 
                        placeholder='Индекс'
                        {
                            ...register(`addresses.${idx}.postal_code`, {required: 'Индекс обязателен'})
                        }
                    className={style.input} />
                    <button type='button' onClick={() => {
                        if (addresses.length > 1) removeAddress(idx)}} 
                        disabled = {addresses.length <= 1}
                        className={style.button}>
                        Удалить адрес
                    </button>
                </div>
            ))}
            <button type='button' onClick={() => appendAddress({
                country: '', city: '', street: '', building: '', appartment: '', postal_code: ''
                })} className={style.button}>
                    Добавить дополнительный адрес
                </button>
        </fieldset>
        </div>
      
            <button type='submit' disabled={isSubmitting} className={style.submitButton}>
                {isSubmitting ? 'Сохраняю...' : 'Сохранить'}
            </button>
      
        </form>
    )
})