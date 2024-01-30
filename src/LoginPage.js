// LoginPage.js

import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from 'react-router-dom'
import './Login.css';
import GoogleIcon from './GoogleIcon';

const firebaseConfig = {
  apiKey: "AIzaSyDTxc4nVZunx4IQKfVGO2R_S3lnvI9UX9I",
  authDomain: "textcopy-e0e8b.firebaseapp.com",
  databaseURL: "https://textcopy-e0e8b-default-rtdb.firebaseio.com",
  projectId: "textcopy-e0e8b",
  storageBucket: "textcopy-e0e8b.appspot.com",
  messagingSenderId: "359360837627",
  appId: "1:359360837627:web:b223ee75a15688e962fd5e",
  measurementId: "G-VTBTWP26VL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LoginPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/'); // Redirect to '/' after successful login
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };
  

  return (
    <div className="login-container">
      <button onClick={handleGoogleLogin} className="google-login-button">
        <div className="google-icon-container">
          <GoogleIcon />
        </div>
        <div className="button-text">UNLOCK WITH GOOGLE..!</div>
      </button>
    </div>
  );
};

export default LoginPage;
