import React from 'react';
import styles from './UserAvatar.module.css';

const COLORS = [
    '#3498db', '#2ecc71', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#d35400', '#c0392b', '#7f8c8d'
];

const getInitials = (name) => {
    if (!name) return '?';
    const words = name.split(' ').filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const getColorByName = (name) => {
    if (!name) return COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index];
};

const UserAvatar = ({ name, avatarUrl, className }) => {
    if (avatarUrl) {
        return <img src={avatarUrl} alt={name} className={`${styles.avatarImage} ${className}`} />;
    }

    const initials = getInitials(name);
    const backgroundColor = getColorByName(name);

    return (
        <div
            className={`${styles.avatarPlaceholder} ${className}`}
            style={{ backgroundColor }}
        >
            <span className={styles.initials}>{initials}</span>
        </div>
    );
};

export default UserAvatar;