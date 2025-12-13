import "./DotSpinner.css";

export default function DotSpinner({ size = "2.8rem" }: { size?: string }) {
  return (
    <div className="dot-spinner" style={{ ["--uib-size" as any]: size }}>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  );
}
