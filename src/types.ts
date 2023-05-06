export type Maybe<T> = T | null;

export interface DocumentWithFullscreen extends HTMLDocument {
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => void;
}

export interface DocumentElementWithFullscreen extends HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
}

export type ModalContainer = HTMLDivElement & {
  modal?: {
    show: (storyId?: TimelineItem['id']) => void;
    next: () => void;
    close: () => void;
  };
  slideWidth?: number;
  slideHeight?: number;
  transitionEndEvent?: boolean;
};

export type TransitionElement = HTMLElement & {
  transitionEndEvent?: boolean;
};

export type StoryItem = {
  id?: Maybe<string>;
  type?: Maybe<string>;
  length?: Maybe<number>;
  loop?: Maybe<boolean>;
  src?: Maybe<string>;
  preview?: Maybe<string>;
  link?: Maybe<string>;
  linkText?: Maybe<string>;
  time?: Maybe<string | Date | number>;
  seen?: Maybe<boolean>;
  [customKey: string]: unknown;
};

export type TimelineItem = {
  id?: Maybe<string>;
  photo?: Maybe<string>;
  name?: Maybe<string>;
  link?: Maybe<string>;
  lastUpdated?: Maybe<string | Date | number>;
  time?: Maybe<string | Date | number>;
  items?: StoryItem[];
  currentItem?: Maybe<number>;
  currentPreview?: Maybe<string>;
  seen?: Maybe<boolean>;
  [customKey: string]: unknown;
};

export type Templates = {
  timelineItem: (itemData: TimelineItem) => string;
  timelineStoryItem: (itemData: StoryItem) => string;
  viewerItem: (storyData: TimelineItem, currentItem: StoryItem) => string;
  viewerItemPointer: (
    index: number,
    currentIndex: number,
    item: StoryItem
  ) => string;
  viewerItemPointerProgress: (style: string) => string;
  viewerItemBody: (
    index: number,
    currentIndex: number,
    item: StoryItem
  ) => string;
};

export type Callbacks = {
  onOpen: (storyId: string, callback: () => void) => void;
  onView: (storyId: string, callback?: () => void) => void;
  onEnd: (storyId: string, callback: () => void) => void;
  onClose: (storyId: string, callback: () => void) => void;
  onDataUpdate: (data: StoriesTimeline, callback: () => void) => void;
  onNextItem: (
    storyId: string,
    nextStoryId: string,
    callback: () => void
  ) => void;
  onNavigateItem: (
    storyId: string,
    nextStoryId: string,
    callback: () => void
  ) => void;
};

export type Language = {
  unmute: string;
  keyboardTip: string;
  visitLink: string;
  time: {
    ago: string;
    hour: string;
    hours: string;
    minute: string;
    minutes: string;
    fromnow: string;
    seconds: string;
    yesterday: string;
    tomorrow: string;
    days: string;
  };
};

export type StoriesTimeline = TimelineItem[];

export type Options = {
  rtl?: boolean;
  skin?: string;
  avatars?: boolean;
  stories: StoriesTimeline;
  backButton?: boolean;
  backNative?: boolean;
  paginationArrows?: boolean;
  previousTap?: boolean;
  autoFullScreen?: boolean;
  openEffect?: boolean;
  cubeEffect?: boolean;
  list?: boolean;
  localStorage?: boolean;
  callbacks?: Callbacks;
  language?: Language;
  template?: Templates;
  reactive?: boolean;
  [customKey: string]: unknown;
};

export type ZuckObject = {
  id: string;
  hasModal?: boolean;
  data: TimelineItem[];
  option: <T extends keyof Options>(name: T) => Options[T];
  callback: <C extends keyof Callbacks>(name: C) => Callbacks[C];
  template: <T extends keyof Templates>(name: T) => Templates[T];
  language: <L extends keyof Language>(name: L) => Language[L];
  add: (data: TimelineItem, append?: boolean) => void;
  update: (data: TimelineItem, append?: boolean) => void;
  addItem: (storyId: string, data: TimelineItem, append?: boolean) => void;
  removeItem: (storyId: string, itemId: string) => void;
  nextItem: (storyId?: string, event?: Event) => void;
  navigateItem: (storyId?: string, event?: Event) => void;
  next: () => void;
  remove: (storyId: string) => void;
  findStoryIndex: (storyId: string) => number;

  saveLocalData?: <T>(key: string, data: T) => void;
  getLocalData?: <T>(key: string) => T | undefined;
  internalData: {
    currentStory?: TimelineItem['id'];
    currentVideoElement?: Maybe<HTMLVideoElement>;
    seenItems?: {
      [keyName: string]: boolean;
    };
  };

  updateStorySeenPosition: () => void;
  playVideoItem: (
    storyViewer?: Maybe<HTMLElement>,
    elements?: NodeListOf<Element>,
    unmute?: Event
  ) => void;
  pauseVideoItem: () => void;
  unmuteVideoItem: (
    video: HTMLVideoElement,
    storyViewer?: Maybe<HTMLElement>
  ) => void;
};

export type Zuck = (timeline: HTMLElement, options?: Options) => ZuckObject;
