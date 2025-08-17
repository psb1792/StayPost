import React, { useState } from 'react';
import { HashtagGenerationOutput } from '@/ai/chains/hashtag-generation';

interface HashtagGenerationDemoProps {
  // 빈 인터페이스 대신 Record<string, never> 사용
}

export default function HashtagGenerationDemo(_props: HashtagGenerationDemoProps) {
  const [formData, setFormData] = useState({
    postContent: '',
    storeName: '',
    storeCategory: '',
    storeLocation: '',
    storeDescription: '',
    targetAudience: '',
    emotion: '',
    maxHashtags: 10
  });

  const [result, setResult] = useState<HashtagGenerationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/hashtag-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postContent: formData.postContent,
          storeInfo: {
            name: formData.storeName,
            category: formData.storeCategory,
            location: formData.storeLocation || undefined,
            description: formData.storeDescription || undefined
          },
          targetAudience: formData.targetAudience || undefined,
          emotion: formData.emotion || undefined,
          maxHashtags: parseInt(formData.maxHashtags.toString())
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate hashtags');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderHashtagCategory = (title: string, hashtags: string[]) => (
    <div key={title} className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {hashtags.length > 0 ? (
          hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">없음</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Phase 2.5: 해시태그 생성 데모
          </h1>
          <p className="text-gray-600 mb-6">
            게시물 내용과 가게 정보를 바탕으로 인스타그램에 최적화된 해시태그를 생성합니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 게시물 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                게시물 내용 *
              </label>
              <textarea
                name="postContent"
                value={formData.postContent}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="게시물 내용을 입력하세요..."
              />
            </div>

            {/* 가게 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가게 이름 *
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="가게 이름"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종 *
                </label>
                <select
                  name="storeCategory"
                  value={formData.storeCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">업종 선택</option>
                  <option value="카페">카페</option>
                  <option value="레스토랑">레스토랑</option>
                  <option value="펜션">펜션</option>
                  <option value="호텔">호텔</option>
                  <option value="미용실">미용실</option>
                  <option value="네일샵">네일샵</option>
                  <option value="헬스장">헬스장</option>
                  <option value="요가">요가</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  위치
                </label>
                <input
                  type="text"
                  name="storeLocation"
                  value={formData.storeLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 서울 강남구"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 해시태그 수
                </label>
                <input
                  type="number"
                  name="maxHashtags"
                  value={formData.maxHashtags}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가게 설명
              </label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="가게에 대한 간단한 설명..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  타겟 오디언스
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 20-30대 여성"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  감정 톤
                </label>
                <select
                  name="emotion"
                  value={formData.emotion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">감정 톤 선택</option>
                  <option value="따뜻함">따뜻함</option>
                  <option value="신나는">신나는</option>
                  <option value="평온한">평온한</option>
                  <option value="고급스러운">고급스러운</option>
                  <option value="친근한">친근한</option>
                  <option value="프리미엄">프리미엄</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '해시태그 생성 중...' : '해시태그 생성'}
            </button>
          </form>
        </div>

        {/* 결과 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">오류 발생</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">생성된 해시태그</h2>

            {/* 전체 해시태그 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">전체 해시태그</h3>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 카테고리별 분류 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리별 분류</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderHashtagCategory('브랜드 관련', result.categories.brand)}
                {renderHashtagCategory('위치 관련', result.categories.location)}
                {renderHashtagCategory('감정/톤 관련', result.categories.emotion)}
                {renderHashtagCategory('업종 관련', result.categories.category)}
                {renderHashtagCategory('트렌드 관련', result.categories.trending)}
              </div>
            </div>

            {/* 생성 근거 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">생성 근거</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{result.reasoning}</p>
              </div>
            </div>

            {/* 규정 준수 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">규정 준수 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">사용된 금지어</h4>
                  <div className="bg-red-50 rounded-lg p-3">
                    {result.compliance.forbiddenWords.length > 0 ? (
                      <ul className="text-red-700 text-sm">
                        {result.compliance.forbiddenWords.map((word, index) => (
                          <li key={index}>• {word}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-700 text-sm">금지어 없음</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">준수한 브랜드 가이드라인</h4>
                  <div className="bg-green-50 rounded-lg p-3">
                    {result.compliance.brandGuidelines.length > 0 ? (
                      <ul className="text-green-700 text-sm">
                        {result.compliance.brandGuidelines.map((guideline, index) => (
                          <li key={index}>• {guideline}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">가이드라인 없음</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
