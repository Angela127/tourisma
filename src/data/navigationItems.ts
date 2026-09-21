import {
  House,
  ChartNoAxesCombined,
  Landmark,
  Bed,
  Route,
  HeartPulse,
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
    id: 'tourism-assets',
    label: 'Tourism Assets',
    icon: Landmark,
  },
  {
    id: 'accommodation',
    label: 'Accommodation',
    icon: Bed,
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Route,
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: HeartPulse,
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

