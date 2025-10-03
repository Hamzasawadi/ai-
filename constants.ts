import { Tab, SpaceType, MoodboardOption } from './types';

export const TABS: Tab[] = [
    Tab.DesignStudio,
    Tab.Results
];

export const SPACE_TYPES: { value: SpaceType; label: string }[] = [
    { value: SpaceType.LivingRoom, label: 'Living Room' },
    { value: SpaceType.Bedroom, label: 'Bedroom' },
    { value: SpaceType.Kitchen, label: 'Kitchen' },
    { value: SpaceType.Office, label: 'Home Office' },
    { value: SpaceType.Bathroom, label: 'Bathroom' },
    { value: SpaceType.Other, label: 'Other' },
];

export const MOODBOARDS: MoodboardOption[] = [
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'bohemian', name: 'Bohemian' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'scandinavian', name: 'Scandinavian' },
    { id: 'mid-century', name: 'Mid-Century' },
    { id: 'coastal', name: 'Coastal' },
    { id: 'farmhouse', name: 'Farmhouse' },
    { id: 'custom', name: 'Upload Your Own' }
];
