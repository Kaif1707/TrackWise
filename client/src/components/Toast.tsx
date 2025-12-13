import { useEffect } from "react";
import "./Toast.css";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}
