import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Beranda from '@/pages/Beranda';
import CariRute from '@/pages/CariRute';
import Peta from '@/pages/Peta';
import LiveTracking from '@/pages/LiveTracking';
import TransitHub from '@/pages/TransitHub';
import Armada from '@/pages/Armada';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/cari-rute" element={<CariRute />} />
          <Route path="/peta" element={<Peta />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/transit-hub" element={<TransitHub />} />
          <Route path="/armada" element={<Armada />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
