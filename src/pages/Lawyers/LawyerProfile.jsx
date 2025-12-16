import React from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './LawyerProfile.css';
import { lawyersData } from './lawyersData';

const Icon = ({ type }) => {
  const common = { className: 'lp-icon', 'aria-hidden': 'true', viewBox: '0 0 24 24' };
  if (type === 'pin') {
    return (
      <svg {...common}>
        <path d="M12 2.5c-3.31 0-6 2.61-6 5.83 0 1.68.66 3.19 1.82 4.67 1.05 1.36 2.38 2.64 3.77 4.45a.75.75 0 0 0 1.17 0c1.39-1.81 2.72-3.1 3.77-4.45C17.34 11.52 18 10.01 18 8.33 18 5.11 15.31 2.5 12 2.5Zm0 7.83a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      </svg>
    );
  }
  if (type === 'star') {
    return (
      <svg {...common}>
        <path d="M11.05 4.79c.3-.92 1.6-.92 1.9 0l1.06 3.28h3.45c.96 0 1.36 1.23.59 1.79l-2.79 2.02 1.06 3.28c.3.92-.76 1.69-1.54 1.13L12 14.57l-2.78 2.71c-.78.56-1.84-.21-1.54-1.13l1.06-3.28-2.79-2.02c-.77-.56-.37-1.79.59-1.79h3.45l1.06-3.28Z" />
      </svg>
    );
  }
  if (type === 'phone') {
    return (
      <svg {...common}>
        <path d="M8.6 3.54c.24-.69.99-1.08 1.69-.87l2.3.69c.66.2 1.07.85.93 1.52l-.36 1.78c-.11.55-.53.98-1.07 1.12-.73.2-1.32.79-1.52 1.52-.14.54-.57.96-1.12 1.07l-1.78.36c-.67.14-1.32-.27-1.52-.93l-.69-2.3a1.38 1.38 0 0 1 .87-1.69l2.27-.74Z" />
        <path d="M6.48 12.03c2.2 3.45 5.04 6.29 8.49 8.49.62.4 1.42.35 1.97-.12l1.12-.95c.58-.49.71-1.33.29-1.98l-1.16-1.86a1.38 1.38 0 0 0-1.8-.48l-.98.49a1.38 1.38 0 0 1-1.52-.23l-1.74-1.54a1.38 1.38 0 0 1-.23-1.52l.49-.98c.34-.68.1-1.51-.48-1.8l-1.86-1.16c-.65-.42-1.49-.29-1.98.29l-.95 1.12c-.47.55-.52 1.35-.12 1.97Z" />
      </svg>
    );
  }
  if (type === 'building') {
    return (
      <svg {...common}>
        <path d="M6.5 4.75a1.75 1.75 0 0 1 1.75-1.75h7.5A1.75 1.75 0 0 1 17.5 4.75v14.5h1.25a.75.75 0 0 1 0 1.5h-13a.75.75 0 0 1 0-1.5H7.5V4.75Zm8.5 14.5V4.75a.25.25 0 0 0-.25-.25h-7.5a.25.25 0 0 0-.25.25v14.5h8Zm-6-11.25h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Zm0 3h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Zm0 3h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Zm4-6h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5Zm0 3h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5Zm0 3h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5Z" />
      </svg>
    );
  }
  if (type === 'mail') {
    return (
      <svg {...common}>
        <path d="M4.5 6.75A1.75 1.75 0 0 1 6.25 5h11.5A1.75 1.75 0 0 1 19.5 6.75v10.5A1.75 1.75 0 0 1 17.75 19H6.25A1.75 1.75 0 0 1 4.5 17.25V6.75Zm12.5-.25H7l5 3.75L17 6.5Zm-12 1.19 5.99 4.49a.75.75 0 0 0 .92 0L17 7.69v9.56c0 .14-.11.25-.25.25H6.25a.25.25 0 0 1-.25-.25V7.69Z" />
      </svg>
    );
  }
  return null;
};

const LawyerProfile = () => {
  const { id } = useParams();
  const lawyer = lawyersData[id];

  if (!lawyer) {
    return (
      <div className="lawyer-profile-page">
        <NavBar />
        <main className="profile-shell">
          <div className="not-found">Lawyer not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="lawyer-profile-page">
      <NavBar />
      <main className="profile-shell">
        <div className="profile-head">
          <Link to="/lawyers" className="back-link">
            ← Back to discovery
          </Link>
          <Link to={`/lawyers/${lawyer.id}/reviews`} className="reviews-head-link">
            See all reviews →
          </Link>
        </div>
        <section className="profile-top">
          <div className="profile-left">
            <h1>{lawyer.title}</h1>
            <p className="bio">{lawyer.bio}</p>
            <div className="metrics">
              <div className="pill">
                Cases Won <span className="highlight">{lawyer.casesWon}</span>
              </div>
              <div className="pill">
                Experience <span className="highlight">{lawyer.experience}</span>
              </div>
              <div className="pill">
                Ratings <span className="highlight">{lawyer.rating}</span>
                <Icon type="star" />
              </div>
            </div>
            <div className="reviews-block">
              <h2>Reviews</h2>
              <p className="review-quote">“{lawyer.review.quote}”</p>
              <p className="reviewer">
                - {lawyer.review.reviewer} rated {lawyer.review.stars} stars
              </p>
              <p className="review-quote">“Quick to respond and very thorough in explaining every step.”</p>
              <p className="reviewer">- A. Rivera rated 5 stars</p>
            </div>
          </div>
          <div className="profile-right">
            <div className="portrait-card">
              <img src={lawyer.image} alt={`${lawyer.name} portrait`} />
            </div>
            <div className="location">
              <Icon type="pin" />
              <span>{lawyer.location}</span>
            </div>
          </div>
        </section>

        <div className="divider" />

        <section className="firm-panel">
          <div className="firm-block">
            <div className="firm-line">
              <Icon type="building" />
              <span>{lawyer.firm.name}</span>
            </div>
            <div className="firm-line">
              <Icon type="phone" />
              <span>{lawyer.firm.office}</span>
            </div>
          </div>
          <div className="firm-block">
            <div className="firm-line">
              <Icon type="pin" />
              <span>{lawyer.firm.address}</span>
            </div>
          <div className="firm-line">
              <Icon type="mail" />
              <span>{lawyer.firm.email}</span>
            </div>
          </div>
          <div className="cta-block">
            <Link to={`/lawyer/${lawyer.id}/book-appointment`} className="cta primary">
              Book appointment
            </Link>
            <button type="button" className="cta secondary">
              Have a quick chat
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LawyerProfile;
