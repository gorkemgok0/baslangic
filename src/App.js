import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import NewOrder from './NewOrder';
import Dashboard from './Dashboard';
import Register from './Register'; // Import your Register component
import CompletedOrders from './CompletedOrders'; // Import your CompletedOrders component

const App = () => {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', margin: '0', padding: '0' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* Add this line */}
          <Route path="/new-order" element={<NewOrder />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/completed-orders" element={<CompletedOrders />} /> {/* Add this line */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
