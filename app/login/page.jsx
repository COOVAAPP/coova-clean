'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // or '../lib/supabaseClient'

export const dynamic = "force-dynamic";
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('Sending…');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMsg(error ? `Error: ${error.message}` : 'Check your email for the link.');
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button type="submit">Send magic link</button>
      </form>
      <p>{msg}</p>
    </main>
  );
}