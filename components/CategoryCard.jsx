import Link from "next/link";

export default function CategoryCard({ href, title, subtitle }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white/90 p-5 shadow-sm transition hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
    </Link>
  );
}