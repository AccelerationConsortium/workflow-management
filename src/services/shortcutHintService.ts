export interface ShortcutHint {
  key: string;
  description: string;
  context: string;
  category: 'navigation' | 'editing' | 'workflow' | 'visualization';
}

export class ShortcutHintService {
  private readonly shortcuts: ShortcutHint[] = [
    {
      key: 'Ctrl/⌘ + D',
      description: 'Duplicate selected node',
      context: 'node-selected',
      category: 'editing'
    },
    {
      key: 'Delete',
      description: 'Remove selected elements',
      context: 'node-selected',
      category: 'editing'
    },
    {
      key: 'Ctrl/⌘ + G',
      description: 'Group selected nodes',
      context: 'multiple-nodes-selected',
      category: 'workflow'
    },
    {
      key: 'Space',
      description: 'Toggle node details',
      context: 'node-selected',
      category: 'navigation'
    },
    {
      key: 'Ctrl/⌘ + /',
      description: 'Show all shortcuts',
      context: 'global',
      category: 'navigation'
    }
  ];

  getContextualHints(context: string): ShortcutHint[] {
    return this.shortcuts.filter(
      hint => hint.context === context || hint.context === 'global'
    );
  }

  getHintsByCategory(category: string): ShortcutHint[] {
    return this.shortcuts.filter(hint => hint.category === category);
  }

  getAllShortcuts(): Record<string, ShortcutHint[]> {
    return this.shortcuts.reduce((acc, hint) => {
      if (!acc[hint.category]) {
        acc[hint.category] = [];
      }
      acc[hint.category].push(hint);
      return acc;
    }, {} as Record<string, ShortcutHint[]>);
  }
} 