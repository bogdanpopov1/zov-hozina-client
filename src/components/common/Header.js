import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.svg';
import api from '../../api/axiosConfig';
import { CgProfile } from 'react-icons/cg';
import { ChevronDown, Menu, X, Search, Bell } from 'lucide-react';
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
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (user) {
            const fetchNotifications = async () => {
                try {
                    const response = await api.get('/api/notifications');
                    setNotifications(response.data);
                } catch (error) {
                    console.error("Failed to fetch notifications", error);
                }
            };
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationItemClick = async (logId, announcementId) => {
        navigate(`/announcements/${announcementId}`);
        setNotificationOpen(false);

        try {
            await api.post(`/api/notifications/${logId}/read`);
            setNotifications(prev => prev.filter(n => n.log_id !== logId));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

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

    const NotificationBell = ({ isMobile = false }) => (
        <div className={styles.notificationContainer} ref={notificationRef}>
            <button onClick={() => setNotificationOpen(prev => !prev)} className={`${styles.notificationButton} ${isMobile ? styles.mobileNotificationButton : ''}`}>
                <Bell />
                {notifications.length > 0 && <span className={styles.notificationIndicator}></span>}
            </button>
            {isNotificationOpen && (
                <div className={styles.notificationDropdown}>
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div
                                key={n.log_id}
                                className={styles.notificationItem}
                                onMouseDown={() => handleNotificationItemClick(n.log_id, n.announcement_id)}
                            >
                                <span className={styles.userName}>{n.user.name}</span> оставил запись в журнале по объявлению <span className={styles.petName}>"{n.announcement.pet_name}"</span>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noNotifications}>Новых уведомлений нет</div>
                    )}
                </div>
            )}
        </div>
    );

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
                                <NotificationBell />
                                <Link to="/profile" className={styles.profileIcon}><CgProfile /></Link>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLoginClick} className={styles.loginButton}>Войти</button>
                                <button onClick={() => { if (user) navigate('/create-announcement'); else setIsModalOpen(true); }} className={styles.ctaButton}>Стать волонтером</button>
                            </>
                        )}
                    </div>

                    <div className={styles.mobileHeaderActions}>
                        {user && <NotificationBell isMobile={true} />}
                        <button className={styles.mobileMenuToggle} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                </div>
                {isMobileMenuOpen && (
                    <div className={styles.mobileMenu}>
                        <div className={styles.mobileMenuHeader}>
                            <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
                                <img src={logo} alt="Зов Хозяина" />
                            </Link>
                            <button className={styles.mobileMenuToggle} onClick={closeMobileMenu}><X /></button>
                        </div>
                        <div className={styles.mobileSearch}>
                            <Search className={styles.searchIcon} size={20} />
                            <input type="text" placeholder="Поиск..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                            {searchValue && (
                                <button onClick={() => setSearchValue('')} className={styles.clearButton}><X size={18} /></button>
                            )}
                        </div>
                        <nav className={styles.mobileNavLinks}>
                            <Link to="/" onClick={closeMobileMenu}>Главная</Link>
                            <Link to="/map" onClick={closeMobileMenu}>Карта поисков</Link>
                            <details className={styles.mobileDropdown}>
                                <summary>Владельцам</summary>
                                <div className={styles.mobileDropdownContent}>
                                    {ownerLinks.map(link => <Link key={link.path} to={link.path} onClick={closeMobileMenu}>{link.label}</Link>)}
                                </div>
                            </details>
                            <details className={styles.mobileDropdown}>
                                <summary>Волонтерам</summary>
                                <div className={styles.mobileDropdownContent}>
                                    {volunteerLinks.map(link => <Link key={link.path} to={link.path} onClick={closeMobileMenu}>{link.label}</Link>)}
                                </div>
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