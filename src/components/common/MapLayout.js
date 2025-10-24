import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MapLayout = () => {
    return (
        <div className="layout">
            <Header />
            <main> {}
                <Outlet />
            </main>
            {}
        </div>
    );
};

export default MapLayout;