import React from 'react';
import styles from './FeatureCard.module.css';

const FeatureCard = ({ title, description, icon }) => {
  return (
    <article className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        <span className={styles.iconGlyph}>{icon || '★'}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
};

export default FeatureCard;
