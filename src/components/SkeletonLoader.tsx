import React from 'react';

export const OfferCardSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-100 rounded-lg p-3 bg-white flex gap-3.5 animate-pulse">
      {/* Image thumbnail skeleton */}
      <div className="w-20 h-20 rounded-md bg-slate-200 shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3.5 bg-slate-200 rounded w-28" />
            <div className="h-3 bg-slate-200 rounded w-10" />
          </div>
          <div className="h-3 bg-slate-200 rounded w-36" />
          <div className="h-2.5 bg-slate-200 rounded w-44" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-14" />
        </div>
      </div>
    </div>
  );
};

export const OfferListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <OfferCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const MapSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[700px] bg-slate-100 animate-pulse flex flex-col justify-between p-4">
      {/* Top Search placeholder */}
      <div className="h-10 bg-slate-200 rounded-lg w-full" />

      {/* Center Pin placeholders */}
      <div className="flex justify-center items-center gap-12 my-auto">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="w-12 h-12 rounded-full bg-slate-300 -mt-8" />
        <div className="w-10 h-10 rounded-full bg-slate-200" />
      </div>

      {/* Bottom Card placeholder */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 space-y-3 pb-20">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-md bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-200 rounded w-40" />
            <div className="h-2.5 bg-slate-200 rounded w-24" />
          </div>
        </div>
        <div className="h-9 bg-slate-200 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
};
