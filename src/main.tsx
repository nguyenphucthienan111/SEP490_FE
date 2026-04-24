import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AIChatBubble } from "@/components/ai/AIChatBubble";
import { SupportChatBubble } from "@/components/support/SupportChatBubble";
import { setupSofascoreImageFallback } from "@/utils/sofascoreImages";

// Global fallback: khi ảnh từ BE proxy bị 403, tự fetch từ Sofascore trực tiếp + cache Cloudinary
setupSofascoreImageFallback();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basename}>
    <App />
    <SupportChatBubble />
    <AIChatBubble />
    <Toaster 
      position="top-right"
      offset="80px"
      duration={3000}
      toastOptions={{
        classNames: {
          success: 'bg-green-500 text-white border-green-600',
          error: 'bg-red-500 text-white border-red-600',
        },
      }}
    />
  </BrowserRouter>,
);
