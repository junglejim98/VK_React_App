import React from 'react';
import logo from './logo.svg';
import './App.css';
import { InfoForm } from './components/infoForm';
import { UserTable } from './components/userTable';

export const App: React.FC = () => {
  return(<div>
    <h1>Управление пользователями</h1>
    <section>
    <InfoForm />
    </section>

    <section>
      <UserTable />
    </section>
  </div>)
}

export default App;
