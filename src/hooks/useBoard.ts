import { useState, useRef } from "react";
import { flushSync } from "react-dom";

export const mockBoard = {
  id: "board-1",
  columns: [
    {
      id: "1",
      title: "To Do",
      cards: [
        { id: "card-5", title: "Persist board to localStorage" },
        { id: "card-6", title: "Write Playwright drag test" },
        { id: "card-7", title: "Deploy to AWS" },
      ],
    },
    {
      id: "2",
      title: "In Progress",
      cards: [
        { id: "card-3", title: "Build board, column, and card components" },
        { id: "card-4", title: "Wire up dnd-kit sensors" },
      ],
    },
    {
      id: "3",
      title: "Done",
      cards: [
        { id: "card-1", title: "Scaffold Vite + React + TypeScript" },
        { id: "card-2", title: "Add Tailwind" },
      ],
    },
  ],
};

const useBoard = (_id: string) => {
  const [columns, setColumns] = useState(mockBoard.columns);
  const sourceParentRef = useRef<Element | null>(null);

  const moveCard = (cardId: string, toColumnId: string, toIndex: number) => {
    setColumns((prev) => {
      const fromCol = prev.find((col) => col.cards.some((c) => c.id === cardId));
      if (!fromCol) return prev;

      const currentIndex = fromCol.cards.findIndex((c) => c.id === cardId);
      if (fromCol.id === toColumnId && currentIndex === toIndex) return prev;

      const card = fromCol.cards[currentIndex];

      return prev.map((col) => {
        if (col.id === fromCol.id && col.id === toColumnId) {
          const without = col.cards.filter((c) => c.id !== cardId);
          return {
            ...col,
            cards: [...without.slice(0, toIndex), card, ...without.slice(toIndex)],
          };
        }
        if (col.id === fromCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        if (col.id === toColumnId) {
          return {
            ...col,
            cards: [...col.cards.slice(0, toIndex), card, ...col.cards.slice(toIndex)],
          };
        }
        return col;
      });
    });
  };

  const handleDragStart = (event: any) => {
    sourceParentRef.current =
      event.operation.source?.element?.parentElement ?? null;
  };

  const handleDragEnd = (event: any) => {
    /**
     * NOTE: Workaround for issues with "OptimisticSortingPlugin" mutating
     * the raw DOM, and causing React errors on re-render. We reset the
     * source to its pre-drag parent before updating the state, and use
     * "flushSync" to hide the sneaky DOM change. https://github.com/clauderic/dnd-kit/issues/1747#issuecomment-4544518742
     */
    const sourceElement = event.operation.source?.element;
    const prevParent = sourceParentRef.current;
    sourceParentRef.current = null;

    if (sourceElement && prevParent && sourceElement.parentElement !== prevParent) {
      prevParent.appendChild(sourceElement);
    }

    if (event.canceled) return;

    const { source } = event.operation;
    if (!source) return;

    flushSync(() => {
      moveCard(String(source.id), String(source.group), source.index);
    });
  };

  return {
    columns,
    handleDragStart,
    handleDragEnd,
  };
};

export default useBoard;
