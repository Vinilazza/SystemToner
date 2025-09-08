import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import QueryProvider from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";
import App from "./App";
import AuthProvider from "./providers/AuthProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <QueryProvider>
        <AuthProvider>
          <App />
          <Toaster richColors closeButton position="top-right" />{" "}
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
