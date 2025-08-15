import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ListYourSpace() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    const { data, error } = await supabase.storage
      .from("Public")
      .upload(`spaces/${file.name}`, file);

    if (error) {
      console.error(error);
      alert("Upload failed");
    } else {
      alert("Image uploaded successfully");
    }
  };

  const handleCreateListing = async () => {
    if (!title || !price) return alert("Please fill all fields");
    // Here you can save the listing to Supabase DB
    alert("Listing created!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-[400px] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <h1 className="relative z-10 text-4xl font-bold drop-shadow-lg">
          List Your Space
        </h1>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg -mt-12 relative z-20">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Create Your Listing
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cozy backyard pool"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Photo
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full border border-gray-300 rounded-lg p-3"
            />
            <button
              onClick={handleUpload}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload
            </button>
          </div>

          <button
            onClick={handleCreateListing}
            className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Create Listing
          </button>
        </div>
      </div>
    </div>
  );
}