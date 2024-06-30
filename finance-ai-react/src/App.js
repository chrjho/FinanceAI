import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/stocks/')
      .then(response => {
        setStocks(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <h1>Stock Data</h1>
      <h2>{stocks}</h2>
    </div>
  );
}

export default App;
