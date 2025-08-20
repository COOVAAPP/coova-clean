'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // or '../lib/supabaseClient'

export default function AuthModal() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('Sending…');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMsg(error ? `Error: ${error.message}` : 'Check your email for the link.');
  }

  return (
    <div>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button type="submit">Send</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}