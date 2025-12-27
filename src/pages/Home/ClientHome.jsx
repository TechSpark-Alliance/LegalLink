import React from 'react';
import NavBar from '../../components/NavBar/NavBar';
import Hero from '../../components/Hero/Hero';
import FeatureCard from '../../components/FeatureCard/FeatureCard';
import InfoPanel from '../../components/InfoPanel/InfoPanel';
import styles from './ClientHome.module.css';
import lawyerImg from '../../assets/lawyer1.png';

const featureCards = [
  {
    title: 'Find the right lawyer',
    description: 'Browse specialties, review profiles, and match with verified experts tailored to your case.',
    icon: 'F',
  },
  {
    title: 'Schedule appointments',
    description: 'Securely book consultations that fit your calendar with instant confirmations.',
    icon: 'S',
  },
  {
    title: 'Conversations in one place',
    description: 'Keep every message, document, and update organized in your secure client inbox.',
    icon: 'C',
  },
  {
    title: 'Track your matters',
    description: 'Stay on top of tasks, deadlines, and outcomes with clear timelines and reminders.',
    icon: 'T',
  },
];

const panels = [
  {
    title: 'Upcoming matters',
    description: 'View the latest appointments, milestones, and shared documents from your legal team.',
    tone: 'dark',
  },
  {
    title: 'Case brief',
    description: 'A concise overview of recent activity, notes, and next steps for your active cases.',
    tone: 'darker',
  },
  {
    title: 'Secure archive',
    description: 'All past conversations, files, and invoices preserved with audit-ready history.',
    tone: 'darkest',
  },
];

const lawyerTabs = [
  { label: 'Popular', active: true },
  { label: 'Family & Personal Matters' },
  { label: 'Business & Corporate' },
  { label: 'Property & Real Estate' },
];

const lawyers = [
  { name: 'Krystal Jung', location: 'Kuala Lumpur, Malaysia', featured: true, image: lawyerImg },
  { name: 'Placeholder', location: '---', featured: false },
  { name: 'Placeholder', location: '---', featured: false },
  { name: 'Placeholder', location: '---', featured: false },
];

const reviews = [
  {
    title: 'Family dispute mediation',
    rating: 5,
    headline: 'Empathetic and precise guidance.',
    text: 'Ava walked me through each step and kept communication clear and timely.',
  },
  {
    title: 'Business contract review',
    rating: 4,
    headline: 'Responsive and detailed.',
    text: 'Quick turnaround with practical recommendations that protected our interests.',
  },
  {
    title: 'Property settlement',
    rating: 5,
    headline: 'Professional and reassuring.',
    text: 'Made a complex process feel manageable and secure.',
  },
];

const ClientHome = () => {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <Hero />

        <section className={styles.topLawyers}>
          <div className={styles.sectionHead}>
            <h2>Top Lawyers</h2>
            <div className={styles.explore}>
              <span className={styles.searchIcon} aria-hidden="true" />
              <span>Explore more</span>
            </div>
          </div>
          <div className={styles.tabRow}>
            {lawyerTabs.map((tab) => (
              <button
                type="button"
                key={tab.label}
                className={`${styles.tab} ${tab.active ? styles.tabActive : ''}`}
                aria-pressed={tab.active}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.lawyerGrid}>
            {lawyers.map((lawyer, index) => (
              <article
                key={lawyer.name + index}
                className={`${styles.lawyerCard} ${lawyer.featured ? styles.featured : ''}`}
              >
                <div
                  className={`${styles.lawyerImage} ${lawyer.image ? styles.hasImage : ''}`}
                  style={lawyer.image ? { backgroundImage: `url(${lawyer.image})` } : undefined}
                  aria-hidden="true"
                >
                  {lawyer.featured ? <span className={styles.overlayName}>{lawyer.name}</span> : 'Placeholder'}
                  {lawyer.featured && <span className={styles.overlayLocation}>{lawyer.location}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.reviews}>
          <div className={styles.sectionHead}>
            <h2>Service Reviews</h2>
          </div>
          <div className={styles.reviewGrid}>
            {reviews.map((review, index) => (
              <article key={review.title + index} className={styles.reviewCard}>
                <div className={styles.reviewTop}>
                  <span className={styles.avatar} aria-hidden="true">
                    {review.title.slice(0, 1)}
                  </span>
                  <div>
                    <p className={styles.reviewTitle}>{review.title}</p>
                    <div className={styles.stars} aria-label={`${review.rating} star rating`}>
                      {'★'.repeat(review.rating)}
                    </div>
                  </div>
                </div>
                <p className={styles.reviewHeadline}>{review.headline}</p>
                <p className={styles.reviewText}>{review.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ctaBand}>
          <div className={styles.ctaPill}>Start a new request</div>
          <div className={styles.ctaSub}>Connect with your legal team in seconds.</div>
        </section>

        <section className={styles.featureGrid}>
          {featureCards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </section>

        <section className={styles.infoGrid}>
          <InfoPanel {...panels[0]} />
          <InfoPanel {...panels[1]} />
        </section>

        <section className={styles.infoWide}>
          <InfoPanel {...panels[2]} />
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>LEGALLINK</div>
        <div className={styles.footerSocial}>
          <span>Follow us on</span>
          <span className={styles.socialIcon} aria-hidden="true" />
          <span className={styles.socialIcon} aria-hidden="true" />
          <span className={styles.socialIcon} aria-hidden="true" />
        </div>
        <div className={styles.footerLinks}>
          <a href="/">About Us</a>
          <a href="/">Our company</a>
        </div>
      </footer>
    </div>
  );
};

export default ClientHome;
