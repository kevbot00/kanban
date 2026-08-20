import React from "react";
import Card from "./Card";
import { useDroppable } from "@dnd-kit/react";
import useAddCard from "../hooks/useAddCard";

interface ColumnProps {
  id: string;
  title: string;
  cards: { id: string; title: string }[];
}

const Column: React.FC<ColumnProps> = ({ id, title, cards }) => {
  const { isAdding, startAdding, handleBlur, handleTitleChange, title: newCardTitle, handleSubmit, cancelAdding } = useAddCard();

  const { ref } = useDroppable({
    id,
    type: "column",
    accept: "card",
  });

  return (
    <div
      ref={ref}
      className="flex w-64 shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <h2 className="shrink-0 text-lg font-bold">{title}</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {cards.map((card, idx) => (
          <Card
            key={card.id}
            id={card.id}
            title={card.title}
            index={idx}
            group={id}
          />
        ))}
      {isAdding ? (
        <form className="mt-2" onSubmit={handleSubmit}>
          <input
            autoFocus
            value={newCardTitle}
            placeholder="Enter a title…"
            aria-label={`New card title for ${title}`}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                cancelAdding();
              }
            }}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-slate-500"
          />
        </form>
      ) : (
        <button
          type="button"
          aria-label={`Add card to ${title}`}
          className="mt-2 w-full rounded px-2 py-1.5 text-center text-sm text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          onClick={startAdding}
        >
          +
        </button>
      )}
      </div>

    </div>
  );
};

export default Column;
