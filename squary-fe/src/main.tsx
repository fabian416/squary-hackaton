import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./tailwind.css";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia } from "@reown/appkit/networks";

// 1. Setup QueryClient
const queryClient = new QueryClient();

// 2. Get your projectId from Reown Cloud
const projectId = process.env.VITE_PROJECT_ID || "provide a project id"; 

// 3. Define metadata (opcional)
const metadata = {
  name: "Squary",
  description: "Simplify your crypto payments",
  url: "https://squary.xyz",
  icons: ["https://example.com/icon.png"],
};

// 4. Set networks
const networks = [baseSepolia ];

// 5. Create the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 6. Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks:[baseSepolia],
  projectId,
  metadata,
  features: {
    analytics: true, // Activa o desactiva el análisis
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

// Render Application
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppKitProvider>
      <App />
    </AppKitProvider>
  </React.StrictMode>
);