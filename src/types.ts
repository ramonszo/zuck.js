export type Maybe<T> = T | null;

export type StoryItem = {
  id?: Maybe<string>;
  type?: Maybe<string>;
  length?: Maybe<number>;
  src?: Maybe<string>;
  preview?: Maybe<string>;
  link?: Maybe<string>;
  linkText?: Maybe<string>;
  time?: Maybe<string>;
  seen?: Maybe<boolean>;
  [customKey: string]: any;
};

export type TimelineItem = {
  id?: Maybe<string>;
  photo?: Maybe<string>;
  name?: Maybe<string>;
  link?: Maybe<string>;
  lastUpdated?: Maybe<string>;
  items: StoryItem[];
  currentItem?: Maybe<number>;
  currentPreview?: Maybe<string>;
  seen?: Maybe<boolean>;
  [customKey: string]: any;
};

export type ModalOptions = {
  backNative?: boolean;
  autoFullScreen?: boolean;
  openEffect?: boolean;
  rtl?: boolean;
  callbacks: {
    onView: (storyId: string) => void;
    onOpen: (storyId: string, callback: () => void) => void;
    onEnd: (storyId: string, callback: () => void) => void;
    onClose: (storyId: string, callback: () => void) => void;
  };
};

export type ModalContainer = HTMLDivElement & {
  slideWidth?: number;
  slideHeight?: number;
  transitionEndEvent?: boolean;
}

export type TransitionElement = HTMLElement & {
  transitionEndEvent?: boolean;
}

export type Callbacks = {
  onOpen: (storyId: number, callback: () => void) => void;
  onView: (storyId: number) => void;
  onEnd: (storyId: number, callback: () => void) => void;
  onClose: (storyId: number, callback: () => void) => void;
  onNextItem: (
    storyId: number,
    nextStoryId: number,
    callback: () => void
  ) => void;
  onNavigateItem: (
    storyId: number,
    nextStoryId: number,
    callback: () => void
  ) => void;
}

export type OptionsLanguage = {
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
  }
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
  language?: OptionsLanguage;
  template?: {
    timelineItem: (itemData: TimelineItem) => string;
    timelineStoryItem: (itemData: StoryItem) => string;
    viewerItem: (storyData: StoryItem, currentStoryItem: StoryItem) => string;
    viewerItemPointer: (index: number, currentIndex: number, item: StoryItem) => string;
    viewerItemBody: (index: number, currentIndex: number, item: StoryItem) => string;
  };
  [customKey: string]: any;
}

export type Zuck = {
  hasModal: boolean;
  internalData: {
    currentStory: TimelineItem;
    seenItems: string[];
  };
  data: TimelineItem[];
  addItem: (storyId: string, data: TimelineItem, append?: boolean) => void;
  removeItem: (storyId: string, itemId: string) => void;
  nextItem : (storyId: string) => void;
  navigateItem: (storyId: string, itemId: string) => void;
  next: () => void;
  remove: (storyId: string) => void;
};
