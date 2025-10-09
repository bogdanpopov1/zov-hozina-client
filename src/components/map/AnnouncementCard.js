import React from 'react';
import { MapPin, Clock, Palette, User } from 'lucide-react';
import styles from './AnnouncementCard.module.css';
import placeholderImage from '../../assets/stories/cat-illustration.svg'; // Заглушка

const AnnouncementCard = ({ announcement, onClick }) => {
    // ИСПРАВЛЕНО: Статус берем из поля is_featured, как на главной
    const getStatusTag = (isFeatured) => {
        if (isFeatured) {
            return { text: 'Срочный поиск', className: styles.urgentTag };
        }
        return { text: 'В поиске', className: styles.defaultTag };
    };

    // ИСПРАВЛЕНО: Данные о владельце приходят в поле `user`
    const getOwnerInfo = (user) => {
        if (!user) {
            return 'Владелец: Неизвестно';
        }
        // В будущем можно будет добавить проверку на тип пользователя (приют, волонтер)
        return `Владелец: ${user.name}`;
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Только что';
        } else if (diffInHours === 1) {
            return '1 час назад';
        } else if (diffInHours < 24) {
            return `${diffInHours} часов назад`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} дней назад`;
        }
    };

    const statusTag = getStatusTag(announcement.is_featured);
    // ДОБАВЛЕНО: Безопасное получение URL фото
    const imageUrl = announcement.photos && announcement.photos.length > 0 
        ? announcement.photos[0].path 
        : placeholderImage;

    return (
        <div className={styles.card} onClick={() => onClick && onClick(announcement)}>
            <div className={styles.imageContainer}>
                <img 
                    src={imageUrl} 
                    alt={announcement.pet_name}
                    className={styles.petImage}
                />
                <div className={`${styles.statusTag} ${statusTag.className}`}>
                    {statusTag.text}
                </div>
            </div>
            
            <div className={styles.content}>
                <h3 className={styles.title}>
                    Пропал(а) {announcement.pet_breed}, кличка "{announcement.pet_name}"
                </h3>
                
                <p className={styles.description}>
                    {announcement.description}
                </p>
                
                <div className={styles.metaInfo}>
                    <div className={styles.metaItem}>
                        <MapPin className={styles.icon} />
                        {/* ИСПРАВЛЕНО: Адрес в поле location_address */}
                        <span>{announcement.location_address}</span>
                    </div>
                    
                    <div className={styles.metaItem}>
                        <Clock className={styles.icon} />
                        {/* ИСПРАВЛЕНО: Дата создания в created_at */}
                        <span>{formatTimeAgo(announcement.created_at)}</span>
                    </div>
                    
                    <div className={styles.metaItem}>
                        <Palette className={styles.icon} />
                        <span>{announcement.color}</span>
                    </div>
                    
                    <div className={styles.metaItem}>
                        <User className={styles.icon} />
                        {/* ИСПРАВЛЕНО: Передаем `announcement.user` */}
                        <span>{getOwnerInfo(announcement.user)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementCard;