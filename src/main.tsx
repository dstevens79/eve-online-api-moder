import React from 'react'
import { createRoot } from 'react-dom/client'
import "@github/spark/spark"

import App from './App.tsx'

import "./main.css";

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
