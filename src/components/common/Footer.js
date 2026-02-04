import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../../assets/logo.svg';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Footer = () => {
    const [isOwnersMenuOpen, setIsOwnersMenuOpen] = useState(false);
    const [isVolunteersMenuOpen, setIsVolunteersMenuOpen] = useState(false);

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.desktopFooter}>
                    <div className={styles.mainContent}>
                        <div className={styles.brandColumn}>
                            <Link to="/" className={styles.logo}><img src={logo} alt="Зов Хозяина" /></Link>
                            <p>Объединяем тех, кто ищет,<br />с теми, кто хочет помочь.</p>
                        </div>
                        <div className={styles.linksColumn}>
                            <h4>Помощь владельцам</h4>
                            <Link to="/create-announcement">Создать объявление</Link>
                            <Link to="/my-ads">Мои объявления</Link>
                            {/* <Link to="/tips">Полезные советы</Link>
                            <Link to="/stories">Счастливые истории</Link> */}
                        </div>
                        <div className={styles.linksColumn}>
                            <h4>Участие волонтерам</h4>
                            <Link to="/about-volunteers">Кто такие волонтеры</Link>
                            {/* <Link to="/memo">Памятка волонтера</Link>
                            <Link to="/templates">Шаблоны объявлений</Link>
                            <Link to="/rating">Рейтинг волонтеров</Link> */}
                        </div>
                        <div className={styles.ctaColumn}>
                            <Link to="/map" className={styles.mapButton}>Карта поисков</Link>
                            {/* <a href="https://t.me/ZovHozinaBot" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
                                <span>Подпишитесь на наш</span>
                                <span className={styles.telegramBotLine}> телеграм-бот <FaTelegramPlane /> </span>
                            </a> */}
                        </div>
                    </div>
                </div>
                <div className={styles.mobileFooter}>
                    <details className={styles.mobileDropdown}>
                        <summary onClick={() => setIsOwnersMenuOpen(!isOwnersMenuOpen)}>
                            Владельцам {isOwnersMenuOpen ? <ChevronUp /> : <ChevronDown />}
                        </summary>
                        <div className={styles.dropdownMenu}>
                            <Link to="/create-announcement">Создать объявление</Link>
                            <Link to="/my-ads">Мои объявления</Link>
                            {/* <Link to="/tips">Полезные советы</Link>
                            <Link to="/stories">Счастливые истории</Link> */}
                        </div>
                    </details>
                    <details className={styles.mobileDropdown}>
                        <summary onClick={() => setIsVolunteersMenuOpen(!isVolunteersMenuOpen)}>
                            Волонтерам {isVolunteersMenuOpen ? <ChevronUp /> : <ChevronDown />}
                        </summary>
                        <div className={styles.dropdownMenu}>
                            <Link to="/about-volunteers">Кто такие волонтеры</Link>
                            {/* <Link to="/memo">Памятка волонтера</Link>
                            <Link to="/templates">Шаблоны объявлений</Link>
                            <Link to="/rating">Рейтинг волонтеров</Link> */}
                        </div>
                    </details>
                    <div className={styles.mobileActions}>
                        <Link to="/map" className={styles.mapButton}>Карта поисков</Link>
                        {/* <a href="https://t.me/ZovHozinaBot" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
                            <span>Подпишитесь на наш</span>
                            <span className={styles.telegramBotLine}> телеграм-бот <FaTelegramPlane /> </span>
                        </a> */}
                    </div>
                </div>
                <div className={styles.bottomBar}>
                    <p>© {new Date().getFullYear()} «Зов хозяина». Все права защищены.</p>
                    <Link to="/privacy">Политика конфиденциальности</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;