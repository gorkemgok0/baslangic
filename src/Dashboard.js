import React, { useEffect, useState } from 'react';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { database, auth } from './firebase';
import OrderDetailsModal from './OrderDetailsModal';
import CalendarView from './CalendarView';
import './Dashboard.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDateOrders, setSelectedDateOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const ordersRef = ref(database, 'orders');
    const completedOrdersRef = ref(database, 'completedOrders');
    
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersList = Object.keys(data).map(id => ({ id, ...data[id] }));
        ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersList);
        filterOrdersByDate(selectedDate, ordersList);
      }
    });

    const unsubscribeCompletedOrders = onValue(completedOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const completedOrdersList = Object.keys(data).map(id => ({ id, ...data[id] }));
        setCompletedOrders(completedOrdersList);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeCompletedOrders();
    };
  }, [navigate, selectedDate]);

  const filterOrdersByDate = (date, ordersList) => {
    const selectedDateOrders = ordersList.filter(order => {
      const orderDate = new Date(order.createdAt).toDateString();
      return orderDate === date.toDateString();
    });
    setSelectedDateOrders(selectedDateOrders);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterOrdersByDate(date, orders); // Update the order list when date changes
  };

  const handleOrderReceived = async (order) => {
    try {
      const completedOrderRef = ref(database, 'completedOrders/' + order.id);
      await set(completedOrderRef, { 
        ...order,
        completedAt: new Date().toISOString(),
        status: 'completed'
      });

      const orderRef = ref(database, 'orders/' + order.id);
      await remove(orderRef);

      closeModal();
    } catch (error) {
      console.error('Error marking order as received:', error);
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      const orderRef = ref(database, 'orders/' + order.id);
      await update(orderRef, { status: 'cancelled' });

      const completedOrderRef = ref(database, 'completedOrders/' + order.id);
      await remove(completedOrderRef);

      closeModal();
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  const handleRevertOrder = async (order) => {
    try {
      const orderRef = ref(database, 'orders/' + order.id);
      await set(orderRef, { 
        ...order,
        status: 'pending'
      });

      const completedOrderRef = ref(database, 'completedOrders/' + order.id);
      await remove(completedOrderRef);

      closeModal();
    } catch (error) {
      console.error('Error reverting order:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Sipariş Menüsü</h2>
        <div className="buttons">
          <button onClick={() => navigate('/new-order')} className="button new-order-button">
            <span className="plus-sign">+</span> Yeni Sipariş
          </button>
          <button onClick={() => navigate('/completed-orders')} className="button completed-orders-button">
            Tamamlanmış Siparişler
          </button>
        </div>
      </div>

      <div className="calendar-and-orders">
        <CalendarView onDateChange={handleDateChange} />
        <div className="orders-list">
          {selectedDateOrders.length > 0 ? (
            selectedDateOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order)}
                className="order-card"
                style={{ backgroundColor: '#b8b8b8' }
                
              }
              >
                <p><strong>Açıklama:</strong> {order.description}</p>
                {order.photoURLs && order.photoURLs.length > 0 && (
                  <img
                    src={order.photoURLs[0]}
                    alt="Order"
                    className="order-photo"
                  />
                )}
                <p><strong>Verildiği Tarih:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>Bu tarihe ait sipariş bulunmamaktadır.</p>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={closeModal}
          onOrderReceived={handleOrderReceived}
          onCancelOrder={handleCancelOrder}
          onRevertOrder={handleRevertOrder}
          view="dashboard" // Pass view type if needed for the modal
        />
      )}
    </div>
  );
};

export default Dashboard;
