export default function CategoryCard({ href, title, img, className = "" }) {
  return (
    <a
      href={href}
      aria-label={title}
      className={`group relative overflow-hidden rounded-2xl shadow hover:shadow-lg transition
                  w-[180px] h-[240px] sm:w-[220px] sm:h-[300px] lg:w-[288px] lg:h-[384px] ${className}`}
    >
      <img
        src={img}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-black/40" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
        {title}
      </span>
    </a>
  );
}