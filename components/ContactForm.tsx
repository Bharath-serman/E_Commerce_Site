'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email' as 'email' | 'phone' | 'both'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          contactMethod: 'email' as 'email' | 'phone' | 'both'
        });
      } else {
        setError(data.error || 'Failed to submit support request');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-playfair font-medium text-zinc-900 mb-4">Contact Us</h1>
        <p className="text-zinc-600">We're here to help. Fill out the form below and we'll get back to you.</p>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-8">
        {success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Thank You!</h3>
            <p className="text-zinc-600 mb-6">Your support request has been submitted. We'll get back to you soon.</p>
            <button
              onClick={() => setSuccess(false)}
              className="text-black font-medium hover:underline"
            >
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-zinc-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-zinc-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-zinc-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 mb-2">
                Subject *
              </label>
              <input
                id="subject"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border border-zinc-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-zinc-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 px-6 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-zinc-600 mb-4">Or reach us directly</p>
        <div className="flex justify-center gap-8 text-sm">
          <a href="mailto:bharathserman@gmail.com" className="text-black font-medium hover:underline">
            bharathserman@gmail.com
          </a>
          <a href="tel:+15551234567" className="text-black font-medium hover:underline">
            +91 7200030913
          </a>
        </div>
      </div>
    </div>
  );
}
