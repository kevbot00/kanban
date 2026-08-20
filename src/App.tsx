import Board from './components/Board';

function App() {
  return (
    <main className="flex h-screen flex-col bg-slate-100">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">Kanban Board</h1>
      </header>
      <Board id={'board-1'}/>
    </main>
  )
}

export default App
