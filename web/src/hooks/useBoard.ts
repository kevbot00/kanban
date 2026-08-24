import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import applyMove from '../lib/applyMove';
import type { Board, Card, MoveCardInput } from '../types';

const useBoard = (id: string) => {
  const queryClient = useQueryClient();
  const [selectedCardId, setSelectedCard] = useState<string | null>(null);
  const sourceParentRef = useRef<Element | null>(null);

  const boardKey = ['board', id];

  const { data: board, isLoading, error } = useQuery<Board>({
    queryKey: boardKey,
    queryFn: async () => {
      const resp = await fetch(`/api/boards/${id}`);
      if (!resp.ok) throw new Error(`Failed to fetch board: ${resp.status}`);
      return resp.json() as Promise<Board>;
    },
  });

  const { mutate: moveCardMutation } = useMutation<
    Card,
    Error,
    MoveCardInput,
    { previous: Board | undefined }
  >({
    mutationFn: async ({ cardId, toColumnId, toIndex }) => {
      const resp = await fetch(`/api/cards/${cardId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toColumnId, toIndex }),
      });
      if (!resp.ok) throw new Error(`Failed to move card: ${resp.status}`);
      return resp.json() as Promise<Card>;
    },
    onMutate: ({ cardId, toColumnId, toIndex }) => {
      queryClient.cancelQueries({ queryKey: boardKey });

      const previous = queryClient.getQueryData<Board>(boardKey);
      queryClient.setQueryData<Board | undefined>(boardKey, (old) =>
        applyMove(old, cardId, toColumnId, toIndex),
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      console.error('Error moving card:', error);
      if (context?.previous) {
        queryClient.setQueryData(boardKey, context.previous);
      }
    },
  });

  const moveCard = (cardId: string, toColumnId: string, toIndex: number) => {
    moveCardMutation({ cardId, toColumnId, toIndex });
  };

  const handleDragStart = (event: DragStartEvent) => {
    sourceParentRef.current =
      event.operation.source?.element?.parentElement ?? null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

    const targetGroup = isSortable(target) ? target.group : undefined;
    const targetIndex = isSortable(target) ? target.index : undefined;
    const sourceGroup = isSortable(source) ? source.group : undefined;

    const toColumnId = String(targetGroup ?? target?.id ?? sourceGroup);
    const toIndex = typeof targetIndex === 'number' ? targetIndex : 0;

    flushSync(() => {
      moveCard(String(source.id), toColumnId, toIndex);
    });
  };

  const openCard = (cardId: string) => setSelectedCard(cardId);
  const closeCard = () => setSelectedCard(null);

  return {
    columns: board?.columns ?? [],
    isLoading,
    error,
    handleDragStart,
    handleDragEnd,
    openCard,
    selectedCardId,
    closeCard,
  };
};

export default useBoard;
