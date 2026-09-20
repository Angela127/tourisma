import {
  House,
  ChartNoAxesCombined,
  Road,
  Leaf,
  MapPin,
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
];

