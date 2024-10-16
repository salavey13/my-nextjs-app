import { NavigationLink } from './navigationLinks';

export interface DynamicComponent extends NavigationLink {
  componentPath: string;
}

export const dynamicComponents: DynamicComponent[] = [
  {
    href: '/customcomponent1',
    icon: 'Star',
    label: 'Custom 1',
    stageMask: 0b11111000,
    component: 'customComponent1',
    componentPath: 'components/CustomComponent1',
  },
  {
    href: '/customcomponent2',
    icon: 'Zap',
    label: 'Custom 2',
    stageMask: 0b11111000,
    component: 'customComponent2',
    componentPath: 'components/CustomComponent2',
  },
  {
    href: '/customcomponent3',
    icon: 'Sun',
    label: 'Custom 3',
    stageMask: 0b11111000,
    component: 'customComponent3',
    componentPath: 'components/CustomComponent3',
  },
];
