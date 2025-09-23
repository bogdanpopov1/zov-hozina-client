import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../../assets/logo.svg';
import { FaTelegramPlane } from 'react-icons/fa';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Footer = () => {
  const [isOwnersMenuOpen, setIsOwnersMenuOpen] = useState(false);
  const [isVolunteersMenuOpen, setIsVolunteersMenuOpen] = useState(false);

  return (
    <footer className={styles.footer}>
      {/* === ДЕСКТОПНАЯ ВЕРСИЯ === */}
      <div className={styles.desktopFooter}>
        <div className={styles.mainContent}>
          <div className={styles.brandColumn}>
            <Link to="/"><img src={logo} alt="Зов хозяина" className={styles.logo} /></Link>
            <p>Объединяем тех, кто ищет,<br />с теми, кто хочет помочь.</p>
          </div>
          <div className={styles.linksColumn}>
            <h4>Владельцам</h4>
            <Link to="/create">Создать объявление</Link>
            <Link to="/my-ads">Мои объявления</Link>
            <Link to="/safety">Полезные советы</Link>
            <Link to="/stories">Счастливые истории</Link>
          </div>
          <div className={styles.linksColumn}>
            <h4>Волонтерам</h4>
            <Link to="/about-volunteers">Кто такие волонтеры</Link>
            <Link to="/memo">Памятка волонтера</Link>
            <Link to="/templates">Шаблоны объявлений</Link>
            <Link to="/rating">Рейтинг волонтеров</Link>
          </div>
          <div className={styles.ctaColumn}>
            <Link to="/map" className={styles.mapButton}>Карта поисков</Link>
            <p>Подпишитесь на наш <a href="https://t.me/your_bot_name" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
              телеграм-бот <FaTelegramPlane />
            </a></p>
          </div>
        </div>
      </div>

      {/* === МОБИЛЬНАЯ ВЕРСИЯ === */}
      <div className={styles.mobileFooter}>
        <div className={styles.dropdownRow}>
          <button className={styles.dropdownToggle} onClick={() => setIsOwnersMenuOpen(!isOwnersMenuOpen)}>
            Владельцам {isOwnersMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {isOwnersMenuOpen && (
            <div className={styles.dropdownMenu}>
              <Link to="/create">Создать объявление</Link>
              <Link to="/my-ads">Мои объявления</Link>
              <Link to="/safety">Полезные советы</Link>
              <Link to="/stories">Счастливые истории</Link>
            </div>
          )}
        </div>
        <div className={styles.dropdownRow}>
          <button className={styles.dropdownToggle} onClick={() => setIsVolunteersMenuOpen(!isVolunteersMenuOpen)}>
            Волонтерам {isVolunteersMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {isVolunteersMenuOpen && (
            <div className={styles.dropdownMenu}>
              <Link to="/about-volunteers">Кто такие волонтеры</Link>
              <Link to="/memo">Памятка волонтера</Link>
              <Link to="/templates">Шаблоны объявлений</Link>
              <Link to="/rating">Рейтинг волонтеров</Link>
            </div>
          )}
        </div>
        <div className={styles.mobileActions}>
          <Link to="/map" className={styles.mapButton}>Карта поисков</Link>
          <p>Наш <a href="https://t.me/your_bot_name" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
            телеграм-бот <FaTelegramPlane />
          </a></p>
        </div>
      </div>

      {/* Нижняя панель */}
      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} «Зов хозяина».</p>
        <Link to="/privacy">Политика конфиденциальности</Link>
      </div>
    </footer>
  );
};

export default Footer;