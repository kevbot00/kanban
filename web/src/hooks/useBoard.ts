import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

const useBoard = (id: string) => {
  const queryClient = useQueryClient();
  const [selectedCardId, setSelectedCard] = useState<any>(null);
  const sourceParentRef = useRef<Element | null>(null);

  const { mutate: moveCardMutation } = useMutation({
    mutationFn: async ({
      cardId,
      toColumnId,
      toIndex,
    }: {
      cardId: string;
      toColumnId: string;
      toIndex: number;
    }) => {
      const resp = await fetch(`/api/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toColumnId, toIndex }),
      });
      if (!resp.ok) throw new Error('Failed to move card');

      return resp.json();
    },
    onMutate:  ({ cardId, toColumnId, toIndex }) => {
       queryClient.cancelQueries({ queryKey: ['board', id] });
      const previous = queryClient.getQueryData(['board', id]);
      queryClient.setQueryData(['board', id], (old: any) => {
        return applyMove(old, cardId, toColumnId, toIndex);
      });

      return { previous };
    },
    onError: (error, variables, context) => {
      console.error('Error moving card:', error);
      if (context?.previous) {
        queryClient.setQueryData(['board', id], context.previous);
      }
    },
  });

  const { data: board } = useQuery({
    queryKey: ['board', id],
    queryFn: async () => {
      const resp = await fetch(`/api/boards/${id}`);
      if (!resp.ok) {
        throw new Error('Failed to fetch board');
      }
      return resp.json();
    },
  });

  const applyMove = (
    board: any,
    cardId: string,
    toColumnId: string,
    toIndex: number,
  ) => {
    if (!board) return board;

    const fromCol = board.columns.find((col: any) =>
      col.cards.some((c: any) => c.id === cardId),
    );
    if (!fromCol) return board;

    const card = fromCol.cards.find((c: any) => c.id === cardId);

    return {
      ...board,
      columns: board.columns.map((col: any) => {
        if (col.id === fromCol.id && col.id === toColumnId) {
          const without = col.cards.filter((c: any) => c.id !== cardId);
          return {
            ...col,
            cards: [
              ...without.slice(0, toIndex),
              card,
              ...without.slice(toIndex),
            ],
          };
        }
        if (col.id === fromCol.id) {
          return {
            ...col,
            cards: col.cards.filter((c: any) => c.id !== cardId),
          };
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

  const moveCard = (cardId: string, toColumnId: string, toIndex: number) => {
    moveCardMutation({ cardId, toColumnId, toIndex });
  };

  const handleDragStart = (event: any) => {
    sourceParentRef.current =
      event.operation.source?.element?.parentElement ?? null;
  };

  const handleDragEnd = (event: any) => {
    /**
     * NOTE: Workaround for issues with 'OptimisticSortingPlugin' mutating
     * the raw DOM, and causing React errors on re-render. We reset the
     * source to its pre-drag parent before updating the state, and use
     * 'flushSync' to hide the sneaky DOM change. https://github.com/clauderic/dnd-kit/issues/1747#issuecomment-4544518742
     */
    const sourceElement = event.operation.source?.element;
    const prevParent = sourceParentRef.current;
    sourceParentRef.current = null;

    if (
      sourceElement &&
      prevParent &&
      sourceElement.parentElement !== prevParent
    ) {
      prevParent.appendChild(sourceElement);
    }

    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source) return;

    const toColumnId = String(target?.group ?? target?.id ?? source.group);
    const toIndex = typeof target?.index === 'number' ? target.index : 0;

    flushSync(() => {
      moveCard(String(source.id), toColumnId, toIndex);
    });
  };

  const openCard = (id: string) => {
    setSelectedCard(id);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  return {
    columns: board?.columns ?? [],
    handleDragStart,
    handleDragEnd,
    openCard,
    selectedCardId,
    closeCard,
  };
};

export default useBoard;
