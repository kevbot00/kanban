import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Card } from '../types';

const useCardModal = (id: string) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (id && !dialog.open) dialog.showModal();
    if (!id && dialog.open) dialog.close();
  }, [id]);

  const { data: card } = useQuery<Card>({
    queryKey: ['card', id],
    queryFn: async () => {
      const resp = await fetch(`/api/cards/${id}`);
      if (!resp.ok) {
        throw new Error('Failed to fetch card');
      }
      return resp.json() as Promise<Card>;
    },
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (card) {
      setDescription(card.description ?? '');
    }
  }, [card]);

  const queryClient = useQueryClient();
  const { mutate: saveDescription } = useMutation<Card, Error, string>({
    mutationFn: async (newDescription: string) => {
      const resp = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription }),
      });
      if (!resp.ok) throw new Error('Failed to update description');
      return resp.json() as Promise<Card>;
    },
    onSuccess: (updatedCard) => {
      queryClient.setQueryData(['card', id], updatedCard);
      setIsEditingDescription(false);
      textAreaRef.current?.blur();
    },
    onError: (error) => {
      console.error('Error updating description:', error);
    },
  });

  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const onDescriptionBlur = () => {
    if (description !== (card?.description ?? '')) {
      onSaveDescription();
    }
    setIsEditingDescription(false);
  };

  const onSaveDescription = async () => {
    saveDescription(description);
    setIsEditingDescription(false);
  };

  const onCancelDescription = () => {
    setDescription(card?.description ?? '');
    setIsEditingDescription(false);
  };

  return {
    card,
    dialogRef,
    textAreaRef,
    setIsEditingDescription,
    onSaveDescription,
    onDescriptionBlur,
    isEditingDescription,
    description,
    onDescriptionChange,
    onCancelDescription,
  };
};

export default useCardModal;
