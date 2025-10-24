import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="layout">
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}> {}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;