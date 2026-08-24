export type Card = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
};

export type Column = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
};

export type Board = {
  id: string;
  slug: string;
  title: string;
  columns: Column[];
};

/** Payload for POST /api/cards/:id/move */
export type MoveCardInput = {
  cardId: string;
  toColumnId: string;
  toIndex: number;
};
