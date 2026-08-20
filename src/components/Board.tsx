import React from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import Column from './Column';
import useBoard from '../hooks/useBoard';

const Board: React.FC<{ id: string }> = ({ id }) => {
  const { columns, handleDragStart, handleDragEnd } = useBoard(id);

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-6">
        {columns.map((column) => (
          <Column key={column.id} id={column.id} title={column.title} cards={column.cards} />
        ))}
      </div>
    </DragDropProvider>
  );
};

export default Board;
