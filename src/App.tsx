import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthInitializer } from './hooks/use-auth';
import { AppRouter } from './routes';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css'
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function AuthInitializer({children}: {children: React.ReactNode}) {
  const isInitialized = useAuthInitializer();

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.svg" alt="SIMAKerja" className="h-16 animate-pulse" />
          <p className="text-sm text-gray-500">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <AppRouter />
        <Toaster 
          position='top-center'
        />
      </AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
