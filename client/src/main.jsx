import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookmarkProvider } from './context/BookmarkContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BookmarkProvider>
          <App />
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3200,
              style: {
                background: '#2E1F1B',
                color: '#FFFAF5',
                borderRadius: '14px',
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#3F6B55', secondary: '#FFFAF5' } },
              error: { iconTheme: { primary: '#B8232F', secondary: '#FFFAF5' } },
            }}
          />
        </BookmarkProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
