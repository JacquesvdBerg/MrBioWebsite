type DnaHelixProps = {
  className?: string;
  rungs?: number;
  height?: number;
  width?: number;
};

export function DnaHelix({
  className = "",
  rungs = 18,
  height = 420,
  width = 120,
}: DnaHelixProps) {
  return (
    <div
      className={`helix ${className}`}
      style={{
        ["--helix-h" as string]: `${height}px`,
        ["--helix-w" as string]: `${width}px`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: rungs }, (_, index) => (
        <span
          key={index}
          className="helix-rung"
          style={{ ["--i" as string]: String(index) }}
        >
          <span className="helix-bar" />
        </span>
      ))}
    </div>
  );
}
