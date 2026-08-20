import { useEffect, useRef } from 'react';

const CardModal: React.FC<{
  card: { id: string; title: string } | null;
  onClose: () => void;
}> = ({ card, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (card && !dialog.open) dialog.showModal();
    if (!card && dialog.open) dialog.close();
  }, [card]);

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
                <p className='mt-2 text-sm text-slate-400'>
                  Add a description…
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};

export default CardModal;
