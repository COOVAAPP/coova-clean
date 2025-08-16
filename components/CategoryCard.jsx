export default function CategoryCard({ title, desc }) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="badge mb-3">{title}</div>
        <div className="card-title mb-1">{title}</div>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}