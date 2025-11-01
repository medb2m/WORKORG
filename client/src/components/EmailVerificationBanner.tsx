'use client';

import { useState } from 'react';
import { Mail, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:5000/api');

interface EmailVerificationBannerProps {
  userEmail: string;
}

export default function EmailVerificationBanner({ userEmail }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  if (dismissed) return null;

  const handleResendEmail = async () => {
    setSending(true);
    setMessage('');
    setMessageType(null);

    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email: userEmail,
      });
      setMessage(response.data.message);
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to send verification email');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-900 font-medium">
                Please verify your email address
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Check your inbox for a verification link or{' '}
                <button
                  onClick={handleResendEmail}
                  disabled={sending}
                  className="underline hover:text-yellow-900 font-medium disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'resend verification email'}
                </button>
              </p>
              {message && (
                <div className={`mt-2 flex items-center space-x-2 text-xs ${
                  messageType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {messageType === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-yellow-100 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-yellow-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

