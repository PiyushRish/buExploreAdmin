import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MyBarGraph from './components/ui/admin/BarChart';
import MyPieChart from './components/ui/admin/PieChart';
import DashBoard from './pages/DashBoard';

// const Dashboard = () => <><MyBarGraph/> <MyPieChart/></>;

const App = () => {
  return (
 
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashBoard />} />
    </Routes>
  );
};

export default App;