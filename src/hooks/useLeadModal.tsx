import { useState, useEffect } from 'react';

const MODAL_SHOWN_KEY = 'lead_modal_shown';
const SCROLL_THRESHOLD = 0.5;

export function useLeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(MODAL_SHOWN_KEY);
    if (shown) {
      setHasShown(true);
      return;
    }

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
    };
  }, [hasShown]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return { isOpen, openModal, closeModal };
}
