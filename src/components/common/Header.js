import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.svg';
import api from '../../api/axiosConfig';
import { CgProfile } from 'react-icons/cg';
import { ChevronDown, Menu, X, Search, Bell, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';
import useDebounce from '../../hooks/useDebounce';

const ownerLinks = [
    { path: '/create-announcement', label: 'Создать объявление' },
    { path: '/my-ads', label: 'Мои объявления' },
    // { path: '/faq', label: 'Вопросы и ответы' },
    // { path: '/tips', label: 'Полезные советы' },
    // { path: '/stories', label: 'Счастливые истории' },
];

const volunteerLinks = [
    { path: '/about-volunteers', label: 'Кто такие волонтеры' },
    // { path: '/memo', label: 'Памятка волонтера' },
    // { path: '/templates', label: 'Шаблоны объявлений' },
    // { path: '/rating', label: 'Рейтинг волонтеров' },
];

const NotificationBell = React.memo(({ notifications, isNotificationOpen, onToggle, onItemClick, isMobile }) => {

    const renderNotificationContent = (n) => {
        if (n.type === 'log') {
            return (
                <>
                    <span className={styles.userName}>{n.data.user_name}</span> оставил запись в журнале по объявлению <span className={styles.petName}>"{n.data.pet_name}"</span>
                </>
            );
        } else if (n.type === 'zone_alert') {
            return (
                <>
                    <span className={styles.alertIcon}>📍</span> В вашей зоне: <span className={styles.petName}>{n.data.pet_type} {n.data.pet_name || ''}</span> ({n.data.location_address})
                </>
            );
        }
        return <span>Новое уведомление</span>;
    };

    return (
        <div className={styles.notificationContainer}>
            <button onClick={onToggle} className={`${styles.notificationButton} ${isMobile ? styles.mobileNotificationButton : ''}`}>
                <Bell />
                {notifications.length > 0 && <span className={styles.notificationIndicator}></span>}
            </button>
            {isNotificationOpen && (
                <div className={styles.notificationDropdown}>
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`${styles.notificationItem} ${n.type === 'zone_alert' ? styles.zoneAlertItem : ''}`}
                                onMouseDown={() => onItemClick(n.real_id, n.data.announcement_id)}
                            >
                                {renderNotificationContent(n)}
                            </div>
                        ))
                    ) : (
                        <div className={styles.noNotifications}>Новых уведомлений нет</div>
                    )}
                </div>
            )}
        </div>
    );
});

const SearchBar = React.memo(({ searchValue, onSearchChange, onKeyDown, onClear, suggestions, isVisible, onSuggestionClick, isMobile }) => (
    <div className={isMobile ? styles.mobileSearch : styles.searchBar}>
        <Search className={styles.searchIcon} size={20} />
        <input
            type="text"
            placeholder={isMobile ? "Поиск..." : "Поиск по адресу, кличке, породе"}
            value={searchValue}
            onChange={onSearchChange}
            onKeyDown={onKeyDown}
            onFocus={onSearchChange}
        />
        {searchValue && (
            <button onClick={onClear} className={styles.clearButton}><X size={18} /></button>
        )}
        {isVisible && suggestions.length > 0 && (
            <div className={styles.suggestionsDropdown}>
                {suggestions.map(ad => (
                    <div key={ad.announcement_id} className={styles.suggestionItem} onMouseDown={() => onSuggestionClick(ad.announcement_id)}>
                        <img src={ad.photos?.[0]?.url || '/images/mock/story-cat1.png'} alt={ad.pet_name} className={styles.suggestionImage} />
                        <div className={styles.suggestionInfo}>
                            <span className={styles.suggestionTitle}>Пропал(а) {ad.pet_breed}, "{ad.pet_name}"</span>
                            <span className={styles.suggestionLocation}><MapPin size={12} /> {ad.location_address}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
));

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const searchRef = useRef(null);

    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const debouncedSearchValue = useDebounce(searchValue, 300);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search') || '';
        setSearchValue(searchQuery);
    }, [location.search]);

    useEffect(() => {
        if (debouncedSearchValue.length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const response = await api.get(`/api/announcements/search-suggestion?search=${debouncedSearchValue}`);
                    setSuggestions(response.data);
                    setSuggestionsVisible(true);
                } catch (error) {
                    console.error("Failed to fetch suggestions", error);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
            setSuggestionsVisible(false);
        }
    }, [debouncedSearchValue]);

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
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSuggestionsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(`/map?search=${encodeURIComponent(searchValue)}`);
            setSuggestionsVisible(false);
        }
    };

    const handleSuggestionClick = (announcementId) => {
        navigate(`/announcements/${announcementId}`);
        setSearchValue('');
        setSuggestionsVisible(false);
    };

    const handleNotificationItemClick = async (realId, announcementId) => {
        navigate(`/announcements/${announcementId}`);
        setNotificationOpen(false);

        try {
            await api.post(`/api/notifications/${realId}/read`);
            setNotifications(prev => prev.filter(n => n.real_id !== realId));
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
                        <div ref={searchRef}>
                            <SearchBar
                                searchValue={searchValue}
                                onSearchChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                onClear={() => setSearchValue('')}
                                suggestions={suggestions}
                                isVisible={isSuggestionsVisible}
                                onSuggestionClick={handleSuggestionClick}
                                isMobile={false}
                            />
                        </div>
                    </div>

                    <div className={styles.desktopActions}>
                        {user ? (
                            <>
                                <div ref={notificationRef}>
                                    <NotificationBell
                                        notifications={notifications}
                                        isNotificationOpen={isNotificationOpen}
                                        onToggle={() => setNotificationOpen(prev => !prev)}
                                        onItemClick={handleNotificationItemClick}
                                        isMobile={false}
                                    />
                                </div>
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
                        {user &&
                            <div ref={notificationRef}>
                                <NotificationBell
                                    notifications={notifications}
                                    isNotificationOpen={isNotificationOpen}
                                    onToggle={() => setNotificationOpen(prev => !prev)}
                                    onItemClick={handleNotificationItemClick}
                                    isMobile={true}
                                />
                            </div>
                        }
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
                        </div>
                        <div ref={searchRef}>
                            <SearchBar
                                searchValue={searchValue}
                                onSearchChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                onClear={() => setSearchValue('')}
                                suggestions={suggestions}
                                isVisible={isSuggestionsVisible}
                                onSuggestionClick={handleSuggestionClick}
                                isMobile={true}
                            />
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