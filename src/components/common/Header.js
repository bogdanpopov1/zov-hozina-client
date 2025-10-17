import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.svg';
import { FiSearch } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Импортируем наш хук
import AuthModal from './AuthModal'; // Импортируем модальное окно

const ownerLinks = [
    { path: '/create-announcement', label: 'Создать объявление' },
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
    const navigate = useNavigate(); 

    // === Состояния для меню и поиска ===
    const [isOwnerMenuOpen, setOwnerMenuOpen] = useState(false);
    const [isVolunteerMenuOpen, setVolunteerMenuOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const ownerTimeoutRef = useRef(null);
    const volunteerTimeoutRef = useRef(null);

    // === Состояния для аутентификации ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, logout } = useAuth();

    const clearSearch = () => setSearchValue('');

    // --- Логика для ДЕСКТОПНЫХ выпадающих списков ---
    const handleOwnerMouseEnter = () => {
        clearTimeout(volunteerTimeoutRef.current);
        clearTimeout(ownerTimeoutRef.current);
        setVolunteerMenuOpen(false);
        setOwnerMenuOpen(true);
    };
    const handleOwnerMouseLeave = () => {
        ownerTimeoutRef.current = setTimeout(() => setOwnerMenuOpen(false), 200);
    };
    const handleVolunteerMouseEnter = () => {
        clearTimeout(ownerTimeoutRef.current);
        clearTimeout(volunteerTimeoutRef.current);
        setOwnerMenuOpen(false);
        setVolunteerMenuOpen(true);
    };
    const handleVolunteerMouseLeave = () => {
        volunteerTimeoutRef.current = setTimeout(() => setVolunteerMenuOpen(false), 200);
    };

    // --- Логика для МОБИЛЬНОГО меню ---
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // --- Обработчики для кнопок ---
    const handleLoginClick = () => {
        setIsModalOpen(true);
        closeMobileMenu();
    };

    const handleLogoutClick = () => {
        logout();
        closeMobileMenu();
    };

    return (
        <>
            <header className={styles.header}>
                <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
                    <img src={logo} alt="Зов хозяина" />
                </Link>

                {/* === ДЕСКТОПНАЯ НАВИГАЦИЯ === */}
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
                        <input type="text" placeholder="Поиск по адресу, кличке..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                        {searchValue && <button className={styles.clearButton} onClick={clearSearch}><X size={16} /></button>}
                    </div>
                </div>

                {/* === ДЕСКТОПНЫЕ КНОПКИ (с логикой входа) === */}
                <div className={styles.desktopActions}>
                    {user ? (
                        <>
                            <button onClick={handleLogoutClick} className={styles.loginButton}>Выйти</button>
                            <Link to="/profile" className={styles.profileLink}>
                                <CgProfile className={styles.profileIcon} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <button onClick={handleLoginClick} className={styles.loginButton}>Войти</button>
                            <button onClick={() => navigate('/create-announcement')} className={styles.ctaButton}>Создать объявление</button>
                        </>
                    )}
                </div>

                {/* === КНОПКА МОБИЛЬНОГО МЕНЮ === */}
                <div className={styles.mobileMenuToggle} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </div>

                {/* === МОБИЛЬНОЕ МЕНЮ (с логикой входа) === */}
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
                            {user ? (
                                <>
                                    <Link to="/profile" className={styles.ctaButton} onClick={closeMobileMenu}>Мой профиль</Link>
                                    <button className={styles.loginButton} onClick={handleLogoutClick}>Выйти</button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.loginButton} onClick={handleLoginClick}>Войти</button>
                                    <button className={styles.ctaButton} onClick={handleLoginClick}>Создать объявление</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* === МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ === */}
            {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default Header;