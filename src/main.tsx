import React from 'react'
import { createRoot } from 'react-dom/client'
import "@github/spark/spark"

import App from './App.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
