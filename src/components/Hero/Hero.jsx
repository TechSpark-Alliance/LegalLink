import React from 'react';
import styles from './Hero.module.css';
import homeIllustration from '../../assets/home-illus.png';

const stats = [
  { label: 'Trusted Clients', value: '12,840+' },
  { label: 'Verified Lawyers', value: '2,130' },
  { label: 'Avg. Response', value: '< 5 min' },
];

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <div className={styles.pill}>Secure legal guidance when you need it</div>
        <h1 className={styles.title}>Secure your peace of mind and find the right lawyer with confidence.</h1>
        <p className={styles.subtitle}>
        Discover top-rated lawyers tailored to your legal needs, location, and personal preferences. 
        </p>
        <p className={styles.subtitle}>
        Our platform gives you exclusive ratings, verified reviews, and detailed profiles so you can compare, choose, and connect with the best legal professionals for your situation all in one place.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary}>
            Book an appointment
          </button>
          <button type="button" className={styles.secondary}>
            Start a conversation
          </button>
        </div>
        <div className={styles.stats}>
          {stats.map((item) => (
            <div key={item.label} className={styles.statCard}>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.visual}>
        <img src={homeIllustration} alt="Client portal illustration" className={styles.illustration} />
        
      </div>
    </section>
  );
};

export default Hero;
