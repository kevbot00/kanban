import type { Board } from '../types';

const applyMove = (
  board: Board | undefined,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): Board | undefined => {
  if (!board) return board;

  const fromCol = board.columns.find((col) =>
    col.cards.some((card) => card.id === cardId),
  );
  if (!fromCol) return board;

  const card = fromCol.cards.find((card) => card.id === cardId);
  if (!card) return board;

  return {
    ...board,
    columns: board.columns.map((col) => {
      if (col.id === fromCol.id && col.id === toColumnId) {
        const without = col.cards.filter((card) => card.id !== cardId);
        return {
          ...col,
          cards: [...without.slice(0, toIndex), card, ...without.slice(toIndex)],
        };
      }
      if (col.id === fromCol.id) {
        return { ...col, cards: col.cards.filter((card) => card.id !== cardId) };
      }
      if (col.id === toColumnId) {
        return {
          ...col,
          cards: [
            ...col.cards.slice(0, toIndex),
            card,
            ...col.cards.slice(toIndex),
          ],
        };
      }
      return col;
    }),
  };
};

export default applyMove;
