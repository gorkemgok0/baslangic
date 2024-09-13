import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';
import 'react-calendar/dist/Calendar.css';
import OrderDetailsModal from './OrderDetailsModal';

const CalendarView = ({ onDateChange }) => {
  const [date, setDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter out cancelled orders
        const filteredOrders = Object.values(data).filter(order => order.status !== 'cancelled');
        setOrders(filteredOrders);
      }
    });
    return () => unsubscribe();
  }, []);

  const getOrdersForDate = (date) => {
    const formattedDate = formatDateToString(date);
    return orders.filter(order => 
      formatDateToString(new Date(order.createdAt)) === formattedDate
    );
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div style={containerStyle}>
      <Calendar
        onChange={(newDate) => {
          setDate(newDate);
          onDateChange(newDate); // Pass the selected date to the Dashboard component
        }}
        value={date}
        tileContent={({ date, view }) => {
          if (view === 'month') {
            const ordersForDate = getOrdersForDate(date);
            return (
              <div style={tileContentStyle}>
                {ordersForDate.length > 0 && (
                  <span style={orderCountStyle}>{ordersForDate.length}</span>
                )}
              </div>
            );
          }
          return null;
        }}
      />
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};
// Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#9f9f9f',
  color: '#fff',
  borderRadius: '8px',
};

const tileContentStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const orderCountStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
};


export default CalendarView;
