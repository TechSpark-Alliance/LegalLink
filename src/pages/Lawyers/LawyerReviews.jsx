import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import './LawyerReviews.css';

const StarRow = ({ count }) => (
  <span className="lr-stars" aria-label={`${count || 0} star rating`}>
    {'★'.repeat(Math.min(count || 0, 5))}{'☆'.repeat(Math.max(0, 5 - (count || 0)))}
  </span>
);

const API_BASE = import.meta.env.VITE_APP_API || 'http://localhost:8000/api/v1';

const LawyerReviews = () => {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchLawyer = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/lawyers/${id}`);
        if (!res.ok) throw new Error('Failed to load lawyer');
        const data = await res.json();
        const profile = data.lawyer || data.profile || data.user || data;
        if (isMounted) setLawyer(profile);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load lawyer');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLawyer();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const reviews = lawyer?.reviews || [];
  const displayName = lawyer?.full_name || lawyer?.name || 'Lawyer';
  const lawyerId = lawyer?._id || lawyer?.id || id;

  if (loading) {
    return (
      <div className="lawyer-reviews-page">
        <NavBar />
        <main className="reviews-shell">
          <div className="not-found">Loading...</div>
        </main>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="lawyer-reviews-page">
        <NavBar />
        <main className="reviews-shell">
          <div className="not-found">{error || 'Lawyer not found.'}</div>
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
            <Link to={`/client/lawyers/lawyer/${lawyerId}`} className="back-link">
              ← Back to profile
            </Link>
          </div>
          <div>
            <p className="crumb">
              <Link to="/client/lawyers">Lawyers</Link> /{' '}
              <Link to={`/client/lawyers/lawyer/${lawyerId}`}>{displayName}</Link> / Reviews
            </p>
            <h1>{displayName} – Reviews</h1>
            <p className="subtext">
              Honest feedback from clients who have worked with {displayName}. Clear, concise, and helpful.
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="not-found">No reviews yet for this lawyer.</div>
        ) : (
          <section className="reviews-grid" aria-label="All reviews">
            {reviews.map((item, idx) => (
              <article key={idx} className="review-card">
                <div className="review-top">
                  <div className="avatar" aria-hidden="true">
                    {(item.reviewer || 'C').slice(0, 1)}
                  </div>
                  <div>
                    <p className="review-title">{item.title || 'Review'}</p>
                    <StarRow count={item.stars || 5} />
                  </div>
                  <span className="review-date">{item.date || ''}</span>
                </div>
                <p className="review-body">{item.text || item.quote || 'No review text provided.'}</p>
                <p className="reviewer-line">- {item.reviewer || 'Client'}</p>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default LawyerReviews;
