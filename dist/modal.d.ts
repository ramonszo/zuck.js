import { ZuckObject } from 'types';
export declare const modal: (zuck: ZuckObject) => {
    show: (storyId?: string) => void;
    next: () => void;
    close: () => void;
};
