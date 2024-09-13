import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getDatabase, ref, set, onValue, remove, update as dbUpdate } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy7f9zIZD2CoUJe2w7oRxgKRHh6SATc6I",
  authDomain: "baslangic-79093.firebaseapp.com",
  projectId: "baslangic-79093",
  storageBucket: "baslangic-79093.appspot.com",
  messagingSenderId: "1079177198872",
  appId: "1:1079177198872:web:2092b34e0a670af7e7726d",
  measurementId: "G-VX9C24GJK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Authentication Functions
const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
const logout = () => signOut(auth);
const updateUserProfile = (nickname) => updateProfile(auth.currentUser, { displayName: nickname });

// Database Functions
const saveOrder = async (orderData) => {
  const orderRef = ref(database, 'orders/' + Date.now());
  const orderWithTimestamp = {
    ...orderData,
    createdAt: new Date().toISOString(), // Add createdAt timestamp
    status: 'pending' // Default status
  };
  return set(orderRef, orderWithTimestamp);
};

const fetchOrders = (callback, status = 'all') => {
  const ordersRef = ref(database, 'orders');
  return onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    const ordersList = [];
    if (data) {
      for (let id in data) {
        if (status === 'all' || data[id].status === status) {
          ordersList.push({ id, ...data[id] });
        }
      }
    }
    callback(ordersList);
  });
};

const updateOrderStatus = async (orderId, status) => {
  const orderRef = ref(database, `orders/${orderId}`);
  return dbUpdate(orderRef, { status });
};

const deleteOrder = async (orderId) => {
  const orderRef = ref(database, `orders/${orderId}`);
  return remove(orderRef);
};

// Storage Functions
const uploadPhoto = async (file) => {
  const photoRef = storageRef(storage, `photos/${Date.now()}_${file.name}`);
  await uploadBytes(photoRef, file);
  const photoURL = await getDownloadURL(photoRef);
  return photoURL;
};

export {
  auth,
  register,
  login,
  logout,
  updateUserProfile,
  database,
  saveOrder,
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
  uploadPhoto
};
