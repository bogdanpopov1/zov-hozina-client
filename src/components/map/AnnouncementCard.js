import React from 'react';
import { MapPin, Clock, Palette, User } from 'lucide-react';
import styles from './AnnouncementCard.module.css';
import defaultIcon from '../../assets/icons/default.svg';

const AnnouncementCard = ({ announcement, onClick, isSelected }) => {
    const getStatusTag = (announcement) => {
        if (announcement.status === 'archived') {
            return { text: 'В архиве', className: styles.archivedTag };
        }

        if (announcement.announcement_type === 'found') {
            return { text: 'Питомец замечен', className: styles.foundTag };
        }

        const creationDate = new Date(announcement.created_at);
        const now = new Date();
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
        const isRecent = (now - creationDate) <= fiveDaysInMs;

        if (isRecent) {
            return { text: 'Срочный поиск', className: styles.urgentTag };
        }

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

    // НОВАЯ ЛОГИКА ФОРМИРОВАНИЯ ЗАГОЛОВКА
    const formatTitle = (ad) => {
        const type = (ad.pet_type || '').toLowerCase();
        const isFound = ad.announcement_type === 'found';
        const gender = ad.gender; // 'male', 'female', 'unknown'

        let action = '';
        let animal = ad.pet_type; // Значение по умолчанию

        // Логика для Собак
        if (type === 'собака') {
            if (gender === 'male') {
                animal = 'пёс';
                action = isFound ? 'Найден' : 'Пропал';
            } else {
                // female или unknown
                animal = 'собака';
                action = isFound ? 'Найдена' : 'Пропала';
            }
        }
        // Логика для Кошек
        else if (type === 'кошка') {
            if (gender === 'male') {
                animal = 'кот';
                action = isFound ? 'Найден' : 'Пропал';
            } else {
                // female или unknown
                animal = 'кошка';
                action = isFound ? 'Найдена' : 'Пропала';
            }
        }
        // Логика для остальных (Птица, Другое и т.д.)
        else {
            animal = ad.pet_type; // Оставляем как есть (например, "Птица")
            action = isFound ? 'Найден(а)' : 'Пропал(а)';
        }

        // Сборка строки
        // Если есть имя -> добавляем его
        const namePart = ad.pet_name ? ` ${ad.pet_name}` : '';

        // Если есть порода -> добавляем через запятую
        const breedPart = ad.pet_breed ? `, ${ad.pet_breed.toLowerCase()}` : '';

        return `${action} ${animal}${namePart}${breedPart}`;
    };

    const statusTag = getStatusTag(announcement);
    const title = formatTitle(announcement);
    const imageUrl = announcement.photos?.[0]?.url || defaultIcon;
    const cardClasses = `${styles.card} ${isSelected ? styles.selectedCard : ''}`;

    return (
        <div className={cardClasses} onClick={() => onClick && onClick(announcement)}>
            <div className={styles.imageContainer}>
                <img
                    src={imageUrl}
                    alt={announcement.pet_breed}
                    className={`${styles.petImage} ${!announcement.photos || announcement.photos.length === 0 ? styles.defaultPetImage : ''}`}
                />
                {statusTag && (
                    <span className={`${styles.statusTag} ${statusTag.className}`}>
                        {statusTag.text}
                    </span>
                )}
            </div>
            <div className={styles.content}>
                <h4 className={styles.title}>{title}</h4>
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