import React from 'react';
import styles from './InfoPanel.module.css';

const InfoPanel = ({ title, description, tone = 'dark' }) => {
  return (
    <section className={`${styles.panel} ${styles[tone]}`}>
      <div className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
        <span className={styles.badge}>Updated</span>
      </div>
      <p className={styles.description}>{description}</p>
      <div className={styles.placeholder} aria-hidden="true">
        <span>Content preview</span>
      </div>
    </section>
  );
};

export default InfoPanel;
