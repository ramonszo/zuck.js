import { generateId, hasWindow, prepend, safeNum, timeAgo } from './utils';
import { loadOptions } from './options';
import { modal as ZuckModal } from './modal';

import {
  Maybe,
  StoriesTimeline,
  StoryItem,
  TimelineItem,
  Zuck as ZuckFunction,
  ZuckObject
} from './types';

export const Zuck: ZuckFunction = function (timeline, options) {
  if (!timeline.id) {
    timeline.setAttribute('id', generateId());
  }

  const id = timeline.id;
  const {
    option,
    callback: callbackOption,
    template: templateOption,
    language: languageOption
  } = loadOptions(options);

  const data: StoriesTimeline = option('stories') || [];
  const internalData: ZuckObject['internalData'] = {};

  /* data functions */
  const saveLocalData = function <T>(key: string, data: T) {
    try {
      if (option('localStorage') && hasWindow()) {
        const keyName = `zuck-${id}-${key}`;

        window.localStorage[keyName] = JSON.stringify(data);
      }
    } catch (e) {}
  };

  const getLocalData = function <T>(key: string): T | undefined {
    if (option('localStorage') && hasWindow()) {
      const keyName = `zuck-${id}-${key}`;

      return window.localStorage[keyName]
        ? JSON.parse(window.localStorage[keyName])
        : undefined;
    } else {
      return undefined;
    }
  };

  internalData.seenItems = getLocalData('seenItems') || {};

  const playVideoItem = function (
    storyViewer?: Maybe<HTMLElement>,
    elements?: NodeListOf<Element> | Element[],
    unmute?: Event
  ) {
    const itemElement = elements?.[1];
    const itemPointer = elements?.[0];

    if (!itemElement || !itemPointer) {
      return false;
    }

    const cur = internalData.currentVideoElement;
    if (cur) {
      cur.pause();
    }

    if (itemElement.getAttribute('data-type') === 'video') {
      const video = itemElement.querySelector<HTMLVideoElement>('video');
      if (!video) {
        internalData.currentVideoElement = undefined;

        return false;
      }

      const setDuration = function () {
        let duration = video.duration;
        const itemPointerProgress =
          itemPointer.querySelector<HTMLElement>('.progress');

        if (+video.dataset.length) {
          duration = +video.dataset.length;
        }

        if (duration && itemPointerProgress) {
          itemPointerProgress.style.animationDuration = `${duration}s`;
        }
      };

      setDuration();
      video.addEventListener('loadedmetadata', setDuration);
      internalData.currentVideoElement = video;

      video.play();

      try {
        unmuteVideoItem(video, storyViewer);
      } catch (e) {
        console.warn('Could not unmute video', unmute);
      }
    } else {
      internalData.currentVideoElement = undefined;
    }
  };

  const findStoryIndex = function (id: TimelineItem['id']) {
    return data.findIndex((item: TimelineItem) => item.id === id);
  };

  const pauseVideoItem = function () {
    const video = internalData.currentVideoElement;
    if (video) {
      try {
        video.pause();
      } catch (e) {}
    }
  };

  const unmuteVideoItem = function (
    video: HTMLVideoElement,
    storyViewer?: Maybe<HTMLElement>
  ) {
    video.muted = false;
    video.volume = 1.0;
    video.removeAttribute('muted');
    video.play();

    if (video.paused) {
      video.muted = true;
      video.play();
    }

    if (storyViewer) {
      storyViewer?.classList.remove('paused');
    }
  };

  const parseItems = function (
    story?: Maybe<HTMLElement>,
    forceUpdate?: boolean
  ) {
    const storyId = story?.getAttribute('data-id') || '';
    const storyIndex = findStoryIndex(storyId);
    const storyItems = document.querySelectorAll<HTMLElement>(
      `#${id} [data-id="${storyId}"] .items > li`
    );
    const items: StoryItem[] = [];

    if (!option('reactive') || forceUpdate) {
      storyItems.forEach(({ firstElementChild }: HTMLElement) => {
        const a = firstElementChild;
        const img = a?.firstElementChild;
        const li = a?.parentElement;

        const item: StoryItem = {
          id: a?.getAttribute('data-id') || li?.getAttribute('data-id'),
          src: a?.getAttribute('href'),
          length: safeNum(a?.getAttribute('data-length')),
          type: a?.getAttribute('data-type'),
          time: a?.getAttribute('data-time') || li?.getAttribute('data-time'),
          link: a?.getAttribute('data-link') || '',
          linkText: a?.getAttribute('data-linkText'),
          preview: img?.getAttribute('src'),
          seen: li?.classList.contains('seen')
        };

        const all = a?.attributes;
        const reserved = [
          'data-id',
          'href',
          'data-length',
          'data-type',
          'data-time',
          'data-link',
          'data-linkText'
        ];

        if (all) {
          for (let z = 0; z < all.length; z++) {
            if (reserved.indexOf(all[z].nodeName) === -1) {
              item[all[z].nodeName.replace('data-', '')] = all?.[z].nodeValue;
            }
          }
        }

        // destruct the remaining attributes as options
        items.push(item);
      });

      data[storyIndex].items = items;

      const callback = callbackOption('onDataUpdate');

      if (callback) {
        callback(data, () => {});
      }
    }
  };

  const parseStory = function (story?: Maybe<HTMLElement>) {
    const storyId = story?.getAttribute('data-id') || '';
    const storyIndex = findStoryIndex(storyId);

    let seen = false;

    if (internalData.seenItems[storyId]) {
      seen = true;
    }

    try {
      let storyData: TimelineItem = {};
      if (storyIndex !== -1) {
        storyData = data[storyIndex];
      }

      storyData.id = storyId;
      storyData.photo = story?.getAttribute('data-photo');
      storyData.name = story?.querySelector<HTMLElement>('.name')?.innerText;
      storyData.link = story?.querySelector('.item-link')?.getAttribute('href');
      storyData.lastUpdated = safeNum(
        story?.getAttribute('data-last-updated') ||
          story?.getAttribute('data-time')
      );

      storyData.seen = seen;

      if (!storyData.items) {
        storyData.items = [];
      }

      if (storyIndex === -1) {
        data.push(storyData);
      } else {
        data[storyIndex] = storyData;
      }
    } catch (e) {
      data[storyIndex] = {
        items: []
      };
    }

    if (story) {
      story.onclick = (e) => {
        e.preventDefault();

        modal.show(storyId);
      };
    }

    const callback = callbackOption('onDataUpdate');

    if (callback) {
      callback(data, () => {});
    }
  };

  const add = (data: TimelineItem, append?: boolean) => {
    const storyId = data['id'] || '';
    const storyEl = document.querySelector<HTMLElement>(
      `#${id} [data-id="${storyId}"]`
    );
    const items = data['items'];

    let story: Maybe<HTMLElement> = null;
    let preview: string | undefined = undefined;

    if (items?.[0]) {
      preview = items?.[0]?.preview || '';
    }

    if (internalData.seenItems[storyId] === true) {
      data.seen = true;
    }

    if (data) {
      data.currentPreview = preview;
    }

    if (!storyEl) {
      const storyItem = document.createElement('div');
      storyItem.innerHTML = templateOption('timelineItem')(data);

      story = storyItem.firstElementChild as HTMLElement;
    } else {
      story = storyEl;
    }

    if (data.seen === false) {
      internalData.seenItems[storyId] = false;
      saveLocalData('seenItems', internalData.seenItems);
    }

    story?.setAttribute('data-id', storyId);
    if (data['photo']) {
      story?.setAttribute('data-photo', data['photo']);
    }

    story?.setAttribute('data-time', data['time']?.toString());

    if (data['lastUpdated']) {
      story?.setAttribute('data-last-updated', data['lastUpdated']?.toString());
    } else {
      story?.setAttribute('data-last-updated', data['time']?.toString());
    }

    parseStory(story);

    if (!storyEl && !option('reactive')) {
      if (append) {
        timeline.appendChild(story as Node);
      } else {
        prepend(timeline, story);
      }
    }

    items?.forEach((item) => {
      addItem(storyId, item, append);
    });

    if (!append) {
      updateStorySeenPosition();
    }
  };

  const update = add;

  const next = () => {
    modal.next();
  };

  const remove = (storyId: string) => {
    const story = document.querySelector<HTMLElement>(
      `#${id} > [data-id="${storyId}"]`
    );

    story?.parentNode?.removeChild(story);
  };

  const addItem = (storyId: string, data: StoryItem, append: boolean) => {
    const story = document.querySelector<HTMLElement>(
      `#${id} > [data-id="${storyId}"]`
    );

    if (!option('reactive')) {
      const li = document.createElement('li');
      const el = story?.querySelectorAll<HTMLElement>('.items')[0];

      if (data['id']) {
        li.className = data['seen'] ? 'seen' : '';
        li.setAttribute('data-id', data['id']);
      }

      li.innerHTML = templateOption('timelineStoryItem')(data);

      if (append) {
        el?.appendChild(li);
      } else {
        prepend(el, li);
      }
    }

    parseItems(story);
  };

  const removeItem = (storyId: string, itemId: string) => {
    const item = document.querySelector<HTMLElement>(
      `#${id} > [data-id="${storyId}"] [data-id="${itemId}"]`
    );

    if (!option('reactive')) {
      item?.parentNode?.removeChild(item as Node);
      data.forEach((story: TimelineItem) => {
        if (story.id === storyId) {
          story.items = story.items.filter(
            (item: StoryItem) => item.id !== itemId
          );
        }
      });
    }
  };

  const nextItem = (
    direction?: 'previous' | 'next',
    event?: Event
  ): boolean => {
    const currentStory = internalData.currentStory;
    const currentStoryIndex = findStoryIndex(internalData.currentStory);
    const currentItem = data[currentStoryIndex].currentItem;
    const storyViewer = document.querySelector<HTMLElement>(
      `#zuck-modal .story-viewer[data-story-id="${currentStory}"]`
    );
    const directionNumber = direction === 'previous' ? -1 : 1;

    if (!storyViewer) {
      return false;
    }

    const currentItemElements = storyViewer.querySelectorAll<HTMLElement>(
      `[data-index="${currentItem}"]`
    );
    const currentPointer = currentItemElements[0];
    const currentItemElement = currentItemElements[1];

    const navigateItem = currentItem + directionNumber;
    const nextItems = storyViewer.querySelectorAll<HTMLElement>(
      `[data-index="${navigateItem}"]`
    );
    const nextPointer = nextItems[0];
    const nextItem = nextItems[1];

    if (storyViewer && nextPointer && nextItem) {
      const navigateItemCallback = function () {
        if (direction === 'previous') {
          currentPointer?.classList.remove('seen');
          currentItemElement?.classList.remove('seen');
        } else {
          currentPointer?.classList.add('seen');
          currentItemElement?.classList.add('seen');
        }

        currentPointer?.classList.remove('active');
        currentItemElement?.classList.remove('active');

        nextPointer?.classList.remove('seen');
        nextPointer?.classList.add('active');

        nextItem?.classList.remove('seen');
        nextItem?.classList.add('active');

        storyViewer
          .querySelectorAll<HTMLDivElement>('.time')
          .forEach((el: HTMLDivElement) => {
            el.innerText = timeAgo(
              Number(nextItem.getAttribute('data-time')),
              option('language')
            );
          });

        data[currentStoryIndex].currentItem =
          data[currentStoryIndex].currentItem + directionNumber;

        const nextVideo = nextItem.querySelector('video');
        if (nextVideo) {
          nextVideo.currentTime = 0;
        }
        playVideoItem(storyViewer, nextItems, event);
      };

      let callback = callbackOption('onNavigateItem');

      callback = !callback
        ? callbackOption('onNextItem')
        : callbackOption('onNavigateItem');

      callback(
        currentStory,
        nextItem.getAttribute('data-story-id'),
        navigateItemCallback
      );
    } else if (storyViewer) {
      if (direction !== 'previous') {
        modal.next();
      }
    }

    return true;
  };

  const navigateItem = nextItem;

  const updateStorySeenPosition = function () {
    document
      .querySelectorAll<HTMLElement>(`#${id} .story.seen`)
      .forEach((el: HTMLElement) => {
        const storyId = el?.getAttribute('data-id');
        const storyIndex = findStoryIndex(storyId);

        if (storyId) {
          const newData = data[storyIndex];
          const timeline = el?.parentNode;

          if (!option('reactive') && timeline) {
            timeline.removeChild(el);
          }

          update(newData, true);
        }
      });
  };

  const init = (): ZuckObject => {
    if (timeline && timeline.querySelector('.story')) {
      timeline.querySelectorAll<HTMLElement>('.story').forEach((story) => {
        parseStory(story);
        parseItems(story);
      });
    }

    if (option('backNative') && hasWindow()) {
      if (window.location.hash === `#!${id}`) {
        window.location.hash = '';
      }

      window.addEventListener(
        'popstate',
        () => {
          if (window.location.hash !== `#!${id}`) {
            window.location.hash = '';
          }
        },
        false
      );
    }

    if (!option('reactive')) {
      const seenItems = getLocalData<{
        [keyName: string]: number;
      }>('seenItems');

      if (seenItems) {
        Object.entries(seenItems).forEach(([, key]) => {
          if (key && data[key]) {
            data[key].seen = seenItems[key] ? true : false;
          }
        });
      }
    }

    option('stories').forEach((item: TimelineItem) => {
      add(item, true);
    });

    updateStorySeenPosition();

    const avatars = option('avatars') ? 'user-icon' : 'story-preview';
    const list = option('list') ? 'list' : 'carousel';
    const rtl = option('rtl') ? 'rtl' : '';

    timeline.className += ` stories ${avatars} ${list} ${`${option(
      'skin'
    )}`.toLowerCase()} ${rtl}`;

    return {
      id,
      option,
      callback: callbackOption,
      template: templateOption,
      language: languageOption,
      navigateItem,
      saveLocalData,
      getLocalData,
      data,
      internalData,
      add,
      update,
      next,
      remove,
      addItem,
      removeItem,
      nextItem,
      findStoryIndex,
      updateStorySeenPosition,
      playVideoItem,
      pauseVideoItem,
      unmuteVideoItem
    };
  };

  const zuck = init();
  const modal = ZuckModal(zuck);

  return zuck;
};

export default Zuck;
