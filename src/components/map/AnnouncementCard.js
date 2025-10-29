import React from 'react';
import { MapPin, Clock, Palette, User } from 'lucide-react';
import styles from './AnnouncementCard.module.css';

const AnnouncementCard = ({ announcement, onClick, isSelected }) => {
    const getStatusTag = (announcement) => {
        if (announcement.status === 'archived') { return { text: 'В архиве', className: styles.archivedTag }; }
        if (announcement.is_featured) { return { text: 'Срочный поиск', className: styles.urgentTag }; }
        return { text: 'В поиске', className: styles.defaultTag };
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Только что';
        if (diffInHours < 24) return `${diffInHours} час(ов) назад`;
        return `${Math.floor(diffInHours / 24)} дней назад`;
    };

    const statusTag = getStatusTag(announcement);
    const imageUrl = announcement.photos?.[0]?.url || '/images/mock/story-cat1.png';
    const cardClasses = `${styles.card} ${isSelected ? styles.selectedCard : ''}`;

    return (
        <div className={cardClasses} onClick={() => onClick && onClick(announcement)}>
            <div className={styles.imageContainer}>
                <img src={imageUrl} alt={announcement.pet_breed} className={styles.petImage} />
                {statusTag && (
                    <span className={`${styles.statusTag} ${statusTag.className}`}>
                        {statusTag.text}
                    </span>
                )}
            </div>

            <div className={styles.content}>
                <h4 className={styles.title}>Пропал(а) {announcement.pet_breed}, кличка "{announcement.pet_name}"</h4>
                <p className={styles.description}>{announcement.description}</p>
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}><MapPin className={styles.icon} /> <span>{announcement.location_address}</span></div>
                    <div className={styles.metaItem}><Clock className={styles.icon} /> <span>{formatTimeAgo(announcement.created_at)}</span></div>
                    <div className={`${styles.metaItem} ${styles.desktopOnly}`}><Palette className={styles.icon} /> <span>{announcement.color}</span></div>
                    <div className={`${styles.metaItem} ${styles.desktopOnly}`}><User className={styles.icon} /> <span>{announcement.user?.name || 'Неизвестно'}</span></div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementCard;