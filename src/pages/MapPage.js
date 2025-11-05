import React, { useState, useEffect, useRef, useCallback } from 'react';
import AnnouncementCard from '../components/map/AnnouncementCard';
import YandexMap from '../components/map/YandexMap';
import FilterPanel from '../components/map/FilterPanel';
import styles from './MapPage.module.css';
import api from '../api/axiosConfig';
import { ChevronDown, Search, X } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const defaultFilters = {
    location: '',
    pet_type_slug: '',
    announcement_type: '',
    time_period: '',
    date_from: '',
    date_to: '',
    actual: true,
    latitude: null,
    longitude: null,
};

const PANEL_STATES = {
    HIDDEN: 'hidden',
    PEEKING: 'peeking',
    EXPANDED: 'expanded',
};

const MapPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [mapState, setMapState] = useState({ center: [49.106414, 55.796127], zoom: 12 });
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState('announcements');
    const [filters, setFilters] = useState(defaultFilters);
    const [sortBy, setSortBy] = useState('default');
    const [panelState, setPanelState] = useState(PANEL_STATES.PEEKING);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 400);
    const listRef = useRef(null);

    const fetchAnnouncements = useCallback(async (currentFilters, currentSortBy, search) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            const apiFilters = { ...currentFilters };
            delete apiFilters.latitude;
            delete apiFilters.longitude;

            Object.entries(apiFilters).forEach(([key, value]) => {
                if (value || (key === 'actual' && value === false)) {
                    params.append(key, value.toString());
                }
            });

            if (search) {
                params.append('search', search);
            }

            params.append('sort_by', currentSortBy);

            const response = await api.get(`/api/announcements`, { params });
            const responseData = response.data;
            const announcementsArray = responseData.data || responseData;

            setAnnouncements(Array.isArray(announcementsArray) ? announcementsArray : []);
            setTotalCount(responseData.total || announcementsArray.length);
        } catch (err) {
            setError(err);
            setAnnouncements([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements(filters, sortBy, debouncedSearchTerm);
    }, [fetchAnnouncements, filters, sortBy, debouncedSearchTerm]);

    useEffect(() => {
        if (!selectedId || !listRef.current) return;
        const selectedCard = listRef.current.querySelector(`[data-id="${selectedId}"]`);
        if (selectedCard) {
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedId]);

    const handleSelection = useCallback((announcement) => {
        setSelectedId(announcement.announcement_id);
        if (announcement.latitude && announcement.longitude) {
            setMapState(prev => ({
                ...prev,
                center: [parseFloat(announcement.longitude), parseFloat(announcement.latitude)],
                zoom: 15
            }));
        }
    }, []);

    const handleBalloonClose = useCallback(() => {
        setSelectedId(null);
    }, []);

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setActiveTab('announcements');
        if (newFilters.latitude && newFilters.longitude) {
            setMapState({
                center: [parseFloat(newFilters.longitude), parseFloat(newFilters.latitude)],
                zoom: 12
            });
        }
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setSortBy('default');
        setSearchTerm('');
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handlePanelToggle = () => {
        setPanelState(prev => (prev === PANEL_STATES.EXPANDED ? PANEL_STATES.PEEKING : PANEL_STATES.EXPANDED));
    };

    const showPanel = () => {
        if (panelState === PANEL_STATES.HIDDEN) {
            setPanelState(PANEL_STATES.PEEKING);
        }
    };

    const renderContent = () => {
        if (activeTab === 'filters') {
            return <FilterPanel initialFilters={filters} onApply={handleApplyFilters} onReset={handleResetFilters} />;
        }

        if (loading) {
            return <div className={styles.statusMessage}>Загрузка объявлений...</div>;
        }

        if (error) {
            return <div className={`${styles.statusMessage} ${styles.error}`}>Ошибка загрузки: {error.message}</div>;
        }

        if (announcements.length === 0) {
            return <div className={styles.statusMessage}>Объявления не найдены. Попробуйте изменить фильтры.</div>;
        }

        return (
            <div ref={listRef} className={styles.announcementsList}>
                {announcements.map((announcement) => (
                    <div key={announcement.announcement_id} data-id={announcement.announcement_id}>
                        <AnnouncementCard
                            announcement={announcement}
                            onClick={handleSelection}
                            isSelected={selectedId === announcement.announcement_id}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const pageClasses = `${styles.mapPage} ${styles[panelState]}`;

    return (
        <div className={pageClasses}>
            <div className={styles.leftPanel}>
                <div className={styles.panelHandle} onClick={handlePanelToggle}>
                    <div className={styles.handleBar}></div>
                </div>
                <div className={styles.panelHeader}>
                    <div className={styles.tabs}>
                        <button onClick={() => setActiveTab('announcements')} className={activeTab === 'announcements' ? styles.tab + ' ' + styles.active : styles.tab}>Объявления</button>
                        <button onClick={() => setActiveTab('filters')} className={activeTab === 'filters' ? styles.tab + ' ' + styles.active : styles.tab}>Фильтры</button>
                    </div>
                    {activeTab === 'announcements' && (
                        <>
                            <div className={styles.panelSearch}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Поиск по кличке, породе..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && <button onClick={() => setSearchTerm('')} className={styles.clearButton}><X size={16} /></button>}
                            </div>
                            <div className={styles.headerInfo}>
                                <span className={styles.count}>Найдено {totalCount} объявлений</span>
                                <select value={sortBy} onChange={handleSortChange} className={styles.sortDropdown}>
                                    <option value="default">Сначала важные</option>
                                    <option value="newest">Сначала новые</option>
                                    <option value="oldest">Сначала старые</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
                {renderContent()}
            </div>
            <div className={styles.rightPanel} onClick={showPanel}>
                <YandexMap
                    announcements={announcements}
                    mapState={mapState}
                    selectedId={selectedId}
                    onPlacemarkClick={handleSelection}
                    onBalloonClose={handleBalloonClose}
                />
                <button className={styles.hidePanelButton} onClick={(e) => { e.stopPropagation(); setPanelState(PANEL_STATES.HIDDEN); }}>
                    <ChevronDown />
                </button>
            </div>
        </div>
    );
};

export default MapPage;