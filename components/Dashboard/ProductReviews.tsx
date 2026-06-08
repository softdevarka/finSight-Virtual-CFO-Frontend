import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { id: 1, user: 'Cus1', rating: 5, comment: 'Excellent product! Highly recommend for enterprise scale.' },
  { id: 2, user: 'Cus2', rating: 4, comment: 'Good product! Solid performance and reliable support.' },
  { id: 3, user: 'Cus3', rating: 2, comment: '... but subpar service. Delivery was delayed significantly.' },
];

export function ProductReviews() {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{review.user}</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300 dark:text-zinc-700'}`} 
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">&quot;{review.comment}&quot;</p>
        </div>
      ))}
    </div>
  );
}
