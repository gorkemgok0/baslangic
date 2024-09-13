import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase'; // Firebase config import
import OrderDetailsModal from './OrderDetailsModal'; // Modal component import
import Calendar from 'react-calendar'; // React Calendar import
import 'react-calendar/dist/Calendar.css'; // Calendar CSS import
import './CompletedOrders.css'; // Custom CSS import
import { useNavigate } from 'react-router-dom'; // Navigation hook import

const CompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedDateOrders, setSelectedDateOrders] = useState([]); // Orders by selected date
  const [selectedDate, setSelectedDate] = useState(new Date()); // Currently selected date

  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const completedOrdersRef = ref(database, 'completedOrders');
    const unsubscribe = onValue(completedOrdersRef, (snapshot) => {
      const data = snapshot.val();
      const ordersList = [];
      for (let id in data) {
        ordersList.push({ id, ...data[id] });
      }
      ordersList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setCompletedOrders(ordersList);
      filterOrdersByDate(selectedDate); // Filter orders by the initially selected date
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const filterOrdersByDate = (date) => {
    const filteredOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.timestamp).toDateString();
      return orderDate === date.toDateString();
    });
    setSelectedDateOrders(filteredOrders);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleImageClick = (order, e) => {
    e.stopPropagation(); // Prevent click from propagating
    setSelectedOrder(order);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterOrdersByDate(date);
  };

  const goToOrders = () => {
    navigate('/dashboard'); // Navigate to orders menu
  };

  const getOrdersForDate = (date) => {
    const orderDate = date.toDateString();
    return completedOrders.filter(order => new Date(order.timestamp).toDateString() === orderDate);
  };

  const tileContent = ({ date, view }) => {
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
  };

  return (
    <div style={containerStyle}>
      <button onClick={goToOrders} style={backButtonStyle}>Geri Dön</button>
      <h2 style={headingStyle}>Tamamlanan Siparişler</h2>
      
      <div style={calendarWrapperStyle}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="custom-calendar"
          tileContent={tileContent}
        />
      </div>
      
      <div style={selectedOrdersContainerStyle}>
        <h3>Seçilmiş Tarihe Göre Siparişler:</h3>
        {selectedDateOrders.length > 0 ? (
          <div style={ordersContainerStyle}>
            {selectedDateOrders.map(order => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order)}
                style={orderCardStyle}
              >
                <p><strong>Açıklama:</strong> {order.description}</p>
                {order.photoURL && (
                  <div>
                    <img
                      src={order.photoURL}
                      alt="Order"
                      style={imageStyle}
                      onClick={(e) => handleImageClick(order, e)}
                    />
                  </div>
                )}
                <p><strong>Deadline:</strong> {new Date(order.deadline).toLocaleDateString()}</p>
                <p><strong>Tamamlayan Kişi:</strong> {order.completedBy || 'Unknown'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Bu tarihte sipariş yok.</p>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
         order={selectedOrder}
         onClose={closeModal}
         isCompletedView={true}  // Burada isCompletedView prop'unu ekledik
        />
      )}


      {isImageModalOpen && (
        <div style={imageModalStyle}>
          <button onClick={closeImageModal} style={modalCloseButtonStyle}>✕</button>
          <img
            src={selectedOrder?.photoURL}
            alt="Order"
            style={expandedImageStyle}
          />
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '20px',
  backgroundColor: '#b0ad89', /* Dark background for the page */
  color: '#e0e0e0', /* Light text color */
  minHeight: '100vh',
  position: 'relative',
};

const headingStyle = {
  color:'#ad0909',
  padding:'30px',
  position:'static',
  textAlign: 'center',
  marginBottom: '15px',
  fontSize:'30px',

  
};

const calendarWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const selectedOrdersContainerStyle = {
  marginTop: '20px',
};

const ordersContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const orderCardStyle = {
  padding: '15px',
  borderRadius: '8px',
  backgroundColor: '#2c2c2c',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
  cursor: 'pointer',
};

const imageStyle = {
  maxWidth: '150px',
  maxHeight: '150px',
  borderRadius: '8px',
  cursor: 'pointer',
};

const imageModalStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: '1000',
};

const expandedImageStyle = {
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'contain',
};

const modalCloseButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '24px',
  cursor: 'pointer',
};

const backButtonStyle = {
  position: 'relative',
  top: '10px',
  right: '0px',
  backgroundColor: '#d9d4d4', // Gray background
  color: 'black',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '30px',
  textAlign: 'center',
};

const tileContentStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
};

const orderCountStyle = {
  backgroundColor: 'red', // red arkaplan
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
};

export default CompletedOrders;
