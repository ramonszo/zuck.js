import { Language, Maybe, ModalContainer, TransitionElement } from './types';
export declare const hasWindow: () => boolean;
export declare const safeNum: (num?: null | number | string) => number;
export declare const onAnimationEnd: (el: HTMLElement, func: (e: Event) => void) => void;
export declare const onTransitionEnd: (el: TransitionElement | ModalContainer, func: (e: Event) => void) => void;
export declare const prepend: (parent?: HTMLElement | null, child?: HTMLElement | null) => void;
export declare const generateId: () => string;
export declare const findPos: (obj?: Maybe<HTMLElement>, offsetY?: number, offsetX?: number, stop?: Maybe<HTMLElement>) => [number, number];
export declare const timeAgo: (time?: Maybe<number | string | Date>, languageObject?: Language) => string;
