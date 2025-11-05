import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UrgentSearch.module.css';
import { MapPin, CheckCircle2, Clock } from 'lucide-react';
import defaultIcon from '../../assets/icons/default.svg';

const UrgentSearchCard = ({ ad }) => {
const navigate = useNavigate();
const imageUrl = ad.photos && ad.photos.length > 0 ? ad.photos[0].url : defaultIcon;
const title = `Пропал ${ad.pet_breed}, ${ad.location_address}`;

return (
<div className={styles.card} onClick={() => navigate(`/announcements/${ad.announcement_id}`)}>
<div className={styles.imageContainer}>
<img src={imageUrl} alt={`Фото ${ad.pet_breed}`} className={!ad.photos || ad.photos.length === 0 ? styles.defaultPetImage : ''} />
</div>
<div className={styles.infoBar}>
<div className={styles.infoItem}>
<MapPin size={16} /> {ad.location_address.split(',')[0]}
</div>
<div className={styles.infoItem}>
{ad.status === 'active' ? <><CheckCircle2 size={16} /> В поиске</> : 'Найден'}
</div>
</div>
<div className={styles.cardContent}>
<h4 className={styles.title}>{title}</h4>
</div>
<div className={styles.updateInfo}>
<Clock size={16} /> <span>Информация обновлена {new Date(ad.updated_at).toLocaleDateString('ru-RU')}</span>
</div>
<button className={styles.searchButton}>Начать поиск</button>
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
<div className={styles.urgentSearchSection}>
<h2 className={styles.sectionTitle}>Срочный поиск</h2>
<div className={styles.grid}>
{ads.map(ad => <UrgentSearchCard key={ad.announcement_id} ad={ad} />)}
</div>
<div className={styles.actions}>
<button className={styles.showMoreButton}>Открыть карту поисков</button>
</div>
</div>
);
};

export default UrgentSearch;