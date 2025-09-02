import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/toaster"; // do shadcn
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <QueryProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
