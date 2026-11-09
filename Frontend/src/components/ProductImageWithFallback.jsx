import React, { useState } from 'react';

/**
 * ProductImageWithFallback
 * Displays product image with graceful fallback to an artistic placeholder
 * exhibiting the item's name and description message if the image fails to load.
 */
export default function ProductImageWithFallback({
  src,
  alt,
  name,
  description,
  category,
  className = '',
  aspectRatio = 'aspect-square',
}) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If no source is provided or image loading fails
  if (!src || hasError) {
    return (
      <div
        className={`relative w-full ${aspectRatio} bg-gradient-to-br from-stone-100 via-stone-200 to-stone-100 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900 border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between items-center text-center overflow-hidden group select-none shadow-inner ${className}`}
      >
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#064e3b_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Top: Category Pill */}
        <div className="relative z-10 w-full flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-950/10 dark:bg-white/10 text-emerald-800 dark:text-white border border-emerald-800/15 dark:border-white/20 backdrop-blur-sm">
            {category || 'Atelier Selection'}
          </span>
          <span className="material-symbols-outlined text-stone-400 text-[18px]">
            palette
          </span>
        </div>

        {/* Center: Title & Icon */}
        <div className="relative z-10 px-2 my-auto">
          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-white/70 dark:bg-stone-850/70 border border-stone-200 dark:border-stone-700/60 shadow-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-800 dark:text-white text-2xl">
              image_not_supported
            </span>
          </div>
          <h4 className="font-serif font-bold text-sm md:text-base text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
            {name || alt || 'Artisan Creation'}
          </h4>
        </div>

        {/* Bottom: Description Message */}
        <div className="relative z-10 w-full pt-2 border-t border-stone-200/60 dark:border-stone-800/80">
          <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 italic leading-relaxed">
            {description ? `"${description}"` : 'Handcrafted bespoke interior curation.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden bg-stone-100 dark:bg-stone-900 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-900 animate-pulse">
          <div className="w-7 h-7 border-2 border-emerald-800/40 border-t-emerald-800 dark:border-white/20 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt || name || 'Product Curation'}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
      />
    </div>
  );
}

