import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { PlaceProvider } from './contextApi/places.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <PlaceProvider>
      <App />
    </PlaceProvider>
    </BrowserRouter>
  </StrictMode>,
)
