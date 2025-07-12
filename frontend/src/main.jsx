import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';


// import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'



createRoot(document.getElementById('root')).render(
 <GoogleOAuthProvider clientId="191610633692-525ibvh2fv22k1j4ohadq4ne776m6m1e.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
)
