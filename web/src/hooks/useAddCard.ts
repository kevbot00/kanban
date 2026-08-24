import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Board, Card } from '../types';

const useAddCard = (columnId: string) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const { mutate: addCard } = useMutation<Card, Error, string>({
    mutationFn: async (newTitle) => {
      const resp = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId,
          title: newTitle,
        }),
      });
      if (!resp.ok) throw new Error(`Failed to add card: ${resp.status}`);
      return resp.json() as Promise<Card>;
    },
    onSuccess: (newCard) => {
      queryClient.setQueriesData<Board | undefined>(
        { queryKey: ['board'] },
        (old) =>
          old && {
            ...old,
            columns: old.columns.map((col) =>
              col.id === newCard.columnId
                ? { ...col, cards: [...col.cards, newCard] }
                : col,
            ),
          },
      );
    },
    onError: (error) => {
      console.error('Error adding card:', error);
    },
  });

  const startAdding = () => {
    setIsAdding(true);
  };

  const save = () => {
    const trimmed = title.trim();
    if (trimmed) addCard(trimmed);
    setTitle('');
  };

  const handleBlur = () => {
    save();
    setIsAdding(false);
  };

  const cancelAdding = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    save();
  };

  return {
    isAdding,
    title,
    startAdding,
    handleBlur,
    handleTitleChange,
    handleSubmit,
    cancelAdding,
  };
};

export default useAddCard;
