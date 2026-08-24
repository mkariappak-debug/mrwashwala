import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar.jsx';
import TopNavbar from '../components/admin/TopNavbar.jsx';
import '../styles/admin.css';
import desktopVideo from '../assets/background-video.mp4';
import mobileVideo from '../assets/mobile-background-video.mp4';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="admin-app">
      <div className="admin-dashboard-video-wrapper">
        <video 
          className="admin-dashboard-video"
          src={isMobile ? mobileVideo : desktopVideo}
          autoPlay 
          loop 
          muted 
          playsInline
        />
        <div className="admin-dashboard-overlay" />
      </div>
      
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-layout">
        <TopNavbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
