import React from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { userStore } from '../store/UserStore';
import { User, Address, UserRole } from '../types';
import type { FormValues } from '../types/form';
import { Form, Button, Row, Col } from 'react-bootstrap'

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
        <Form onSubmit={handleSubmit(onSubmit)} >
            <Row className='g-3 mb-4'>
                <Col md={4}>
                    <Form.Group controlId='telegram_uid'>
                        <Form.Label>Telegram UID*</Form.Label>
                        <Form.Control type="number" {...register('telegram_uid', { required: 'UID обязателен', valueAsNumber: true })}/>
                        {errors.telegram_uid && (<Form.Text className='text-danger'>{errors.telegram_uid.message}</Form.Text>)}
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId='first_name'>
                        <Form.Label>Имя*</Form.Label>
                        <Form.Control type="text" {...register('first_name', { required: 'Имя обязательно' })} />
                        {errors.first_name && (<Form.Text className='text-danger'>{errors.first_name.message}</Form.Text>)}
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId='last_name'>
                        <Form.Label>Фамилия*</Form.Label>
                        <Form.Control type="text" {...register('last_name', { required: 'Фамилия обязательно' })} />
                        {errors.last_name && (<Form.Text className='text-danger'>{errors.last_name.message}</Form.Text>)}
                    </Form.Group>
                </Col>
            </Row>
            
            <Row className='g-3 mb-4'>
                <Col md={4}>
                    <Form.Group controlId='tg_username'>
                        <Form.Label>TG username</Form.Label>
                        <Form.Control type="text" {...register('tg_username')} />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId='photo_url'>
                        <Form.Label>Ссылка на фото профиля</Form.Label>
                        <Form.Control {
                            ...register('photo_url', {
                                pattern: {
                                    value: /^(https?:\/\/\S+)$/,
                                    message: 'Неверная ссылка',
                                },
                            })
                        } />
                        {errors.photo_url && (<Form.Text className='text-danger'>{errors.photo_url.message}</Form.Text>)}
                    </Form.Group>
                </Col>
                <Col md={4}>
                        <Form.Group controlId='role_id'>
                            <Form.Label>Роль*</Form.Label>
                            <Form.Select {...register('role_id', {required: true})} >
                                <option value = {UserRole.ADMIN}>ADMIN</option>
                                <option value = {UserRole.MODERATOR}>MODERATOR</option>
                                <option value = {UserRole.USER}>USER</option>
                            </Form.Select>
                    </Form.Group>
                </Col>
            </Row>


        <fieldset className='border rounded p-4 mb-4 bg-light'>
            <legend className='fw-semibold px-2 bg-light'> Дополнительные поля </legend>
            {extraFields.map((userField, idx) => (
                <Row key = {userField.id} className='g-3 align-items-end mb-3'>
                    <Col md={6}>
                        <Form.Group controlId={`extraFields.${idx}.key`}>
                            <Form.Label>Название поля</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`extraFields.${idx}.key` as const, {
                                            required: 'Введите имя поля',
                                        })
                                    } />
                                    {errors.extraFields?.[idx]?.key && (
                                        <Form.Text className='text-danger'>
                                            {errors.extraFields[idx]!.key!.message}
                                        </Form.Text>
                                    )}
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                        <Form.Group controlId={`extraFields.${idx}.value`}>
                            <Form.Label>Значение</Form.Label>
                                <Form.Control
                                {
                                    ...register(`extraFields.${idx}.value` as const, {
                                        required: ' Задайте значение для поля',
                                    })
                                } />
                                {errors.extraFields?.[idx]?.value && (
                                        <Form.Text className='text-danger'>
                                            {errors.extraFields[idx]!.value!.message}
                                        </Form.Text>
                                )}
                        </Form.Group>
                    </Col>
                    <Col md={1}>
                    <Button variant='outline-danger' onClick={() => removeUserExtra(idx)}>
                        X
                    </Button>
                    </Col>
                </Row>
            ))}
            <Button variant='outline-primary' onClick={() => appendUserExtra({key: '', value: ''})}>
                Добавить дополнительное поле
            </Button>
        </fieldset>

        <fieldset className='border rounded p-4 mb-4 bg-light'>
            <legend className='fw-semibold px-2 bg-light'>Адрес</legend>
            {addresses.map((addrField, idx) => (
            <React.Fragment key = {addrField.id}>
                <Row  className='g-3 align-items-end mb-3'>
                    <Col xs={12}>
                        <h4>Адрес №{idx + 1}</h4>
                    </Col>
                    <Col md={4}>
                        
                        <Form.Group controlId={`addresses.${idx}.country`}>
                            <Form.Label>Страна</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`addresses.${idx}.country`, { required: 'Страна обязательна' })
                                    } />
                                    {errors.addresses?.[idx]?.country && (
                                        <Form.Text className='text-danger'>
                                            {errors.addresses[idx]!.country!.message}
                                        </Form.Text>
                                    )}
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId={`addresses.${idx}.city`}>
                            <Form.Label>Город</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`addresses.${idx}.city`, { required: 'Город обязателен' })
                                    } />
                                    {errors.addresses?.[idx]?.city && (
                                        <Form.Text className='text-danger'>
                                            {errors.addresses[idx]!.city!.message}
                                        </Form.Text>
                                    )}
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId={`addresses.${idx}.street`}>
                            <Form.Label>Улица</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`addresses.${idx}.street`, { required: 'Улица обязателна' })
                                    } />
                                    {errors.addresses?.[idx]?.street && (
                                        <Form.Text className='text-danger'>
                                            {errors.addresses[idx]!.street!.message}
                                        </Form.Text>
                                    )}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className='g-3 align-items-end mb-3'>
                    <Col md={3}>
                    <Form.Group controlId={`addresses.${idx}.building`}>
                            <Form.Label>Дом</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`addresses.${idx}.building`, { required: 'Номер дома обязателен' })
                                    }  />
                                    {errors.addresses?.[idx]?.building && (
                                        <Form.Text className='text-danger'>
                                            {errors.addresses[idx]!.building!.message}
                                        </Form.Text>
                                    )}
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                    <Form.Group controlId={`addresses.${idx}.appartment`}>
                            <Form.Label>Квартира</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`addresses.${idx}.appartment`)
                                    }  />
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                    <Form.Group controlId={`addresses.${idx}.postal_code`}>
                            <Form.Label>Индекс</Form.Label>
                                <Form.Control
                                    {
                                        ...register(`addresses.${idx}.postal_code`, {required: 'Индекс обязателен'})
                                    }  />
                                    {errors.addresses?.[idx]?.postal_code && (
                                        <Form.Text className='text-danger'>
                                            {errors.addresses[idx]!.postal_code!.message}
                                        </Form.Text>
                                    )}
                        </Form.Group>
                    </Col>
                    <Col md={1}>
                    <Button
                        variant='outline-danger'
                        onClick={() => addresses.length > 1 && removeAddress(idx)}
                        disabled={addresses.length <= 1}
                        >
                            X
                        </Button>
                    </Col>
                </Row>
            </React.Fragment>
            ))}
            <Button variant='outline-primary' onClick={() => appendAddress({
                country: '', city: '', street: '', building: '', appartment: '', postal_code: ''
                })}>
                    Добавить дополнительный адрес
                </Button>
        </fieldset>
       
        <div className='text-center'>
            <Button type='submit' variant='dark' disabled={isSubmitting}>
                {isSubmitting ? 'Сохраняю...' : 'Сохранить'}
            </Button>
        </div>
        </Form>
    )
})