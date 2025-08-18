// components/AuthModal.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthModal({ open, onClose }) {
  const router = useRouter();
  const [step, setStep] = useState('enter'); // 'enter' | 'verify'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState('');

  // Reset when opened/closed
  useEffect(() => {
    if (open) {
      setStep('enter');
      setPhone('');
      setCode('');
      setErr('');
    }
  }, [open]);

  // naive US-only E.164 sanitize (change if you support more countries)
  const e164 = useMemo(() => {
    let p = phone.replace(/[^\d+]/g, '');
    if (!p.startsWith('+')) {
      // assume US
      if (p.length === 10) p = `+1${p}`;
    }
    return p;
  }, [phone]);

  async function sendCode(e) {
    e.preventDefault();
    setErr('');
    if (!e164 || e164.length < 10) {
      setErr('Please enter a valid phone number.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { shouldCreateUser: true }, // sign up or log in
      });
      if (error) throw error;
      setStep('verify');
    } catch (ex) {
      setErr(ex.message || 'Failed to send code. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setErr('');
    if (!code || code.length < 4) {
      setErr('Enter the code you received.');
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164,
        token: code,
        type: 'sms',
      });
      if (error) throw error;
      // success: session is set on the client
      onClose?.();
      router.refresh();
    } catch (ex) {
      setErr(ex.message || 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">
            {step === 'enter' ? 'Log In or Sign Up' : 'Enter Verification Code'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-6">
          {step === 'enter' && (
            <form onSubmit={sendCode} className="space-y-4">
              <label className="block text-sm font-medium">Phone number</label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="(555) 555-5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
              />

              {err && <p className="text-sm text-red-600">{err}</p>}

              <button
                type="submit"
                disabled={sending}
                className="btn primary w-full"
              >
                {sending ? 'Sending…' : 'Send Code'}
              </button>

              <p className="pt-2 text-center text-xs text-gray-500">
                Message and data rates may apply.
              </p>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={verifyCode} className="space-y-4">
              <label className="block text-sm font-medium">
                Code sent to <span className="font-semibold">{e164}</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 tracking-widest focus:ring-2 focus:ring-brand-500"
              />

              {err && <p className="text-sm text-red-600">{err}</p>}

              <button
                type="submit"
                disabled={verifying}
                className="btn primary w-full"
              >
                {verifying ? 'Verifying…' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setStep('enter')}
                className="w-full rounded-md border border-gray-300 py-2 text-sm hover:bg-gray-50"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}