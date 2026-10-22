import React from 'react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { Keyboard } from 'lucide-react';

export const ShortcutsDialog: React.FC = () => {
  const { isShortcutsModalOpen, closeShortcutsModal } = useApp();

  const shortcutGroups = [
    {
      category: 'Navigation',
      items: [
        { keys: ['g', 'd'], desc: 'Go to Dashboard' },
        { keys: ['g', 'a'], desc: 'Go to Homework Manager' },
        { keys: ['g', 'p'], desc: 'Go to Study Planner' },
        { keys: ['g', 'r'], desc: 'Go to Academic Progress' },
        { keys: ['g', 's'], desc: 'Go to Settings' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['n'], desc: 'Create new assignment' },
        { keys: ['/'], desc: 'Focus assignment search box' },
        { keys: ['?'], desc: 'Open keyboard shortcuts guide' },
        { keys: ['Esc'], desc: 'Close dialog or modal' },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isShortcutsModalOpen}
      onClose={closeShortcutsModal}
      title="Keyboard Shortcuts"
      description="Navigate and manage your coursework quickly without touching your mouse."
      maxWidth="md"
    >
      <div className="space-y-6">
        {shortcutGroups.map((group) => (
          <div key={group.category}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              {group.category}
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                >
                  <span className="text-slate-700 dark:text-slate-300">{item.desc}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 text-xs font-mono font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 rounded-xl text-xs text-teal-800 dark:text-teal-300">
          <Keyboard className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Shortcuts are disabled while typing inside forms or text inputs.</span>
        </div>
      </div>
    </Modal>
  );
};
