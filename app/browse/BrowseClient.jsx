// app/browse/BrowseClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import Filters from '@/components/BrowseFilters';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 12;

export default function BrowseClient() {
  const params = useSearchParams();

  const page = Number(params.get('page') || 1);
  const type = params.get('type') || '';     // e.g. "pools", "cars", "spaces"
  const q = params.get('q') || '';           // search text

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Base query
      let query = supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (type) query = query.eq('category', type);
      if (q) query = query.ilike('title', `%${q}%`);

      const { data, count, error } = await query;
      if (cancelled) return;
      if (error) {
        console.error('Browse load error:', error);
        setItems([]);
        setTotal(0);
      } else {
        setItems(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [page, type, q]);

  return (
    <div className="space-y-6">
      <Filters />

      {loading ? (
        <p className="text-gray-500">Loading listings…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600">No listings match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="aspect-[4/3] overflow-hidden rounded-md">
                <img
                  src={item.image_url || item.images?.[0] || '/placeholder.jpg'}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-500">
                  {item.city ? `${item.city}, ` : ''}{item.state || ''}
                </div>
                <div className="mt-1 text-sm">
                  <span className="font-semibold">${item.price}</span> / hour
                </div>
                <a
                  className="btn primary mt-3 inline-block"
                  href={`/list/${item.id}`}
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}