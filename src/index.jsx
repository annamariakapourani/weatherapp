import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import NormalMode from './components/NormalMode/NormalMode'
import SurferMode from './components/SurferMode/SurferMode'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<NormalMode />} />
        <Route path="/surfer" element={<SurferMode />} />
      </Routes>
    </Router>
  </StrictMode>
);
