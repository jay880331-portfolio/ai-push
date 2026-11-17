interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-4xl'
  };

  const LogoSvg = () => (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 400 400" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm"
    >
      <g transform="translate(200, 200)">
        <polygon points="-80,-40 -20,40 -140,40" fill="#1a237e"></polygon>
        <polygon points="20,-40 80,40 -40,40" fill="#00bcd4"></polygon>
        <polygon points="-120,-20 -100,20 -140,20" fill="#00bcd4"></polygon>
        <polygon points="60,-10 80,20 40,20" fill="#1a237e"></polygon>
        <polygon points="-20,-40 20,-40 -40,40 20,40" fill="#0d47a1" opacity="0.8"></polygon>
      </g>
      {variant === 'full' && (
        <g transform="translate(200, 320)">
          <text x="-85" y="0" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#1a237e" letterSpacing="8px">RIDGE</text>
          <text x="25" y="0" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#00bcd4" letterSpacing="4px">AI</text>
        </g>
      )}
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <LogoSvg />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={sizeClasses[size]}>
        <LogoSvg />
      </div>
      {variant === 'full' && (
        <span className={`font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Ridge AI Push
        </span>
      )}
    </div>
  );
}