import MockAdapter from 'axios-mock-adapter';
import { userStore, UserStore } from './UserStore';
import api from '../servises/api';
import type { User } from '../types';

describe('UserStore', () => {
  let mock: MockAdapter
  let store: UserStore

  beforeEach (() => {
    mock = new MockAdapter(api)

    store = new UserStore()
  })

  afterEach(() => {
    mock.restore()
  })

  test('fetchUser загружает пользователей и корректно обновляет hasMoreUsers', async () => {
    const fakeUsers: User[] = [
      {
        id: 1,
        telegram_uid: 100,
        first_name: 'Иван',
        last_name: 'Иванов',
        tg_username: 'ivanov',
        role_id: 3,
        created_at: '2025-05-29T12:00:00.000Z',
        extraFields: { hobby: 'видеоигры' },
      },
    ]
    mock
      .onGet('/users?_sort=created_at&_order=desc&_page=1&_limit=10')
      .reply(200, fakeUsers, { 'x-total-count': '1' })

      await store.fetchUsers()

      expect(store.users).toEqual(fakeUsers)
      expect(store.hasMoreUsers).toBe(false)
  })

  test('addUser создает пользователя и возвращяет его', async () => {
    const newUser: Omit<User, 'id'> = {
      telegram_uid: 200,
      first_name: 'Пётр',
      last_name: 'Петров',
      tg_username: 'petrov',
      photo_url: undefined,
      role_id: 3,
      created_at: '2025-05-29T13:00:00.000Z',
      extraFields: {},
    }
    const returnedUser: User = { id: 2, ...newUser }

    mock.onPost('/users').reply(201, returnedUser)

    const created = await store.addUser(newUser)

    expect(created).toEqual(returnedUser)
    expect(store.users[0]).toEqual(returnedUser)
  })
})