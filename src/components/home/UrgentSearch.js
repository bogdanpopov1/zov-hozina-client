import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './UrgentSearch.module.css';
import { MapPin, CheckCircle2, Clock } from 'lucide-react';
import placeholderImage from '../../assets/stories/cat-illustration.svg';

const UrgentSearchCard = ({ ad }) => {
    const imageUrl = ad.photos && ad.photos.length > 0 ? ad.photos[0].path : placeholderImage; 

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={imageUrl} alt={`Фото ${ad.pet_breed}`} />
            </div>
            <div className={styles.infoBar}>
                <div className={styles.infoItem}>
                    <MapPin size={16} />
                    {/* Предполагаем, что город можно будет взять из данных в будущем */}
                    <span>{ad.location_address.split(',').pop().trim()}</span>
                </div>
                <div className={styles.infoItem}>
                    <CheckCircle2 size={16} />
                    {/* Статус теперь тоже приходит из данных */}
                    <span>{ad.status === 'active' ? 'В поиске' : 'Найден'}</span>
                </div>
            </div>
            <div className={styles.cardContent}>
                <h3 className={styles.title}>
                    Пропал {ad.pet_breed}, {ad.location_address}
                </h3>
                <p className={styles.updateInfo}>
                    <Clock size={16} />
                    {/* Форматируем дату из API */}
                    <span>Информация обновлена {new Date(ad.updated_at).toLocaleDateString()}</span>
                </p>
                <button className={styles.searchButton}>Начать поиск</button>
            </div>
        </div>
    );
};


const UrgentSearch = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUrgentAds = async () => {
            try {
                // Убедитесь, что URL в .env правильный
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements/urgent`);
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные с сервера');
                }
                const data = await response.json();
                setAds(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUrgentAds();
    }, []);

    if (loading) return <div className={styles.stateMessage}>Загрузка срочных объявлений...</div>;
    if (error) return <div className={styles.stateMessage}>Ошибка: {error}</div>;

    return (
        <section className={styles.urgentSearchSection}>
            <h2 className={styles.sectionTitle}>Срочный поиск</h2>
            <div className={styles.grid}>
                {ads.map(ad => <UrgentSearchCard key={ad.announcement_id} ad={ad} />)}
            </div>
            <div className={styles.actions}>
                <Link to="/map" className={styles.showMoreButton}>Открыть карту поисков</Link>
            </div>
        </section>
    );
};

export default UrgentSearch;