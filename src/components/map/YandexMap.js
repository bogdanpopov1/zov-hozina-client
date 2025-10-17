import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COLOR_DEFAULT = '#0095FF';
const COLOR_URGENT = '#FF0000';
const COLOR_SELECTED = '#FFD700';

const YandexMap = ({
    announcements,
    mapState,
    selectedId,
    onPlacemarkClick,
    ymaps // Получаем готовый API через props
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const navigate = useNavigate();

    // Эффект для инициализации карты (без изменений)
    useEffect(() => {
        if (!ymaps || !mapRef.current || mapInstanceRef.current) {
            return;
        }

        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
            center: mapState.center,
            zoom: mapState.zoom,
            controls: mapState.controls,
        });

        // Вся ваша логика для темной темы остается здесь без изменений
        mapRef.current.style.backgroundColor = '#1a1a1a';
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.1)';
                const style = document.createElement('style');
                style.id = 'yandex-map-dark-theme';
                style.textContent = `
                    /* Все ваши стили для темной темы */
                    .dark-map-container [class*="ymaps-"][class*="-balloon"] { filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important; /* ... */ }
                    /* ... и так далее для всех элементов */
                `;
                const existingStyle = document.getElementById('yandex-map-dark-theme');
                if (existingStyle) {
                    existingStyle.remove();
                }
                document.head.appendChild(style);
                mapRef.current.classList.add('dark-map-container');
            }
        }, 1000);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, [ymaps]);

    // Эффект для обновления центра, меток и т.д.
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !ymaps) {
            return;
        }

        map.setCenter(mapState.center, mapState.zoom, {
            duration: 300,
            checkZoomRange: true
        });

        map.geoObjects.removeAll();

        announcements.forEach(ad => {
            if (ad.latitude && ad.longitude) {
                const isSelected = selectedId === ad.announcement_id;
                let iconColor = isSelected ? COLOR_SELECTED : (ad.is_featured ? COLOR_URGENT : COLOR_DEFAULT);

                // --- ИЗМЕНЕНИЕ №1: УЛУЧШАЕМ КОНТЕНТ БАЛУНА, ДОБАВЛЯЯ ССЫЛКУ ---
                const balloonContent = `
                    <div style="font-family: 'Manrope', sans-serif; max-width: 250px; padding: 10px;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <img src="${ad.photos?.[0]?.url || '/placeholder-cat.svg'}" 
                                 alt="${ad.pet_name}" 
                                 style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">
                                    ${ad.pet_breed || ad.pet_type}, "${ad.pet_name}"
                                </h4>
                                <p style="margin: 0 0 12px 0; font-size: 14px; color: #ccc; line-height: 1.4;">
                                    ${ad.description ? ad.description.substring(0, 70) + '...' : 'Описание отсутствует'}
                                </p>
                            </div>
                        </div>
                        <a id="balloon-link-${ad.announcement_id}" href="/announcements/${ad.announcement_id}" 
                           style="display: block; text-align: center; margin-top: 12px; padding: 8px; background-color: #EBB000; color: #1A2536; border-radius: 6px; text-decoration: none; font-weight: 600;">
                            Подробнее
                        </a>
                    </div>
                `;

                const placemark = new ymaps.Placemark(
                    [parseFloat(ad.latitude), parseFloat(ad.longitude)],
                    {
                        // Передаем новый контент в балун
                        balloonContent: balloonContent
                    },
                    {
                        preset: 'islands#dotIcon',
                        iconColor: iconColor,
                        hideIconOnBalloonOpen: false // Важно, чтобы иконка не исчезала
                    }
                );

                // --- ИЗМЕНЕНИЕ №2: КЛИК ПО МЕТКЕ ТЕПЕРЬ ПРОСТО ВЫЗЫВАЕТ ONCLICK ---
                placemark.events.add('click', () => {
                    if (onPlacemarkClick) {
                        onPlacemarkClick(ad);
                    }
                });
                
                // --- ИЗМЕНЕНИЕ №3: АВТОМАТИЧЕСКИ ОТКРЫВАЕМ БАЛУН ДЛЯ ВЫБРАННОЙ МЕТКИ ---
                if (isSelected) {
                    // Используем setTimeout, чтобы балун открылся после возможного перемещения карты
                    setTimeout(() => {
                        if (placemark.balloon && !placemark.balloon.isOpen()) {
                            placemark.balloon.open();
                        }
                    }, 300);
                }

                // --- ИЗМЕНЕНИЕ №4: ПЕРЕХВАТЫВАЕМ КЛИК ПО ССЫЛКЕ ВНУТРИ БАЛУНА ---
                placemark.balloon.events.add('open', () => {
                    const link = document.getElementById(`balloon-link-${ad.announcement_id}`);
                    if (link) {
                        // Вешаем обработчик, который будет использовать React Router
                        link.addEventListener('click', (e) => {
                            e.preventDefault(); // Отменяем стандартный переход по href
                            navigate(`/announcements/${ad.announcement_id}`);
                        });
                    }
                });


                // Вся ваша логика для появления/исчезновения балуна при наведении остается без изменений
                let balloonTimeout = null;
                let isBalloonOpen = false;
                let isMouseOverPlacemark = false;
                let isMouseOverBalloon = false;

                // Обработчик наведения мыши на метку
                placemark.events.add('mouseenter', () => {
                    try {
                        isMouseOverPlacemark = true;
                        if (balloonTimeout) {
                            clearTimeout(balloonTimeout);
                            balloonTimeout = null;
                        }

                        balloonTimeout = setTimeout(() => {
                            if (!isBalloonOpen && isMouseOverPlacemark && placemark && placemark.balloon) {
                                placemark.balloon.open();
                                isBalloonOpen = true;
                            }
                        }, 200); // Задержка 200мс
                    } catch (error) {
                        console.error('Error handling mouseenter:', error);
                    }
                });

                // Обработчик увода мыши с метки
                placemark.events.add('mouseleave', () => {
                    try {
                        isMouseOverPlacemark = false;
                        if (balloonTimeout) {
                            clearTimeout(balloonTimeout);
                            balloonTimeout = null;
                        }

                        balloonTimeout = setTimeout(() => {
                            if (isBalloonOpen && !isMouseOverPlacemark && !isMouseOverBalloon && placemark && placemark.balloon) {
                                placemark.balloon.close();
                                isBalloonOpen = false;
                            }
                        }, 300); // Задержка 300мс
                    } catch (error) {
                        console.error('Error handling mouseleave:', error);
                    }
                });

                // Обработчики событий балуна
                try {
                    placemark.balloon.events.add('open', () => {
                        try {
                            isBalloonOpen = true;
                        } catch (error) {
                            console.error('Error in balloon open event:', error);
                        }
                    });

                    placemark.balloon.events.add('close', () => {
                        try {
                            isBalloonOpen = false;
                            isMouseOverBalloon = false;
                            if (balloonTimeout) {
                                clearTimeout(balloonTimeout);
                                balloonTimeout = null;
                            }
                        } catch (error) {
                            console.error('Error in balloon close event:', error);
                        }
                    });

                    // Обработчики наведения мыши на балун
                    placemark.balloon.events.add('mouseenter', () => {
                        try {
                            isMouseOverBalloon = true;
                            if (balloonTimeout) {
                                clearTimeout(balloonTimeout);
                                balloonTimeout = null;
                            }
                        } catch (error) {
                            console.error('Error in balloon mouseenter event:', error);
                        }
                    });

                    placemark.balloon.events.add('mouseleave', () => {
                        try {
                            isMouseOverBalloon = false;
                            if (balloonTimeout) {
                                clearTimeout(balloonTimeout);
                                balloonTimeout = null;
                            }

                            balloonTimeout = setTimeout(() => {
                                if (isBalloonOpen && !isMouseOverPlacemark && !isMouseOverBalloon && placemark && placemark.balloon) {
                                    placemark.balloon.close();
                                    isBalloonOpen = false;
                                }
                            }, 300);
                        } catch (error) {
                            console.error('Error in balloon mouseleave event:', error);
                        }
                    });
                } catch (error) {
                    console.error('Error setting up balloon events:', error);
                }

                map.geoObjects.add(placemark);
            }
        });

    }, [announcements, mapState, selectedId, onPlacemarkClick, ymaps, navigate]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default YandexMap;