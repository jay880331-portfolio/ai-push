'use client';

import { useState } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: 'demo' | 'pricing' | 'technical' | 'partnership' | 'other';
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    inquiryType: 'demo'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', company: '', message: '', inquiryType: 'demo' });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">문의가 접수되었습니다!</h3>
          <p className="text-gray-600 mb-6">
            빠른 시일 내에 답변드리겠습니다. 소중한 관심 감사합니다.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            새 문의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">문의하기</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ridge AI Push에 대해 궁금한 점이 있으시거나 도입을 검토하고 계신가요?<br />
          언제든지 연락주세요!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">문의 양식</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-700 mb-2">
                문의 유형
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                required
              >
                <option value="demo">데모 요청</option>
                <option value="pricing">가격 문의</option>
                <option value="technical">기술 지원</option>
                <option value="partnership">파트너십</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                회사명
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                문의 내용 *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500"
                placeholder="문의하실 내용을 자세히 작성해주세요..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  전송 중...
                </div>
              ) : (
                '문의 보내기'
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏢</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ridge</h4>
                  <p className="text-gray-600">AI-powered Push Notification Platform</p>
                </div>
              </div>


              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⏰</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">응답 시간</h4>
                  <p className="text-gray-600">영업일 기준 24시간 이내</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}