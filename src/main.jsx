import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter  } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
