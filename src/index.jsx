import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Make sure this points to App.jsx
import './App.css';

// Get the root element from the HTML file
const rootElement = document.getElementById('root');

// Create a root and render the App component inside it
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
