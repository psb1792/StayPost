import React from 'react';
import { useParams, Link } from 'react-router-dom';

interface ReservationPageProps {
  slug?: string;
}

function ReservationPage({ slug: propSlug }: ReservationPageProps) {
  const params = useParams();
  const slug = propSlug || params.slug;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {slug ? `${slug} 예약 페이지` : '예약 페이지'}
        </h1>
        <p className="text-gray-600 mb-8">
          이 페이지는 현재 개발 중입니다.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          메인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default ReservationPage; 