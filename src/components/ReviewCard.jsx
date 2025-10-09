import RatingStars from './RatingStars.jsx';

export default function ReviewCard({ review }) {
  const { patient, comment, rating, date } = review;

  return (
    <article className="flex gap-4 rounded-2xl border border-sand/60 bg-bone/60 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-base font-semibold text-clay">
        {patient?.[0]?.toUpperCase() ?? 'P'}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-bark">{patient}</p>
          <RatingStars value={rating} size="sm" />
          {date ? <span className="text-xs text-bark/60">{new Date(date).toLocaleDateString()}</span> : null}
        </div>
        <p className="text-sm text-bark/80">{comment}</p>
      </div>
    </article>
  );
}
