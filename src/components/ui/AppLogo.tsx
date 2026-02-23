interface AppLogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export function AppLogo({ className = '', height, width }: AppLogoProps) {
  return (
    <img
      src="/logoblack.svg"
      alt="SendCoins"
      className={className}
      height={height}
      width={width}
      style={height || width ? { height: height ?? 'auto', width: width ?? 'auto' } : undefined}
    />
  );
}
