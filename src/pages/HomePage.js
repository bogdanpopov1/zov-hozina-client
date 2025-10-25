import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import QuickAdForm from '../components/home/QuickAdForm';
import UrgentSearch from '../components/home/UrgentSearch';
import HowItWorks from '../components/home/HowItWorks';
import OurFriends from '../components/home/OurFriends';
import SuccessStories from '../components/home/SuccessStories';
import illustration from '../assets/stories/cat-illustration.svg'; // Импортируем картинку здесь

const HomePage = () => {
    return (
        <>
            <section className={styles.heroSection}>
                <div className={styles.content}>
                    <h1>Потерялся друг? Поможем найти</h1>
                    <p>Единая платформа для поиска животных</p>
                    <div className={styles.buttonGroup}>
                        <Link to="/create-announcement" className={styles.ctaButton}>Пропал питомец</Link>
                        <Link to="/create-announcement" className={styles.secondaryButton}>Сообщить о находке</Link>
                    </div>
                </div>
            </section>

            <div className={styles.mainContent}>
                <div className={styles.darkContainer}>
                     <QuickAdForm />
                </div>

                <section className={styles.lightGraySection}>
                    <div className={styles.container}>
                        <UrgentSearch />
                    </div>
                </section>

                <div className={styles.darkContainer}>
                    <HowItWorks />
                    <OurFriends />
                </div>

                <section className={`${styles.lightGraySection} ${styles.storiesSectionWrapper}`}>
                     <img src={illustration} alt="" className={styles.sectionIllustration} />
                     <div className={styles.container}>
                        <SuccessStories />
                    </div>
                </section>
            </div>
        </>
    );
};

export default HomePage;