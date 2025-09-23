import React from 'react';
import styles from './OurFriends.module.css';

import veterinary from '../../assets/partners/veterinary.png';
import mbet from '../../assets/partners/mbet.png';
import happyCat from '../../assets/partners/happy-cat.png';
import animalia from '../../assets/partners/animalia.png';
import barr from '../../assets/partners/barr.png';
import panda from '../../assets/partners/panda.png';
import tombet from '../../assets/partners/tombet.png';
import alpha from '../../assets/partners/alpha.png';

const friendsData = [
    { logo: veterinary, name: 'Veterinary' },
    { logo: mbet, name: 'МВЕТ' },
    { logo: happyCat, name: 'Happy Cat' },
    { logo: animalia, name: 'Animalia' },
    { logo: barr, name: 'Barr Skyline' },
    { logo: panda, name: 'Панда' },
    { logo: tombet, name: 'Томвет' },
    { logo: alpha, name: 'Альфа Вет' },
];

const OurFriends = () => {
    // Дублируем массив для создания эффекта бесконечной прокрутки
    const extendedFriends = [...friendsData, ...friendsData];

    return (
        <section className={styles.friendsSection}>
            <h2 className={styles.title}>Наши друзья</h2>
            <div className={styles.logosContainer}>
                <div className={styles.logosSlider}>
                    {extendedFriends.map((friend, index) => (
                        <div key={index} className={styles.logoCard}>
                            <img src={friend.logo} alt={friend.name} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurFriends;