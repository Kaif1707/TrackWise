import React from "react";
import "./SkeletonLoader.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export default function SkeletonLoader({
  width = "100%",
  height = "20px",
  borderRadius = "6px",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}
