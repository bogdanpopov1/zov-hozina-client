import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.svg';
import { FiSearch } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';

const ownerLinks = [
  { path: '/create', label: 'Создать объявление' },
  { path: '/my-ads', label: 'Мои объявления' },
  { path: '/faq', label: 'Вопросы и ответы' },
  { path: '/tips', label: 'Полезные советы' },
  { path: '/stories', label: 'Счастливые истории' },
];

const volunteerLinks = [
  { path: '/about-volunteers', label: 'Кто такие волонтеры' },
  { path: '/memo', label: 'Памятка волонтера' },
  { path: '/templates', label: 'Шаблоны объявлений' },
  { path: '/rating', label: 'Рейтинг волонтеров' },
];

const Header = () => {
  // === Состояния для десктопных меню ===
  const [isOwnerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [isVolunteerMenuOpen, setVolunteerMenuOpen] = useState(false);
  const ownerTimeoutRef = useRef(null);
  const volunteerTimeoutRef = useRef(null);

  // === Состояние для поиска ===
  const [searchValue, setSearchValue] = useState('');

  // === Состояние для мобильного меню ===
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clearSearch = () => setSearchValue('');

  // --- Логика для ДЕСКТОПНЫХ выпадающих списков ---
  const handleOwnerMouseEnter = () => {
    clearTimeout(volunteerTimeoutRef.current);
    clearTimeout(ownerTimeoutRef.current);
    setVolunteerMenuOpen(false);
    setOwnerMenuOpen(true);
  };
  const handleOwnerMouseLeave = () => {
    ownerTimeoutRef.current = setTimeout(() => {
      setOwnerMenuOpen(false);
    }, 200);
  };
  const handleVolunteerMouseEnter = () => {
    clearTimeout(ownerTimeoutRef.current);
    clearTimeout(volunteerTimeoutRef.current);
    setOwnerMenuOpen(false);
    setVolunteerMenuOpen(true);
  };
  const handleVolunteerMouseLeave = () => {
    volunteerTimeoutRef.current = setTimeout(() => {
      setVolunteerMenuOpen(false);
    }, 200);
  };

  // --- Логика для МОБИЛЬНОГО меню ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
        <img src={logo} alt="Зов хозяина" />
      </Link>

      <div className={styles.desktopNav}>
        <nav className={styles.navLinks}>
          <div className={styles.dropdown} onMouseEnter={handleOwnerMouseEnter} onMouseLeave={handleOwnerMouseLeave}>
            <span className={styles.dropdownToggle}>
              Владельцам {isOwnerMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            {isOwnerMenuOpen && (
              <div className={styles.dropdownMenu}>
                {ownerLinks.map(link => <Link key={link.path} to={link.path}>{link.label}</Link>)}
              </div>
            )}
          </div>
          <div className={styles.dropdown} onMouseEnter={handleVolunteerMouseEnter} onMouseLeave={handleVolunteerMouseLeave}>
            <span className={styles.dropdownToggle}>
              Волонтерам {isVolunteerMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            {isVolunteerMenuOpen && (
              <div className={styles.dropdownMenu}>
                {volunteerLinks.map(link => <Link key={link.path} to={link.path}>{link.label}</Link>)}
              </div>
            )}
          </div>
          <NavLink to="/map" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>
            Карта поисков
          </NavLink>
        </nav>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по адресу, кличке..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button className={styles.clearButton} onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.desktopActions}>
        <button className={styles.loginButton}>Войти</button>
        <button className={styles.ctaButton}>Создать объявление</button>
        <Link to="/profile"><CgProfile className={styles.profileIcon} /></Link>
      </div>

      <div className={styles.mobileMenuToggle} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
      </div>


      {/* === МОБИЛЬНОЕ МЕНЮ === */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNavLinks}>
            <NavLink to="/map" onClick={closeMobileMenu}>Карта поисков</NavLink>
            <details className={styles.mobileDropdown}>
              <summary>Владельцам</summary>
              {ownerLinks.map(link => <Link key={link.path} to={link.path} onClick={closeMobileMenu}>{link.label}</Link>)}
            </details>
            <details className={styles.mobileDropdown}>
              <summary>Волонтерам</summary>
              {volunteerLinks.map(link => <Link key={link.path} to={link.path} onClick={closeMobileMenu}>{link.label}</Link>)}
            </details>
          </nav>
          <div className={styles.mobileActions}>
            <button className={styles.loginButton} onClick={closeMobileMenu}>Войти</button>
            <button className={styles.ctaButton} onClick={closeMobileMenu}>Создать объявление</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;