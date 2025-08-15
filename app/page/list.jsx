import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ListSpace() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select a photo first.');
    setLoading(true);

    const { data, error } = await supabase.storage
      .from('Public')
      .upload(`spaces/${file.name}`, file, { upsert: true });

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Upload failed');
      return null;
    }

    const { publicURL } = supabase.storage.from('Public').getPublicUrl(`spaces/${file.name}`);
    return publicURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const photoUrl = await handleUpload();
    if (!photoUrl) return;

    const { error } = await supabase.from('spaces').insert([{ title, price, photo: photoUrl }]);
    if (error) {
      console.error(error);
      alert('Error saving listing');
    } else {
      alert('Listing created successfully!');
      setTitle('');
      setPrice('');
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center h-72 flex items-center justify-center"
        style={{
          backgroundImage: "url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg')"
        }}
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">List Your Space</h1>
      </div>

      {/* Form Section */}
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cozy backyard pool"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="99"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700">Photo</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            {loading ? 'Uploading...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}