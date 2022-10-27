import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css';
import Sidebar from './components/sidebar';
import Accounts from './pages/accounts';
import Analytics from './pages/analytics';
import Dashboard from './pages/dashboard';
import Settings from './pages/settings';
import Transactions from './pages/transactions';
import Logout from './pages/logout';

const App = () => {
  
  return (
    <div>
      <BrowserRouter>
        <Sidebar>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<Logout />} onEnter={() => console.log('Entered')}  />
          </Routes>
        </Sidebar>
      </BrowserRouter>
    </div>
  );
}

export default App;
