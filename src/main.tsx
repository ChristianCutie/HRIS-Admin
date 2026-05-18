
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import "@fontsource/rethink-sans/500.css";

createRoot(document.getElementById('root')!).render(

  <BrowserRouter basename="/snl-hr/frontend/">
    <App />
  </BrowserRouter>
)
