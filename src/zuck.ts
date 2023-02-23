import {
  generateId,
  prepend,
  safeNum,
  setVendorVariable,
  timeAgo
} from './utils';
import { loadOptions } from './options';
import { modal as ZuckModal } from './modal';

import { Maybe, Options, StoryItem, TimelineItem, Zuck } from './types';

export const ZuckJS = function (timeline: HTMLElement, options?: Options) {
  if (!timeline.id) {
    timeline.setAttribute('id', generateId());
  }

  const id = timeline.id;
  const { option } = loadOptions(options);

  const playVideoItem = function (
    storyViewer?: Maybe<HTMLElement>,
    elements?: NodeListOf<Element>,
    unmute?: Event
  ) {
    const itemElement = elements?.[1];
    const itemPointer = elements?.[0];

    if (!itemElement || !itemPointer) {
      return false;
    }

    const cur = zuck.internalData.currentVideoElement;
    if (cur) {
      cur.pause();
    }

    if (itemElement.getAttribute('data-type') === 'video') {
      const video = itemElement.getElementsByTagName('video')[0];
      if (!video) {
        zuck.internalData.currentVideoElement = undefined;

        return false;
      }

      const setDuration = function () {
        if (video.duration) {
          setVendorVariable(
            itemPointer.getElementsByTagName('b')[0]?.style,
            'AnimationDuration',
            `${video.duration}s`
          );
        }
      };

      setDuration();
      video.addEventListener('loadedmetadata', setDuration);
      zuck.internalData.currentVideoElement = video;

      video.play();

      try {
        unmuteVideoItem(video, storyViewer);
      } catch (e) {
        console.log('Could not unmute video', unmute);
      }
    } else {
      zuck.internalData.currentVideoElement = undefined;
    }
  };

  const pauseVideoItem = function (): void {
    const video = zuck.internalData.currentVideoElement;
    if (video) {
      try {
        video.pause();
      } catch (e) {}
    }
  };

  const unmuteVideoItem = function (
    video: HTMLVideoElement,
    storyViewer?: Maybe<HTMLElement>
  ): void {
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
    const storyItems = document.querySelectorAll<HTMLElement>(
      `#${id} [data-id="${storyId}"] .items > li`
    );
    const items: StoryItem[] = [];

    if (!option('reactive') || forceUpdate) {
      storyItems.forEach(({ firstElementChild }: HTMLElement) => {
        const a = firstElementChild;
        const img = a?.firstElementChild;

        const item: StoryItem = {
          id: a?.getAttribute('data-id'),
          src: a?.getAttribute('href'),
          length: safeNum(a?.getAttribute('data-length')),
          type: a?.getAttribute('data-type'),
          time: a?.getAttribute('data-time'),
          link: a?.getAttribute('data-link') || '',
          linkText: a?.getAttribute('data-linkText'),
          preview: img?.getAttribute('src'),
          items: []
        };

        // collect all attributes
        const all = a?.attributes;
        // exclude the reserved options
        const reserved = [
          'data-id',
          'href',
          'data-length',
          'data-type',
          'data-time',
          'data-link',
          'data-linktext'
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

      data[storyId].items = items;

      const callback = option('callbacks', 'onDataUpdate');
      if (callback) {
        callback(data, () => {});
      }
    }
  };

  const parseStory = function (story?: Maybe<HTMLElement>) {
    const storyId = story?.getAttribute('data-id') || '';

    let seen = false;

    if (internalData.seenItems[storyId]) {
      seen = true;
    }

    try {
      if (!data[storyId]) {
        data[storyId] = {};
      }

      data[storyId].id = storyId;
      data[storyId].photo = story?.getAttribute('data-photo');
      data[storyId].name =
        story?.querySelector<HTMLElement>('.name')?.innerText;
      data[storyId].link = story
        ?.querySelector('.item-link')
        ?.getAttribute('href');
      data[storyId].lastUpdated = story?.getAttribute('data-last-updated');
      data[storyId].seen = seen;

      if (!data[storyId].items) {
        data[storyId].items = [];
      }
    } catch (e) {
      data[storyId] = {
        items: []
      };
    }

    if (story) {
      story.onclick = (e) => {
        e.preventDefault();

        modal.show(storyId);
      };
    }

    const callback = option('callbacks', 'onDataUpdate');
    if (callback) {
      callback(data, () => {});
    }
  };

  /* data functions */
  const saveLocalData = function <T>(key: string, data: T): void {
    try {
      if (option('localStorage')) {
        const keyName = `zuck-${id}-${key}`;

        window.localStorage[keyName] = JSON.stringify(data);
      }
    } catch (e) {}
  };

  const getLocalData = function <T>(key: string): T | undefined {
    if (option('localStorage')) {
      const keyName = `zuck-${id}-${key}`;

      return window.localStorage[keyName]
        ? JSON.parse(window.localStorage[keyName])
        : undefined;
    } else {
      return undefined;
    }
  };

  const updateStorySeenPosition = function () {
    document
      .querySelectorAll<HTMLElement>(`#${id} .story.seen`)
      .forEach((el: HTMLElement) => {
        const storyId = el?.getAttribute('data-id');

        if (storyId) {
          const newData = zuck.data[storyId];
          const timeline = el?.parentNode;

          if (!zuck.option('reactive') && timeline) {
            timeline.removeChild(el);
          }

          zuck.update(newData, true);
        }
      });
  };

  /* api */
  const data = option('stories') || {};
  const internalData: Zuck['internalData'] = {};
  internalData.seenItems = getLocalData('seenItems') || {};

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
      storyItem.innerHTML = option('template', 'timelineItem')(data);

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

    if (data['lastUpdated']) {
      story?.setAttribute('data-last-updated', data['lastUpdated']);
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

      // wow, too much jsx
      li.innerHTML = option('template', 'timelineStoryItem')(data);

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
      timeline?.parentNode?.removeChild(item as Node);
    }
  };

  const nextItem = (direction: 'previous' | 'next', event?: Event): boolean => {
    const currentStory = internalData.currentStory;
    const currentItem = data[currentStory].currentItem;
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

        data[currentStory].currentItem =
          data[currentStory].currentItem + directionNumber;

        playVideoItem(storyViewer, nextItems, event);
      };

      let callback = option('callbacks', 'onNavigateItem');
      callback = !callback
        ? option('callbacks', 'onNextItem')
        : option('callbacks', 'onNavigateItem');

      callback(
        currentStory,
        nextItem.getAttribute('data-story-id'),
        navigateItemCallback
      );
    } else if (storyViewer) {
      if (direction !== 'previous') {
        modal.next(); // call(event)
      }
    }

    return true;
  };

  const navigateItem = nextItem;

  const init = (): Zuck => {
    if (timeline && timeline.querySelector('.story')) {
      timeline.querySelectorAll<HTMLElement>('.story').forEach((story) => {
        parseStory(story);
      });
    }

    if (option('backNative')) {
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
            data[key].seen = seenItems[key];
          }
        });
      }
    }

    option('stories').forEach((item: TimelineItem) => {
      add(item, true);
    });

    const avatars = option('avatars') ? 'user-icon' : 'story-preview';
    const list = option('list') ? 'list' : 'carousel';
    const rtl = option('rtl') ? 'rtl' : '';

    timeline.className += ` stories ${avatars} ${list} ${`${option(
      'skin'
    )}`.toLowerCase()} ${rtl}`;

    return {
      id,
      option,
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

if (typeof window !== 'undefined') {
  (window as any).Zuck = ZuckJS;
}

export default ZuckJS;
