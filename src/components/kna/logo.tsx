import logoAsset from "@/assets/urithi-logo.png";

export function UrithiLogo({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  return (
    <img
      src={logoAsset}
      alt={variant === "mark" ? "Urithi" : "Urithi — by Kenya News Agency"}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
