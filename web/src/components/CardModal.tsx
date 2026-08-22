import React from 'react';
import useCardModal from '../hooks/useCardModal';

const CardModal: React.FC<{
  id: string;
  onClose: () => void;
}> = ({ id, onClose }) => {
  const {
    card,
    dialogRef,
    textAreaRef,
    description,
    isEditingDescription,
    onDescriptionChange,
    setIsEditingDescription,
    onDescriptionBlur,
    onSaveDescription,
    onCancelDescription,
  } = useCardModal(id);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className='m-auto w-[min(60rem,92vw)] overflow-hidden rounded-xl p-0 backdrop:bg-slate-900/40'
    >
      {card && (
        <div className='flex max-h-[85vh] min-h-[60vh] flex-col'>
          <div className='flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-3'>
            <h2 className='text-xl font-semibold text-slate-800'>
              {card.title}
            </h2>
            <button
              type='button'
              onClick={onClose}
              aria-label='Close'
              className='rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            >
              ✕
            </button>
          </div>

          <div className='flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-6 md:flex-row'>
            <div className='min-w-0 flex-1'>
              <section className=''>
                <h3 className='text-sm font-semibold text-slate-600'>
                  Description
                </h3>
                <div className='mt-2'>
                  <textarea
                    rows={6}
                    ref={textAreaRef}
                    onClick={() => setIsEditingDescription(true)}
                    onChange={onDescriptionChange}
                    value={description}
                    onBlur={onDescriptionBlur}
                    placeholder='Add description'
                    className='w-full resize-y rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-slate-500'
                  />
                </div>
                {isEditingDescription && (
                  <div className='mt-2 flex gap-2'>
                    <button
                      type='button'
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={onCancelDescription}
                      className='rounded bg-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-300'
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={onSaveDescription}
                      className='rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-800'
                    >
                      Save
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};

export default CardModal;
