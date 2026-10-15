import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashBoard from './pages/DashBoard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { UploadProgressProvider } from './contextApi/uploadProgress';
import GlobalUploadProgressWidget from './components/GlobalUploadProgressWidget';

const queryClient = new QueryClient();

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UploadProgressProvider>
          {/* Global Toast Notifications */}
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                zIndex: 999999,
              },
            }}
          />

          {/* Global Upload Progress Float Widget */}
          <GlobalUploadProgressWidget />

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<DashBoard />} />
          </Routes>
        </UploadProgressProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
