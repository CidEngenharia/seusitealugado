type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeConfig = {
  sm: { height: 32 },
  md: { height: 48 },
  lg: { height: 72 },
};

export default function LogoSeusiteAlugado({
  size = "md",
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