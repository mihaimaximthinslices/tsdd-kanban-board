import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'

axios.defaults.baseURL = import.meta.env.VITE_HOST_BE || 'http://localhost:3001'

axios.defaults.withCredentials = true

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
