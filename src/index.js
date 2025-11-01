import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AnnouncementProvider } from './context/AnnouncementContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AnnouncementProvider>
          <App />
        </AnnouncementProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);