import type { IconNode } from 'lucide';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: IconNode;
  badge?: string | number;
}

export type NavItemClickHandler = (id: string) => void;
