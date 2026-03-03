export function GreenXLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' }[size];
  const tagSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[size];

  return (
    <div className="text-center">
      <h1 className={`${textSize} font-display tracking-tight`}>
        <span style={{ color: 'hsl(140, 70%, 30%)' }}>Green</span>
        <span className="text-foreground font-extrabold">X</span>
      </h1>
      <p className={`${tagSize} text-muted-foreground tracking-wide`}>Where land meets intelligence</p>
    </div>
  );
}
