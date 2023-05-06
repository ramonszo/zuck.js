import {
  Callbacks,
  Language,
  Options,
  StoryItem,
  Templates,
  TimelineItem,
  ZuckObject
} from './types';
import { safeNum, timeAgo } from './utils';

export const optionsDefault = (option?: ZuckObject['option']): Options => ({
  rtl: false, // enable/disable RTL
  skin: 'snapgram', // container class
  avatars: true, // shows user photo instead of last story item preview
  stories: [], // array of story data
  backButton: true, // adds a back button to close the story viewer
  backNative: false, // uses window history to enable back button on browsers/android
  paginationArrows: false, // add pagination arrows
  previousTap: true, // use 1/3 of the screen to navigate to previous item when tap the story
  autoFullScreen: false, // enables fullscreen on mobile browsers
  openEffect: true, // enables effect when opening story
  cubeEffect: false, // enables the 3d cube effect when sliding story
  list: false, // displays a timeline instead of carousel
  localStorage: true, // set true to save "seen" position. Element must have a id to save properly.
  callbacks: {
    onOpen: function (storyId, callback) {
      // on open story viewer
      callback();
    },
    onView: function (storyId, callback) {
      // on view story
      callback?.();
    },
    onEnd: function (storyId, callback) {
      // on end story
      callback();
    },
    onClose: function (storyId, callback) {
      // on close story viewer
      callback();
    },
    onNextItem: function (storyId, nextStoryId, callback) {
      // on navigate item of story
      callback();
    },
    onNavigateItem: function (storyId, nextStoryId, callback) {
      // use to update state on your reactive framework
      callback();
    },
    onDataUpdate: function (data, callback) {
      // use to update state on your reactive framework
      callback();
    }
  },
  template: {
    timelineItem(itemData: TimelineItem) {
      return `
        <div class="story ${itemData['seen'] === true ? 'seen' : ''}">
          <a class="item-link" ${
            itemData['link'] ? `href="${itemData['link'] || ''}"` : ''
          }>
            <span class="item-preview">
              <img lazy="eager" src="${
                option('avatars') || !itemData['currentPreview']
                  ? itemData['photo']
                  : itemData['currentPreview']
              }" />
            </span>
            <span class="info" itemProp="author" itemScope itemType="http://schema.org/Person">
              <strong class="name" itemProp="name">${itemData['name']}</strong>
              <span class="time">${
                timeAgo(
                  itemData['lastUpdated'] || itemData['time'],
                  option('language')
                ) || ''
              }</span>
            </span>
          </a>

          <ul class="items"></ul>
        </div>`;
    },

    timelineStoryItem(itemData: StoryItem) {
      const reserved = [
        'id',
        'seen',
        'src',
        'link',
        'linkText',
        'loop',
        'time',
        'type',
        'length',
        'preview'
      ];

      let attributes = ``;

      for (const dataKey in itemData) {
        if (reserved.indexOf(dataKey) === -1) {
          if (itemData[dataKey] !== undefined && itemData[dataKey] !== false) {
            attributes += ` data-${dataKey}="${itemData[dataKey]}"`;
          }
        }
      }

      reserved.forEach((dataKey) => {
        if (itemData[dataKey] !== undefined && itemData[dataKey] !== false) {
          attributes += ` data-${dataKey}="${itemData[dataKey]}"`;
        }
      });

      return `<a href="${itemData['src']}" ${attributes}>
                <img loading="auto" src="${itemData['preview']}" />
              </a>`;
    },

    viewerItem(storyData: StoryItem, currentStoryItem: StoryItem) {
      return `<div class="story-viewer">
                <div class="head">
                  <div class="left">
                    ${
                      option('backButton') ? '<a class="back">&lsaquo;</a>' : ''
                    }

                    <span class="item-preview">
                      <img lazy="eager" class="profilePhoto" src="${
                        storyData['photo']
                      }" />
                    </span>

                    <div class="info">
                      <strong class="name">${storyData['name']}</strong>
                      <span class="time">${
                        timeAgo(storyData['time'], option('language')) || ''
                      }</span>
                    </div>
                  </div>

                  <div class="right">
                    <span class="time">
                      ${
                        timeAgo(currentStoryItem['time'], option('language')) ||
                        ''
                      }
                    </span>
                    <span class="loading"></span>
                    <a class="close" tabIndex="2">&times;</a>
                  </div>
                </div>

                <div class="slides-pointers">
                  <div class="wrap"></div>
                </div>

                ${
                  option('paginationArrows')
                    ? `
                    <div class="slides-pagination">
                      <span class="previous">&lsaquo;</span>
                      <span class="next">&rsaquo;</span>
                    </div>`
                    : ''
                }
              </div>`;
    },

    viewerItemPointerProgress(style: string) {
      return `<span class="progress" style="${style}"></span>`;
    },

    viewerItemPointer(index: number, currentIndex: number, item: StoryItem) {
      return `<span
                class="
                  ${currentIndex === index ? 'active' : ''}
                  ${item['seen'] === true ? 'seen' : ''}
                "
                data-index="${index}" data-item-id="${item['id']}">
                  ${option('template')['viewerItemPointerProgress'](
                    `animation-duration:${
                      safeNum(item['length']) ? item['length'] : '3'
                    }s`
                  )}
              </span>`;
    },

    viewerItemBody(index: number, currentIndex: number, item: StoryItem) {
      return `<div
                class="
                  item
                  ${item['seen'] === true ? 'seen' : ''}
                  ${currentIndex === index ? 'active' : ''}
                "
                data-time="${item['time']}"
                data-type="${item['type']}"
                data-index="${index}"
                data-item-id="${item['id']}">
                ${
                  item['type'] === 'video'
                    ? `<video class="media" data-length="${item.length}" ${
                        item.loop ? 'loop' : ''
                      } muted webkit-playsinline playsinline preload="auto" src="${
                        item['src']
                      }" ${item['type']}></video>
                    <b class="tip muted">${option('language')['unmute']}</b>`
                    : `<img loading="auto" class="media" src="${item['src']}" ${item['type']} />
                `
                }

                ${
                  item['link']
                    ? `<a class="tip link" href="${
                        item['link']
                      }" rel="noopener" target="_blank">
                        ${item['linkText'] || option('language')['visitLink']}
                      </a>`
                    : ''
                }
              </div>`;
    }
  },
  language: {
    unmute: 'Touch to unmute',
    keyboardTip: 'Press space to see next',
    visitLink: 'Visit link',
    time: {
      ago: 'ago',
      hour: 'hour ago',
      hours: 'hours ago',
      minute: 'minute ago',
      minutes: 'minutes ago',
      fromnow: 'from now',
      seconds: 'seconds ago',
      yesterday: 'yesterday',
      tomorrow: 'tomorrow',
      days: 'days ago'
    }
  }
});

export const option = <T extends keyof Options>(
  options?: Options,
  _name?: T
): Options[T] => {
  const self = (name: keyof Options) => {
    return typeof options?.[name] !== 'undefined'
      ? options?.[name]
      : optionsDefault(self)[name];
  };

  return self(_name);
};

export const loadOptions = function (options?: Options) {
  return {
    option: <T extends keyof Options>(name: T): Options[T] => {
      return option(options, name);
    },
    callback: <C extends keyof Callbacks>(name: C): Callbacks[C] => {
      const customOpts = option(options, 'callbacks');

      return typeof customOpts[name] !== undefined
        ? customOpts[name]
        : option(undefined, 'callbacks')[name];
    },
    template: <T extends keyof Templates>(name: T): Templates[T] => {
      const customOpts = option(options, 'template');

      return typeof customOpts[name] !== undefined
        ? customOpts[name]
        : option(undefined, 'template')[name];
    },
    language: <L extends keyof Language>(name: L): Language[L] => {
      const customOpts = option(options, 'language');

      return typeof customOpts[name] !== undefined
        ? customOpts[name]
        : option(undefined, 'language')[name];
    }
  };
};
