import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import QuickAdForm from '../components/home/QuickAdForm';
import UrgentSearch from '../components/home/UrgentSearch';
import HowItWorks from '../components/home/HowItWorks';
import OurFriends from '../components/home/OurFriends';
import SuccessStories from '../components/home/SuccessStories';

const HomePage = () => {
  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.content}>
          <h1>Потерялся друг? Поможем найти</h1>
          <p>Единая платформа поиска пропавших животных</p>
          <div className={styles.buttonGroup}>
            <Link to="/create-announcement" className={styles.ctaButton}>Пропал питомец</Link>
            <Link to="/create-announcement" className={styles.secondaryButton}>Сообщить о находке</Link>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <QuickAdForm />
      </div>

      <section className={styles.lightGraySection}>
        <div className={styles.container} style={{ margin: 0, padding: 0 }}>
          <UrgentSearch />
        </div>
      </section>

      <div className={styles.container}>
        <HowItWorks />
        <OurFriends />
      </div>

      <section className={styles.lightGraySection}>
        <div className={styles.container} style={{ margin: 0, padding: 0 }}>
          <SuccessStories />
        </div>
      </section>
    </>
  );
};

export default HomePage;