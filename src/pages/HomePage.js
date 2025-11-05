import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import QuickAdForm from '../components/home/QuickAdForm';
import UrgentSearch from '../components/home/UrgentSearch';
import HowItWorks from '../components/home/HowItWorks';
import OurFriends from '../components/home/OurFriends';
import SuccessStories from '../components/home/SuccessStories';
import illustration from '../assets/stories/cat-illustration.svg';
import { useAnnouncement } from '../context/AnnouncementContext';

const HomePage = () => {
const navigate = useNavigate();
const { updateQuickForm, resetQuickForm } = useAnnouncement();

const handleLostPetClick = () => {
resetQuickForm();
updateQuickForm({ adType: 'lost' });
navigate('/create-announcement');
};

const handleReportFoundClick = () => {
resetQuickForm();
updateQuickForm({ adType: 'found' });
navigate('/create-announcement');
};

return (
<>
<section className={styles.heroSection}>
<div className={styles.content}>
<h1>Потерялся друг? Поможем найти</h1>
<p>Единая платформа для поиска животных</p>
<div className={styles.buttonGroup}>
<button onClick={handleLostPetClick} className={styles.ctaButton}>Пропал питомец</button>
<button onClick={handleReportFoundClick} className={styles.secondaryButton}>Сообщить о находке</button>
</div>
</div>
</section>
<main className={styles.mainContent}>
<div className={styles.container}>
<QuickAdForm />
</div>
<section className={styles.lightGraySection}>
<div className={styles.container}>
<UrgentSearch />
</div>
</section>
<div className={styles.container}>
<HowItWorks />
</div>
<div className={styles.darkContainer}>
<OurFriends />
</div>
<section className={styles.lightGraySection}>
<div className={styles.container}>
<div className={styles.storiesSectionWrapper}>
<img src={illustration} alt="" className={styles.sectionIllustration} />
<SuccessStories />
</div>
</div>
</section>
</main>
</>
);
};

export default HomePage;