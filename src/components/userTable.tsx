import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { observer } from "mobx-react-lite";
import { userStore } from "../store/UserStore";
import { UserRole } from "../types";
import { Container, Row, Col, Card, Table, Spinner } from 'react-bootstrap'

export const UserTable: React.FC = observer(() => {
    useEffect(() => {
        if (userStore.users.length === 0)
            userStore.fetchUsers()
        if (userStore.addresses.length === 0){
            userStore.fetchAllAddresses()
        }
    }, [])

    const staticCols = ['TG_UID', 'Имя', 'Фамилия', 'TG Имя пользователя', 'URL фото', 'Роль', 'Дата регистрации', 'Адрес(а)'];

    const dynamicCols = userStore.dynamicFieldKeys;

    return (
        <Container className='py-5'>
            <Row className='justify-content-center'>
                <Col lg={12}>
                    <Card className='shadow-sm'>
                        <Card.Header as='h2' className='bg-white'>
                            Список пользователей
                        </Card.Header>
                        <Card.Body className='p-0'>
                            <InfiniteScroll
                                dataLength={userStore.users.length}
                                next={() => userStore.fetchUsers()}
                                hasMore={userStore.hasMoreUsers}
                                loader={
                                    <div className='text-centr py-3'>
                                        <Spinner animation='border' size='sm' />
                                    </div>
                                }
                                endMessage={
                                <p className='text-center py-3 mb-0'>Больше пользователей нет.</p>
                                } 
                            >
                            <Table striped hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        {staticCols.map(col => (
                                            <th key={col}>{col}</th>
                                        ))}
                                        {dynamicCols.map((key) => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {userStore.users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.telegram_uid}</td>
                                            <td>{user.first_name}</td>
                                            <td>{user.last_name}</td>
                                            <td>{user.tg_username}</td>
                                            <td>{
                                            user.photo_url ? (
                                                <img
                                                src={user.photo_url}
                                                alt="Фото профиля"
                                                style={{width: 32, height: 32, borderRadius: '50%' }}
                                                />
                                                ) : (
                                                   `>>_<<`
                                                )} 
                                            </td>
                                            <td>{UserRole[user.role_id]}</td>
                                            <td>{new Date(user.created_at).toLocaleString()}</td>
                                            <td>
                                                {(userStore.addressesForUser[user.id] ?? []).map((addr, i) => (
                                                    <div key={i}>
                                                        {addr.country}, {addr.city}, {addr.street} {addr.building}
                                                        {addr.appartment && `, кв.${addr.appartment}`}; {addr.postal_code}
                                                    </div>
                                                ))}
                                            </td>
                                            {dynamicCols.map(key => (
                                                <td key={key}>
                                                    {user.extraFields?.[key] ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            </InfiniteScroll>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
})