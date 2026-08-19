import React from 'react';

interface ColumnProps {
  title: string;
}

const Column: React.FC<ColumnProps> = ({ title }) => {
  return (
    <div className="flex-shrink-0 w-64 border border-slate-200 rounded-lg p-4 bg-slate-50">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          type="button"
          aria-label={`Add card to ${title}`}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-300 hover:text-slate-800"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default Column;