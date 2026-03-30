export function GreenXLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' }[size];
  const tagSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[size];
  const letterSpacing = { sm: 'tracking-[0.1em]', md: 'tracking-[0.12em]', lg: 'tracking-[0.15em]' }[size];

  return (
    <div className="text-left group cursor-pointer">
      <h1 className={`${textSize} font-extrabold ${letterSpacing} flex items-center gap-1`}>
        <span
          className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:text-[#39FF14] bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300"
          style={{ textShadow: 'none' }}
        >
          GREEN
        </span>
        <span className="font-extrabold bg-gradient-to-br from-emerald-700 to-teal-700 dark:text-white bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">X</span>
      </h1>
      <p className={`${tagSize} font-medium bg-gradient-to-r from-emerald-600 to-teal-600 dark:text-white/70 bg-clip-text text-transparent tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-opacity`}>
        Live Farm Intelligence
      </p>
    </div>
  );
}
