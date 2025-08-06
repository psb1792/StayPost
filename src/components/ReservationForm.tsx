import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, User, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReservationFormProps {
  slug?: string;
}

interface StoreProfile {
  id: string;
  store_name: string;
  slug: string;
  available_times: string[];
  created_at: string;
  updated_at: string;
}

function ReservationForm({ slug }: ReservationFormProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [personCount, setPersonCount] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [request, setRequest] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load store profile and available times
  useEffect(() => {
    const loadStoreProfile = async () => {
      if (!slug) return;
      
      // Remove @ from slug if present
      const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug;
      
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('store_profiles')
          .select('*')
          .eq('slug', cleanSlug)
          .single();

        if (error) {
          console.error('Error loading store profile:', error);
          setError('가게 정보를 불러오는 중 오류가 발생했습니다.');
          return;
        }

        setStoreProfile(data);
      } catch (error) {
        console.error('Error loading store profile:', error);
        setError('가게 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadStoreProfile();
  }, [slug]);

  // Use available_times from store profile, fallback to default times
  const availableTimes = storeProfile?.available_times || [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedDate) newErrors.selectedDate = 'Please select a date';
    if (!selectedTime) newErrors.selectedTime = 'Please select a time';
    if (!name.trim()) newErrors.name = 'Please enter your name';
    if (!phone.trim()) newErrors.phone = 'Please enter your phone number';
    
    // Validate date is not in the past
    if (selectedDate) {
      const today = new Date();
      const selected = new Date(selectedDate);
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      
      if (selected < today) {
        newErrors.selectedDate = 'Please select a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. slug 값이 없으면 예약 중단
    if (!slug) {
      alert('잘못된 접근입니다. 가게 정보가 누락되었습니다.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      // 2. 중복 예약 확인 (date + time 기준)
      const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug;
      const { data: existingReservations, error: checkError } = await supabase
        .from('reservations')
        .select('*')
        .eq('store_slug', cleanSlug)
        .eq('date', selectedDate)
        .eq('time', selectedTime);

      if (checkError) {
        console.error('Error checking for duplicate reservations:', checkError);
        alert('예약 확인 중 오류가 발생했습니다.');
        return;
      }

      // 3. 중복 예약이 있으면 alert 띄우고 중단
      if (existingReservations && existingReservations.length > 0) {
        alert('이미 예약이 있습니다.');
        return;
      }

      // 4. 중복이 없으면 예약 데이터 insert
      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            store_slug: cleanSlug,
            date: selectedDate,
            time: selectedTime,
            person_count: personCount,
            name: name.trim(),
            phone: phone.trim(),
            request: request.trim() || null
          }
        ])
        .select();

      // 5. insert 성공 시 성공 alert
      if (error) {
        console.error('Error saving reservation:', error);
        alert('예약 중 오류가 발생했습니다.');
        return;
      }

      // 6. 예약 성공 처리
      console.log('Reservation saved successfully:', data);
      alert('예약이 완료되었습니다!');
      setIsSubmitted(true);
      
      // 7. 3초 후 /complete 페이지로 이동
      setTimeout(() => {
        const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug;
        navigate(`/${cleanSlug}/complete`);
      }, 3000);

    } catch (error) {
      // 8. 예상치 못한 오류 발생 시
      console.error('Unexpected error saving reservation:', error);
      alert('예약 중 오류가 발생했습니다.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reservation Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you, {name}! We've received your reservation for {personCount} {personCount === 1 ? 'person' : 'people'} on {new Date(selectedDate).toLocaleDateString()} at {formatTime(selectedTime)}.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting back to form...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Make a Reservation</h1>
            <p className="text-blue-100">Reserve your table for an unforgettable dining experience</p>
            {loading ? (
              <p className="text-blue-200 text-sm mt-2">Loading restaurant information...</p>
            ) : error ? (
              <p className="text-red-200 text-sm mt-2">{error}</p>
            ) : storeProfile ? (
              <p className="text-blue-200 text-sm mt-2">Restaurant: {storeProfile.store_name}</p>
            ) : slug && (
              <p className="text-blue-200 text-sm mt-2">Restaurant: {slug}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleReservationSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <label htmlFor="date" className="flex items-center text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Reservation Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.selectedDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.selectedDate && (
                  <p className="text-red-500 text-sm">{errors.selectedDate}</p>
                )}
              </div>

              {/* Time Selector */}
              <div className="space-y-2">
                <label htmlFor="time" className="flex items-center text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  Preferred Time
                </label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={loading || !!error}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.selectedTime ? 'border-red-500' : 'border-gray-300'
                  } ${(loading || error) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {loading ? 'Loading available times...' : error ? 'Error loading times' : 'Select a time'}
                  </option>
                  {!loading && !error && availableTimes.map((time: string) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
                {errors.selectedTime && (
                  <p className="text-red-500 text-sm">{errors.selectedTime}</p>
                )}
              </div>

              {/* Person Count */}
              <div className="space-y-2">
                <label htmlFor="persons" className="flex items-center text-sm font-semibold text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Number of Guests
                </label>
                <select
                  id="persons"
                  value={personCount}
                  onChange={(e) => setPersonCount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Person' : 'People'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* Special Requests */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="request" className="flex items-center text-sm font-semibold text-gray-700">
                  <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Special Requests (Optional)
                </label>
                <textarea
                  id="request"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="Any dietary restrictions, special occasions, or other requests..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-bold py-4 px-6 rounded-lg focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                } text-white`}
              >
                {loading ? 'Loading...' : 'Confirm Reservation'}
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              We'll confirm your reservation within 15 minutes
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReservationForm;