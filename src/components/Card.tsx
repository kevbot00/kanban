import React from 'react';

const Card: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="cursor-grab rounded-lg bg-white p-3 text-sm text-slate-700 shadow-sm hover:shadow-md">
      {title}
    </div>
  )
}

export default Card;
