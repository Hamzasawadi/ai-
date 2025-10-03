export enum Tab {
    DesignStudio = 'Design Studio',
    Results = 'Results'
}

export enum SpaceType {
    LivingRoom = 'Living Room',
    Bedroom = 'Bedroom',
    Kitchen = 'Kitchen',
    Office = 'Office',
    Bathroom = 'Bathroom',
    Other = 'Other'
}

export interface ImageData {
    base64: string;
    mimeType: string;
}

export interface MoodboardOption {
    id: string;
    name: string;
}

export interface DesignVariation {
    image: string;
    description: string;
}
