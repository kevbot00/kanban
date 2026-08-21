import React from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import Column from './Column';
import useBoard from '../hooks/useBoard';
import CardModal from './CardModal';

const Board: React.FC<{ id: string }> = ({ id }) => {
  const {
    columns,
    handleDragStart,
    handleDragEnd,
    openCard,
    selectedCardId,
    closeCard,
  } = useBoard(id);

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className='flex min-h-0 flex-1 gap-4 overflow-x-auto p-6'>
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            openCard={openCard}
          />
        ))}
      </div>
      <CardModal id={selectedCardId} onClose={closeCard} />
    </DragDropProvider>
  );
};

export default Board;
