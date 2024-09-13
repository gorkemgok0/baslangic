// src/OrderDetails.js

import React from 'react';
import { ref, set, remove } from 'firebase/database';
import { database } from './firebase';
import { useNavigate } from 'react-router-dom';

const OrderDetails = ({ order }) => {
  const navigate = useNavigate();

  const handleCompleteOrder = async () => {
    try {
      const completedOrderRef = ref(database, 'completedOrders/' + order.id);
      await set(completedOrderRef, order); // Move the order to "completed orders"
      
      const orderRef = ref(database, 'orders/' + order.id);
      await remove(orderRef); // Remove the order from the current orders list
      
      navigate('/completed-orders'); // Redirect to the "completed orders" page
    } catch (error) {
      console.error("Error completing order: ", error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Sipariş Detayları</h2>
      <p><strong>Açıklama:</strong> {order.description}</p>
      {order.photoURL && <img src={order.photoURL} alt="Order" style={{ maxWidth: '300px', borderRadius: '8px' }} />}
      <p><strong>Deadline:</strong> {new Date(order.deadline).toLocaleDateString()}</p>
      <button
        onClick={handleCompleteOrder}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Sipariş Alındı
      </button>
    </div>
  );
};

export default OrderDetails;





