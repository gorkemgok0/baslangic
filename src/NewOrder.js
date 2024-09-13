import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOrder, uploadPhoto } from './firebase';
import { auth } from './firebase'; // Auth import edin
import heic2any from "heic2any"; // heic2any kütüphanesini import edin
import './NewOrder.css';

const NewOrder = () => {
  const [description, setDescription] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const photoURLs = [];
      if (photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          let file = photoFiles[i];

          // HEIC veya HEIF dosyalarını JPG'e dönüştür
          if (file.type === 'image/heic' || file.type === 'image/heif') {
            try {
              const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
              });
              file = new File([convertedBlob], `${file.name.split('.')[0]}.jpg`, {
                type: 'image/jpeg',
              });
            } catch (conversionError) {
              console.error("HEIC/HEIF to JPG conversion failed: ", conversionError);
              setError("Failed to convert image");
              setLoading(false);
              return;
            }
          }

          const url = await uploadPhoto(file);
          photoURLs.push(url);
        }
      }

      const user = auth.currentUser;
      const userNickname = user.displayName || 'Anonymous'; // Kullanıcı nickname'ini alıyoruz

      const orderData = {
        description,
        photoURLs, // Birden fazla fotoğraf URL'sini kaydediyoruz
        deadline: deadline || new Date().toISOString(),
        createdBy: userNickname, // Nickname'i sipariş verisi olarak kaydediyoruz
        createdAt: new Date().toISOString(), // Eklenme tarihi
      };

      await saveOrder(orderData);

      navigate('/dashboard');
    } catch (error) {
      console.error("Error submitting order: ", error);
      setError("Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setPhotoFiles([...e.target.files]);
  };

  return (
    <div className="new-order-container">
      <h2>Yeni Sipariş</h2>
      <form onSubmit={handleSubmit} className="new-order-form">
        <div className="form-group">
          <label>Açıklama:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Foto:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            multiple
          />
        </div>
        <div className="form-group">
          <label>Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>
    </div>
  );
};

export default NewOrder;
