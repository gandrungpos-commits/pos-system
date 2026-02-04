import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initAPIClient } from '@pos/api-client';
import './index.css';

// Initialize API Client
initAPIClient((import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000/api');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
