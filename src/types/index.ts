export type TechniqueType = 'frame' | 'submission' | 'position' | 'escape';

export interface Technique {
    id: string;
    name: string;
    description: string;
    type: TechniqueType;
    images: string[];
    connectedTechniques: string[]; // IDs of techniques this can lead to
}

export type BeltColor = 'white' | 'blue' | 'purple' | 'brown' | 'black';
export type MarkedStatus = 'favorite' | 'currently learning' | 'to learn' | 'error prone';

export interface UserProfile {
    uid: string;
    name: string;
    belt: BeltColor;
    stripes: number; // 1-5
    notes: string;
    markedTechniques: Record<string, MarkedStatus>; // techniqueId -> status
}

export interface JournalEntry {
    id: string;
    userId: string;
    date: string; // ISO string
    comment: string;
    techniqueIds: string[];
}
