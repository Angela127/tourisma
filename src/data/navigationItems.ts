import {
  House,
  ChartNoAxesCombined,
  Road,
  Leaf,
  MapPin,
  FileText,
  Database,
  Settings,
} from 'lucide';
import type { NavItemConfig } from '../types/navigation';

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: House,
  },
  {
    id: 'tourism-demand',
    label: 'Tourism Demand',
    icon: ChartNoAxesCombined,
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: Road,
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    icon: Leaf,
  },
  {
    id: 'destinations',
    label: 'Destinations',
    icon: MapPin,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
  },
  {
    id: 'data-sources',
    label: 'Data Sources',
    icon: Database,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
];

