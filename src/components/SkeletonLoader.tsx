import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const OfferCardSkeleton: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`border rounded-2xl p-3 flex gap-3.5 animate-pulse ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
    }`}>
      {/* Image thumbnail skeleton */}
      <div className={`w-20 h-20 rounded-xl shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className={`h-3.5 rounded w-28 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-3 rounded w-10 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
          <div className={`h-3 rounded w-36 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-2.5 rounded w-44 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>

        <div className={`flex items-center justify-between pt-2 border-t ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className={`h-4 rounded w-16 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-4 rounded w-14 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
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
  const { isDark } = useTheme();

  return (
    <div className={`w-full h-[700px] animate-pulse flex flex-col justify-between p-4 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Search placeholder */}
      <div className={`h-10 rounded-xl w-full ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-200'}`} />

      {/* Center Pin placeholders */}
      <div className="flex justify-center items-center gap-12 my-auto">
        <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <div className={`w-12 h-12 rounded-full -mt-8 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
        <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>

      {/* Bottom Card placeholder */}
      <div className={`rounded-2xl p-4 shadow-sm border space-y-3 pb-20 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex gap-3">
          <div className={`w-16 h-16 rounded-xl shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="flex-1 space-y-2 py-1">
            <div className={`h-3.5 rounded w-32 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-3 rounded w-40 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-2.5 rounded w-24 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        </div>
        <div className={`h-9 rounded-xl w-full mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>
    </div>
  );
};
