import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AboutVolunteersPage.module.css';
import { Heart, MapPin, Bell, Users, CheckCircle, Search } from 'lucide-react';

const AboutVolunteersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleJoinClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            // В приложении используется AuthModal через Header, 
            // здесь мы просто перенаправим на главную или откроем профиль
            navigate('/profile');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.iconBadge}><Heart size={32} fill="var(--amber-yellow)" /></div>
                    <h1>Волонтеры «Зова хозяина»</h1>
                    <p>Сообщество неравнодушных людей, которые помогают питомцам вернуться домой.</p>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardItem}>
                            <Search className={styles.cardIcon} size={40} />
                            <h3>Глаза проекта</h3>
                        </div>
                        <p>Волонтеры — это те, кто внимательно смотрит по сторонам во время прогулок. Ваше наблюдение может стать решающим.</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardItem}>
                            <MapPin className={styles.cardIcon} size={40} />
                            <h3>Локализация</h3>
                        </div>
                        <p>Вы сами выбираете районы, в которых живете или часто бываете, чтобы получать уведомления только о важных для вас поисках.</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardItem}>
                            <Bell className={styles.cardIcon} size={40} />
                            <h3>Быстрый отклик</h3>
                        </div>
                        <p>Добавляйте записи в журнал поиска, прикрепляйте фото замеченных животных и мгновенно оповещайте владельцев.</p>
                    </div>
                </div>
            </section>

            <section className={styles.infoSection}>
                <div className={styles.infoContent}>
                    <h2>Как это работает?</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div>
                                <h4>Включите статус</h4>
                                <p>В личном профиле активируйте переключатель «Стать волонтером».</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div>
                                <h4>Настройте зоны</h4>
                                <p>Отметьте на карте районы, где вы готовы помогать. Мы пришлем уведомление, если там кто-то потеряется.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div>
                                <h4>Помогайте делом</h4>
                                <p>Увидели похожее животное? Сделайте фото и оставьте запись в журнале поиска прямо со смартфона.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className={styles.ctaCard}>
                    <h2>Готовы помочь?</h2>
                    <p>Ваше участие совершенно бесплатно и не требует много времени. Даже один внимательный взгляд может спасти жизнь.</p>
                    <button onClick={handleJoinClick} className={styles.ctaButton}>
                        {user?.is_volunteer ? 'Настроить зоны в профиле' : 'Стать волонтером'}
                    </button>
                </div>
            </section>

            <section className={styles.footerInfo}>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <Users size={24} />
                        <span>Более 500 активных волонтеров</span>
                    </div>
                    <div className={styles.statItem}>
                        <CheckCircle size={24} />
                        <span>Сотни успешных воссоединений</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutVolunteersPage;