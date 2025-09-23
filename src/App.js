import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// import MapPage from './pages/MapPage'; // Для будущей страницы карты
import Layout from './components/common/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Вложенные роуты будут отображаться внутри Layout */}
        <Route index element={<HomePage />} />
        {/* <Route path="map" element={<MapPage />} /> */}
        {/* Здесь будут другие страницы: /login, /profile и т.д. */}
      </Route>
    </Routes>
  );
}

export default App;