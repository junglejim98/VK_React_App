import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { observer } from "mobx-react-lite";
import { userStore } from "../store/UserStore";
import { UserRole } from "../types";

export const UserTable: React.FC = observer(() => {
    useEffect(() => {
        if (userStore.users.length === 0)
            userStore.fetchUsers()
    }, [])

    const staticCols = ['TG_UID', 'Имя', 'Фамилия', 'TG Имя пользователя', 'URL фото', 'Роль', 'Дата регистрации', 'Адрес(а)'];

    const dynamicCols = userStore.dynamicFieldKeys;

    return (
        <InfiniteScroll
            dataLength={userStore.users.length}
            next={() => userStore.fetchUsers()}
            hasMore={userStore.hasMoreUsers}
            loader={<h4>Загружаем</h4>}
            endMessage={<p>Больше пользователей нет.</p>} 
        >
        <table>
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
                        <td>{user.photo_url}</td>
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
        </table>
        
        </InfiniteScroll>

    )
})