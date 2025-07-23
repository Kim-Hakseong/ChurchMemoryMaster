import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('Service Worker registered successfully');
      })
      .catch(() => {
        console.log('Service Worker registration failed');
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
