import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import Layout from './components/common/Layout';
import MapLayout from './components/common/MapLayout';
import ProfilePage from './pages/ProfilePage';
import CreateAnnouncementPage from './pages/CreateAnnouncementPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';
import MyAnnouncementsPage from './pages/MyAnnouncementsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="create-announcement" element={<CreateAnnouncementPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="my-ads" element={
          <ProtectedRoute>
            <MyAnnouncementsPage />
          </ProtectedRoute>
        } />
      </Route>
      <Route path="/map" element={<MapLayout />}>
        <Route index element={<MapPage />} />
      </Route>
    </Routes>
  );
}

export default App;