interface WillowMarkProps {
   size?: number;
   className?: string;
   /** "full" shows all 7 fronds (for larger display), "small" shows 3 (for nav-sized use) */
   variant?: "full" | "small";
}

export function WillowMark({ size = 16, className, variant = "full" }: WillowMarkProps) {
   if (variant === "small") {
      return (
         <svg width={size} height={size} viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
            <ellipse cx="36" cy="22" rx="22" ry="14" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2" />
            <line x1="36" y1="36" x2="36" y2="62" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M23 35 Q20 46 22 57" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            <path d="M36 36 Q33 49 35 62" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            <path d="M49 35 Q46 46 50 57" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
         </svg>
      );
   }

   return (
      <svg width={size} height={size} viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
         <ellipse cx="36" cy="22" rx="22" ry="14" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.4" />
         <line x1="36" y1="36" x2="36" y2="62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
         <path d="M18 34 Q15 43 17 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
         <path d="M23 35 Q20 46 22 57" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.68" />
         <path d="M29 36 Q26 48 28 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.80" />
         <path d="M36 36 Q33 49 35 62" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.88" />
         <path d="M43 36 Q40 48 44 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.80" />
         <path d="M49 35 Q46 46 50 57" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.68" />
         <path d="M54 34 Q51 43 55 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      </svg>
   );
}
