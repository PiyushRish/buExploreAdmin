import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MyBarGraph from './components/ui/admin/BarChart';
import MyPieChart from './components/ui/admin/PieChart';
import DashBoard from './pages/DashBoard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const Dashboard = () => <><MyBarGraph/> <MyPieChart/></>;

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;