import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { openNewTaskModal, openShortcutsModal } = useApp();
  const lastKeyRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable element
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Do not trigger if Ctrl/Meta/Alt is pressed (except ? or /)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const now = Date.now();
      const timeSinceLastKey = now - lastKeyRef.current.time;

      // Handle 'g' sequence navigation
      if (lastKeyRef.current.key === 'g' && timeSinceLastKey < 1000) {
        lastKeyRef.current = { key: '', time: 0 };
        if (key === 'd') {
          event.preventDefault();
          navigate('/');
          return;
        }
        if (key === 'a') {
          event.preventDefault();
          navigate('/assignments');
          return;
        }
        if (key === 'p') {
          event.preventDefault();
          navigate('/planner');
          return;
        }
        if (key === 'r') {
          event.preventDefault();
          navigate('/progress');
          return;
        }
        if (key === 's') {
          event.preventDefault();
          navigate('/settings');
          return;
        }
      }

      if (key === 'g') {
        lastKeyRef.current = { key: 'g', time: now };
        return;
      }

      lastKeyRef.current = { key, time: now };

      // Single key shortcuts
      if (event.key === '?') {
        event.preventDefault();
        openShortcutsModal();
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        const searchInput = document.getElementById('assignment-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        } else {
          // If on another page, navigate to /assignments and focus search after render
          navigate('/assignments');
          setTimeout(() => {
            const input = document.getElementById('assignment-search-input') as HTMLInputElement | null;
            input?.focus();
          }, 100);
        }
        return;
      }

      if (key === 'n') {
        event.preventDefault();
        openNewTaskModal();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, openNewTaskModal, openShortcutsModal]);
}
