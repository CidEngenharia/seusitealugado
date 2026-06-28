type LogoProps = {
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  showSubtitle?: boolean;
  className?: string;
};

const sizeConfig = {
  sm: { height: 32 },
  md: { height: 48 },
  lg: { height: 72 },
};

export default function LogoSeusiteAlugado({
  size = "md",
  theme,
  showSubtitle,
  className = "",
}: LogoProps) {
  const { height } = sizeConfig[size];

  return (
    <img
      src="/logo_site.fw.png"
      alt="SeuSiteAlugado"
      height={height}
      style={{ height, width: "auto", display: "inline-block" }}
      className={className}
      draggable={false}
    />
  );
}
