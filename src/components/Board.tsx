import React from 'react';
import Column from './Column';

const Board: React.FC = () => {
  return (
    <div className="flex items-start gap-4 overflow-x-auto p-6">
      <Column title="To Do" />
      <Column title="In Progress" />
      <Column title="Done" />
    </div>
  )
}

export default Board;
