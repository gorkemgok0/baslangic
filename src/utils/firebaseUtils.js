// src/utils/firebaseUtils.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, database } from '../firebase'; // Firebase config import
import { ref as dbRef, set } from 'firebase/database';

// Upload photo to Firebase Storage
export const uploadPhoto = async (file) => {
  try {
    const storageRef = ref(storage, `orders/${file.name}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    return photoURL;
  } catch (error) {
    console.error("Error uploading photo: ", error);
    throw new Error("Failed to upload photo");
  }
};

// Save order to Firebase Realtime Database
export const saveOrder = async (orderData) => {
  try {
    const orderRef = dbRef(database, 'orders/' + orderData.id);
    await set(orderRef, orderData);
  } catch (error) {
    console.error("Error saving order: ", error);
    throw new Error("Failed to save order");
  }
};
