import { QueryClient } from '@tanstack/query-core';
import Board from './components/Board';
import { QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <main className="flex h-screen flex-col bg-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">Kanban Board</h1>
      </header>
      <Board id={'00000000-0000-0000-0000-000000000001'}/>
    </main>
    </QueryClientProvider>
  )
}

export default App
