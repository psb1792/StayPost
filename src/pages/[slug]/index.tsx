import React from 'react';
import { useParams } from 'react-router-dom';
import ReservationForm from '../../components/ReservationForm';

interface ReservationPageProps {
  slug?: string;
}

function ReservationPage({ slug: propSlug }: ReservationPageProps) {
  const params = useParams();
  const slug = propSlug || params.slug;

  return (
    <div>
      <ReservationForm slug={slug} />
    </div>
  );
}

export default ReservationPage; 