import React, { useState } from 'react';
import { ref, update, remove } from 'firebase/database';
import { database, auth } from './firebase';
import { useNavigate } from 'react-router-dom';


const OrderDetailsModal = ({ order, onClose, isCalendarView, isCompletedView }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageURL, setSelectedImageURL] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();



  const handleCompleteOrder = async () => {
    try {
      const user = auth.currentUser;
      const userNickname = user ? user.displayName : 'Anonymous';
      const timestamp = new Date().toISOString();

      const completedOrderRef = ref(database, 'completedOrders/' + order.id);
      await update(completedOrderRef, {
        ...order,
        timestamp,
        completedBy: userNickname,
      });

      const orderRef = ref(database, 'orders/' + order.id);
      await remove(orderRef);

      navigate('/completed-orders');

      if (isCalendarView) {
        const dashboardOrderRef = ref(database, 'dashboardOrders/' + order.id);
        await remove(dashboardOrderRef);
      }

      onClose();
    } catch (error) {
      console.error('Sipariş tamamlama sırasında hata:', error);
      setError('Sipariş tamamlama sırasında bir hata oluştu.');
    }
  };

  const handleRevertOrder = async () => {
    try {
      const user = auth.currentUser;
      const userNickname = user ? user.displayName : 'Anonymous';
      const timestamp = new Date().toISOString();

      const orderRef = ref(database, 'orders/' + order.id);
      await update(orderRef, {
        ...order,
        timestamp,
        createdBy: userNickname,
      });

      const completedOrderRef = ref(database, 'completedOrders/' + order.id);
      await remove(completedOrderRef);

      onClose();
    } catch (error) {
      console.error('Siparişi geri döndürme sırasında hata:', error);
      setError('Siparişi geri döndürme sırasında bir hata oluştu.');
    }
  };

  const handleCancelOrder = async () => {
    try {
      const orderRef = ref(database, 'orders/' + order.id);
      await remove(orderRef);
      onClose();
    } catch (error) {
      console.error('Sipariş iptali sırasında hata:', error);
      setError('Sipariş iptali sırasında bir hata oluştu.');
    }
  };

  const handleImageClick = (url) => {
    setSelectedImageURL(url);
    setIsImageModalOpen(true);
  };

  const handleOverlayClick = (e) => {
    // Close the modal only if the click is outside the image
    if (e.target.classList.contains('image-modal-overlay')) {
      setIsImageModalOpen(false);
      setSelectedImageURL('');
    }
  };

  const formatDateTime = (dateTime) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTime).toLocaleString('tr-TR', options);
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <button onClick={onClose} style={modalCloseButtonStyle}>✕</button>
        <h2>Sipariş Detayları</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <p><strong>Açıklama:</strong> {order.description}</p>
        {order.photoURLs && order.photoURLs.length > 0 && (
          <div style={imagesContainerStyle}>
            {order.photoURLs.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Order ${index}`}
                style={imageStyle}
                onClick={() => handleImageClick(url)}
              />
            ))}
            {isImageModalOpen && (
              <div style={imageModalStyle} onClick={handleOverlayClick} className="image-modal-overlay">
                <button onClick={() => setIsImageModalOpen(false)} style={modalCloseButtonStyle}>✕</button>
                <img
                  src={selectedImageURL}
                  alt="Order"
                  style={expandedImageStyle}
                />
              </div>
            )}
          </div>
        )}
        <p><strong>Sipariş Verilme Tarihi:</strong> {formatDateTime(order.createdAt)}</p>
        <p><strong>Son Tarih:</strong> {new Date(order.deadline).toLocaleDateString()}</p>
        <p><strong>Siparişi Veren:</strong> {order.createdBy || 'Siparişi veren kullanıcı'}</p>
        {order.completedBy && (
          <>
            <p><strong>Tamamlayan:</strong> {order.completedBy}</p>
            <p><strong>Siparişin Alındığı Zaman:</strong> {formatDateTime(order.timestamp)}</p>
          </>
        )}
        {!order.timestamp && !order.completedBy && (
          <>
          <button onClick={handleCompleteOrder} style={buttonStyle}>
            Sipariş Alındı
          </button> 
          <button onClick={handleCancelOrder} style={cancelButtonStyle}>
          Siparişi İptal Et
          </button>
          </>
        )}
        
        {order.completedBy && !isCompletedView && (
          <>

            <button onClick={handleCompleteOrder} style={buttonStyle}>
              Siparişi Yeniden Tamamla
            </button> 
            <button onClick={handleCancelOrder} style={cancelButtonStyle}>
             Siparişi İptal Et
            </button>
          </>
        )}
        {order.completedBy && isCompletedView && (
          <>            
            <button onClick={handleRevertOrder} style={revertButtonStyle}>
              Siparişi Geri Döndür
            </button>

          </>
        )}

        
        <div style={spacerStyle}></div>
      </div>
    </div>
  );
};

// Styles
const modalStyle = {
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

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '80%',
  maxWidth: '800px',
  maxHeight: '80%',
  position: 'relative',
  color: 'black',
  overflowY: 'auto',
};

const imagesContainerStyle = {
  display: 'flex',
  overflowX: 'auto',
  gap: '10px',
  marginBottom: '20px',
};

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'block',
  flexShrink: '0',
};

const buttonStyle = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '10px 20px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
};

const revertButtonStyle = {
  backgroundColor: 'grey',
  border: 'none',
  color: 'white',
  padding: '10px 20px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
};

const cancelButtonStyle = {
  backgroundColor: '#F44336',
  border: 'none',
  color: 'white',
  padding: '10px 20px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
};

const modalCloseButtonStyle = {
  position: 'static',
  top: '0px',
  right: '0px',
  backgroundColor: '#ad0909',
  border: 'none',
  color: 'black',
  fontSize: '14px',
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
  maxWidth: '110%',
  maxHeight: '110%',
  borderRadius: '10px',
};

const spacerStyle = {
  marginBottom: '40px',
};

const errorStyle = {
  color: 'red',
  marginBottom: '20px',
};

export default OrderDetailsModal;
