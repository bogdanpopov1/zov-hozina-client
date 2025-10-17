import React from 'react';
import { MapPin, Clock, Palette, User } from 'lucide-react';
import styles from './AnnouncementCard.module.css';
import placeholderImage from '../../assets/stories/cat-illustration.svg';

const AnnouncementCard = ({ announcement, onClick, isSelected }) => {
    const getStatusTag = (isFeatured) => {
        // В будущем можно будет добавить больше статусов
        if (isFeatured) {
            return { text: 'Срочный поиск', className: styles.urgentTag };
        }
        // Можно добавить 'Важный поиск' и т.д.
        return { text: 'В поиске', className: styles.defaultTag };
    };

    const getOwnerInfo = (user) => {
        if (!user) return 'Владелец: Неизвестно';
        // В будущем можно добавить роли (Приют, Волонтер)
        return `Владелец: ${user.name}`;
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Только что';
        if (diffInHours < 24) return `${diffInHours} час(ов) назад`;
        return `${Math.floor(diffInHours / 24)} дней назад`;
    };

    const statusTag = getStatusTag(announcement.is_featured);
    const imageUrl = announcement.photos?.[0]?.url || placeholderImage;
    const cardClasses = `${styles.card} ${isSelected ? styles.selectedCard : ''}`;

    return (
        <div className={cardClasses} onClick={() => onClick && onClick(announcement)}>
            <div className={styles.imageContainer}>
                <img 
                    src={imageUrl} 
                    alt={announcement.pet_name}
                    className={styles.petImage}
                />
                {statusTag && (
                    <div className={`${styles.statusTag} ${statusTag.className}`}>
                        {statusTag.text}
                    </div>
                )}
            </div>
            
            <div className={styles.content}>
                <h3 className={styles.title}>
                    Пропал(а) {announcement.pet_breed}, кличка "{announcement.pet_name}"
                </h3>
                
                <p className={styles.description}>
                    {announcement.description}
                </p>
                
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <MapPin className={styles.icon} />
                        <span>{announcement.location_address}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Clock className={styles.icon} />
                        <span>{formatTimeAgo(announcement.created_at)}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Palette className={styles.icon} />
                        <span>{announcement.color}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <User className={styles.icon} />
                        <span>{getOwnerInfo(announcement.user)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementCard;