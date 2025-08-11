import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    Click and drag on the canvas for Panning <br />
    Use Ctrl + Mouse Wheel on the canvas for Zooming
    <App />
  </StrictMode>,
)
