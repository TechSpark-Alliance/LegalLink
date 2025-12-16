import React from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './LawyerReviews.css';
import { lawyersData } from './lawyersData';

const StarRow = ({ count }) => (
  <span className="lr-stars" aria-label={`${count} star rating`}>
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
);

const LawyerReviews = () => {
  const { id } = useParams();
  const lawyer = lawyersData[id];

  if (!lawyer) {
    return (
      <div className="lawyer-reviews-page">
        <NavBar />
        <main className="reviews-shell">
          <div className="not-found">Lawyer not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="lawyer-reviews-page">
      <NavBar />
      <main className="reviews-shell">
        <div className="reviews-head">
          <div className="head-actions">
            <Link to={`/lawyers/${lawyer.id}`} className="back-link">
              ← Back to profile
            </Link>
          </div>
          <div>
            <p className="crumb">
              <Link to="/lawyers">Lawyers</Link> / <Link to={`/lawyers/${lawyer.id}`}>{lawyer.name}</Link> / Reviews
            </p>
            <h1>{lawyer.name} — Reviews</h1>
            <p className="subtext">
              Honest feedback from clients who have worked with {lawyer.name}. Clear, concise, and helpful.
            </p>
          </div>
        </div>

        <section className="reviews-grid" aria-label="All reviews">
          {lawyer.reviews.map((item, idx) => (
            <article key={idx} className="review-card">
              <div className="review-top">
                <div className="avatar" aria-hidden="true">
                  {item.reviewer.slice(0, 1)}
                </div>
                <div>
                  <p className="review-title">{item.title}</p>
                  <StarRow count={item.stars} />
                </div>
                <span className="review-date">{item.date}</span>
              </div>
              <p className="review-body">{item.text}</p>
              <p className="reviewer-line">- {item.reviewer}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default LawyerReviews;
