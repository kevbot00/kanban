import { useState, useEffect } from 'react';

export const mockBoard = {
  id: 'board-1',
  columns: [
    {
      id: '1',
      title: 'To Do',
      cards: [
        { id: 'card-5', title: 'Persist board to localStorage' },
        { id: 'card-6', title: 'Write Playwright drag test' },
        { id: 'card-7', title: 'Deploy to AWS' },
      ],
    },
    {
      id: '2',
      title: 'In Progress',
      cards: [
        { id: 'card-3', title: 'Build board, column, and card components' },
        { id: 'card-4', title: 'Wire up dnd-kit sensors' },
      ],
    },
    {
      id: '3',
      title: 'Done',
      cards: [
        { id: 'card-1', title: 'Scaffold Vite + React + TypeScript' },
        { id: 'card-2', title: 'Add Tailwind' },
      ],
    },
  ],
};

const useBoard = (id: string) => {
  const [board, setBoard] = useState({});
  const [columns, setColumns] = useState([] as any[]);


  useEffect(() => {
    // Mock fetching board data from an API
    setBoard(mockBoard);
    setColumns(mockBoard.columns);
  }, [])
  
  return {
    columns
  }
}

export default useBoard