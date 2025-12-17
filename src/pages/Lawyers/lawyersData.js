import lawyerPortrait from '../../assets/lawyer1.png';

export const lawyersData = {
  'krystal-jung': {
    id: 'krystal-jung',
    name: 'Krystal Jung',
    title: 'Lawyers profile',
    bio: 'Krystal is a versatile attorney known for navigating complex real estate transactions, ensuring compliance, and advocating for clients with clarity and confidence.',
    casesWon: '70+',
    experience: '3+ years',
    rating: '4.8',
    location: 'Kuala Lumpur, Malaysia',
    image: lawyerPortrait,
    review: {
      quote:
        'Excellent services provided by company. Firm is good and seeks to keep their clients satisfied with what they want.',
      reviewer: 'M. Joy',
      stars: 5,
    },
    firm: {
      name: 'Jung & Partners',
      office: '+60 12 345 6789',
      address: '12, Jalan Bukit Bintang, 55100 Kuala Lumpur, Malaysia',
      email: 'contact@jungpartners.com',
    },
    reviews: [
      {
        title: 'Practical advice, fast responses',
        text: 'Quick to respond and very thorough in explaining every step. Felt informed and supported the entire time.',
        reviewer: 'A. Rivera',
        stars: 5,
        date: 'Oct 2025',
      },
      {
        title: 'Smooth property closing',
        text: 'Handled all documents and negotiations efficiently. Kept me updated and ensured timelines were met.',
        reviewer: 'D. Malik',
        stars: 5,
        date: 'Sep 2025',
      },
      {
        title: 'Clear, actionable guidance',
        text: 'Broke down the legal jargon and provided clear next steps. Professional and approachable.',
        reviewer: 'S. Tan',
        stars: 4,
        date: 'Aug 2025',
      },
      {
        title: 'Thorough due diligence',
        text: 'Identified potential risks early and negotiated better terms for my purchase.',
        reviewer: 'J. Wong',
        stars: 5,
        date: 'Jul 2025',
      },
    ],
  },
};
