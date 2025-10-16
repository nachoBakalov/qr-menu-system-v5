import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './themes';
import AppRouter from './router';
import './styles/main.scss';

// Създаване на Query Client за API state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="universal">
        <AppRouter />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
