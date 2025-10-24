import React from 'react';
import styles from './MapMarker.module.css'; // Мы создадим этот файл стилей далее

const MapMarker = ({ color }) => {
    return (
        <div className={styles.marker}>
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.26801 0 0 6.26801 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.26801 21.732 0 14 0Z" fill={color} />
                <circle cx="14" cy="14" r="6" fill="white" />
            </svg>
        </div>
    );
};

export default MapMarker;