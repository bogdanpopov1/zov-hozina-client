import React from 'react';
import styles from './HowItWorks.module.css';
import mapIcon from '../../assets/features/feature-map.svg';
import communityIcon from '../../assets/features/feature-community.svg';
import notificationIcon from '../../assets/features/feature-notification.svg';

const featuresData = [
  { icon: mapIcon, title: 'Живая карта поиска', description: 'Это не просто карта с объявлениями. Владельцы видят волонтеров, которые ищут прямо сейчас. Волонтеры видят метки с новыми наблюдениями и могут координировать свои действия, чтобы не проверять одни и те же места дважды.' },
  { icon: communityIcon, title: 'Сила сообщества', description: 'Вы не один на один с бедой. Платформа объединяет неравнодушных людей в эффективную команду. Благодаря четким ролям – Владелец, Волонтер и Приют – каждый знает, как может помочь, а система благодарностей мотивирует самых активных.' },
  { icon: notificationIcon, title: 'Мгновенные уведомления', description: 'Время – главный ресурс в поиске. Наш телеграм-бот позволяет волонтерам отправлять отчеты с фото и геолокацией за секунды, а владельцы и другие поисковики получают важные оповещения мгновенно, не теряя драгоценных минут.' }
];

const HowItWorks = () => {
  return (
    <section className={styles.howItWorksSection}>
      <h2 className={styles.title}>Почему Зов хозяина работает</h2>
      <div className={styles.featuresGrid}>
        {featuresData.map((feature, index) => (
          <div className={styles.featureCard} key={index}>
            <div className={styles.iconContainer}>
              <img src={feature.icon} alt="" />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;