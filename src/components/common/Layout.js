import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Импортируем Header
import Footer from './Footer'; // Импортируем Footer

const Layout = () => {
    return (
        <div className="layout">
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}> {/* Растягиваем контент, чтобы футер был внизу */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;