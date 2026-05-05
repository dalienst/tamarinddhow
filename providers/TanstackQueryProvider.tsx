"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60000 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default TanstackQueryProvider;
