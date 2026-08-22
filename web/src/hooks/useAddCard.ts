import { useState } from "react";

const useAddCard = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const startAdding = () => {
    setIsAdding(true);
  }

  const handleBlur = () => {
    setIsAdding(false);
  }

  const cancelAdding = () => {
    setTitle('');
    setIsAdding(false);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

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