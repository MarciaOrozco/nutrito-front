export default function RatingStars({ value = 0, size = 'md', className = '' }) {
  const rounds = Math.round(Number(value) || 0);
  const clamped = Math.min(Math.max(rounds, 0), 5);
  const emptyStars = 5 - clamped;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const starSize = sizeClasses[size] ?? sizeClasses.md;

  const renderStar = (filled, key) => (
    <svg
      key={key}
      aria-hidden="true"
      className={`${starSize} ${filled ? 'text-clay' : 'text-sand'} ${className}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M10 1.5 12.472 7l5.528.58-4 3.88.944 5.54L10 14.8l-4.944 2.2.944-5.54-4-3.88L7.528 7z" />
    </svg>
  );

  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: clamped }, (_, index) => renderStar(true, `full-${index}`))}
      {Array.from({ length: emptyStars }, (_, index) => renderStar(false, `empty-${index}`))}
    </span>
  );
}
