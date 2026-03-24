import { useState, useEffect } from 'react';

const MODAL_SHOWN_KEY = 'lead_modal_shown';
const SCROLL_THRESHOLD = 0.5;

const OPEN_MODAL_EVENT = 'open-lead-modal';
const CLOSE_MODAL_EVENT = 'close-lead-modal';

export function useLeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [formType, setFormType] = useState<'demo' | 'custom_build'>('custom_build');

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.formType) {
        setFormType(customEvent.detail.formType);
      }
      setIsOpen(true);
    };
    const handleClose = () => setIsOpen(false);

    window.addEventListener(OPEN_MODAL_EVENT, handleOpen);
    window.addEventListener(CLOSE_MODAL_EVENT, handleClose);

    const shown = localStorage.getItem(MODAL_SHOWN_KEY);
    if (shown) {
      setHasShown(true);
    } else {
      const handleScroll = () => {
        const scrollPercentage =
          (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;

        if (scrollPercentage >= SCROLL_THRESHOLD && !hasShown) {
          setIsOpen(true);
          setHasShown(true);
          localStorage.setItem(MODAL_SHOWN_KEY, 'true');
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener(OPEN_MODAL_EVENT, handleOpen);
        window.removeEventListener(CLOSE_MODAL_EVENT, handleClose);
      };
    }

    return () => {
      window.removeEventListener(OPEN_MODAL_EVENT, handleOpen);
      window.removeEventListener(CLOSE_MODAL_EVENT, handleClose);
    };
  }, [hasShown]);

  const openModal = (type?: 'demo' | 'custom_build' | any) => {
    const effectiveType = typeof type === 'string' ? type : 'demo';
    window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT, { detail: { formType: effectiveType } }));
  };

  const closeModal = () => {
    window.dispatchEvent(new Event(CLOSE_MODAL_EVENT));
  };

  return { isOpen, formType, openModal, closeModal };
}
