import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.svg';
import { CgProfile } from 'react-icons/cg';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';

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
    const [isOwnerMenuOpen, setOwnerMenuOpen] = useState(false);
    const [isVolunteerMenuOpen, setVolunteerMenuOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const ownerTimeoutRef = useRef(null);
    const volunteerTimeoutRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const { user } = useAuth();

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

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setMobileMenuOpen(false);
    const handleLoginClick = () => {
        setIsModalOpen(true);
        closeMobileMenu();
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.logo}>
                        <img src={logo} alt="Зов Хозяина" />
                    </Link>

                    <div className={styles.centerNav}>
                        <nav className={styles.navLinks}>
                            <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>
                                Главная
                            </NavLink>
                            <div className={styles.dropdown} onMouseEnter={handleOwnerMouseEnter} onMouseLeave={handleOwnerMouseLeave}>
                                <span className={styles.dropdownToggle}>Владельцам <ChevronDown size={18} /></span>
                                {isOwnerMenuOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {ownerLinks.map(link => <Link key={link.path} to={link.path}>{link.label}</Link>)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.dropdown} onMouseEnter={handleVolunteerMouseEnter} onMouseLeave={handleVolunteerMouseLeave}>
                                <span className={styles.dropdownToggle}>Волонтерам <ChevronDown size={18} /></span>
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
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Поиск по адресу, кличке, породе"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            {searchValue && (
                                <button onClick={() => setSearchValue('')} className={styles.clearButton}><X size={18} /></button>
                            )}
                        </div>
                    </div>

                    <div className={styles.desktopActions}>
                        {user ? (
                            <>
                                <button onClick={() => navigate('/create-announcement')} className={styles.ctaButton}>Создать объявление</button>
                                <Link to="/profile" className={styles.profileIcon}><CgProfile /></Link>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLoginClick} className={styles.loginButton}>Войти</button>
                                <button onClick={() => { if(user) navigate('/create-announcement'); else setIsModalOpen(true); }} className={styles.ctaButton}>Стать волонтером</button>
                            </>
                        )}
                    </div>

                    <button className={styles.mobileMenuToggle} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <nav className={styles.mobileNavLinks}>
                             <Link to="/" onClick={closeMobileMenu}>Главная</Link>
                             <Link to="/map" onClick={closeMobileMenu}>Карта поисков</Link>
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
                                <Link to="/profile" onClick={closeMobileMenu} className={styles.loginButton}>Мой профиль</Link>
                            ) : (
                                <button onClick={handleLoginClick} className={styles.loginButton}>Войти</button>
                            )}
                             <button onClick={() => { navigate('/create-announcement'); closeMobileMenu(); }} className={styles.ctaButton}>Создать объявление</button>
                        </div>
                    </div>
                )}
            </header>
            {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default Header;