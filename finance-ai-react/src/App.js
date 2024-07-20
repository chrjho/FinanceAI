import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [version, setVersion] = useState([]);
  const [status, setStatus] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/health/')
      .then(response => {
        // Axios automatically parses json data can easily access it
        // console.log(response.data)
        setVersion(response.data.version);
        setStatus(response.data.status);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <h1>App Health</h1>
      <h2>Version: {version}</h2>
      <h2>Status: {status}</h2>
    </div>
  );
}

export default App;
