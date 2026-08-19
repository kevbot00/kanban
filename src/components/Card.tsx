import React from "react";
import { useSortable } from "@dnd-kit/react/sortable";

const Card: React.FC<{ id: string; title: string; index: number, group: string }> = ({ id, title, index, group}) => {
  const { ref } = useSortable({
    id,
    index,
    group,
    type: 'card',
    accept: 'card'
  });

  return (
    <div
      ref={ref}
      className="cursor-grab rounded-lg bg-white p-3 text-sm text-slate-700 shadow-sm hover:shadow-md"
    >
      {title}
    </div>
  );
};

export default Card;
