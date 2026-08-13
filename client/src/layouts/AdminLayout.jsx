import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar.jsx';
import TopNavbar from '../components/admin/TopNavbar.jsx';
import '../styles/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-app">
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
