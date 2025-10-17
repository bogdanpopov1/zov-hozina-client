import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

// Этот Layout почти идентичен основному, но в нем НЕТ футера.
// Это позволяет странице с картой занимать всю высоту экрана под хедером.
const MapLayout = () => {
    return (
        <div className="layout">
            <Header />
            <main> {/* Убираем лишние стили отсюда */}
                <Outlet />
            </main>
            {/* Footer отсутствует */}
        </div>
    );
};

export default MapLayout;