'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // or '../lib/supabaseClient' if you don't use @ alias

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function handleMagicLink(e) {
    e.preventDefault();
    setStatus('Sending…');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus(error ? `Error: ${error.message}` : 'Check your email for the link.');
  }

  useEffect(() => {
    // optional: handle session or redirect
    supabase.auth.getSession().then(({ data }) => {
      // console.log(data.session)
    });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={handleMagicLink}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send magic link</button>
      </form>
      <p>{status}</p>
    </main>
  );
}