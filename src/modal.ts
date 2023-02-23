import {
  findPos,
  onAnimationEnd,
  onTransitionEnd,
  prepend,
  safeNum,
  setVendorVariable,
  timeAgo
} from './utils';
import { Maybe, ModalContainer, TimelineItem, Zuck } from 'types';

export const modal = (zuck: Zuck) => {
  const id = zuck.id;

  const show = (storyId?: TimelineItem['id']) => {
    const modalContainer =
      document.querySelector<ModalContainer>('#zuck-modal');

    const callback = function () {
      const modalContent = document.querySelector<HTMLElement>(
        '#zuck-modal-content'
      );
      modalContent.innerHTML = `<div id="zuck-modal-slider-${id}" class="slider"></div>`;

      if (!modalContent || !storyId) {
        return;
      }

      const storyData = zuck.data[storyId];
      const currentItem = storyData.currentItem || 0;
      const modalSlider = document.querySelector<HTMLElement>(
        `#zuck-modal-slider-${id}`
      );

      createStoryTouchEvents(modalSlider);

      zuck.internalData.currentStory = storyId;
      storyData.currentItem = currentItem;

      if (zuck.option('backNative')) {
        window.location.hash = `#!${id}`;
      }

      const previousItemData = getStoryMorningGlory('previous');
      if (previousItemData) {
        createStoryViewer(previousItemData, 'previous');
      }

      createStoryViewer(storyData, 'viewing', true);

      const nextItemData = getStoryMorningGlory('next');
      if (nextItemData) {
        createStoryViewer(nextItemData, 'next');
      }

      if (zuck.option('autoFullScreen')) {
        modalContainer?.classList.add('fullscreen');
      }

      const tryFullScreen = () => {
        if (
          modalContainer?.classList.contains('fullscreen') &&
          zuck.option('autoFullScreen') &&
          window.screen.availWidth <= 1024
        ) {
          fullScreen(modalContainer);
        }

        modalContainer?.focus();
      };

      const storyViewerWrap = document.querySelector<HTMLElement>(
        '#zuck-modal .story-viewer'
      );

      if (zuck.option('openEffect') && modalContainer) {
        const storyEl = document.querySelector<HTMLElement>(
          `#${id} [data-id="${storyId}"] .item-preview`
        );

        const pos = findPos(storyEl);

        modalContainer.style.marginLeft = `${
          pos[0] + safeNum(storyEl?.offsetWidth) / 2
        }px`;
        modalContainer.style.marginTop = `${
          pos[1] + safeNum(storyEl?.offsetHeight) / 2
        }px`;
        modalContainer.style.display = 'block';

        modalContainer.slideWidth = storyViewerWrap?.offsetWidth || 0;

        setTimeout(() => {
          modalContainer?.classList.add('animated');
        }, 10);

        setTimeout(() => {
          tryFullScreen();
        }, 300); // because effects
      } else {
        if (modalContainer) {
          modalContainer.style.display = 'block';
          modalContainer.slideWidth = storyViewerWrap?.offsetWidth || 0;
        }

        tryFullScreen();
      }

      zuck.option('callbacks', 'onView')(storyId);
    };

    zuck.option('callbacks', 'onOpen')(storyId, callback);
  };

  const next = () => {
    const callback = function () {
      const lastStory = zuck.internalData.currentStory;
      const lastStoryTimelineElement = document.querySelector<HTMLElement>(
        `#${id} [data-id="${lastStory}"]`
      );

      if (lastStoryTimelineElement) {
        lastStoryTimelineElement?.classList.add('seen');

        zuck.data[lastStory].seen = true;
        zuck.internalData.seenItems[lastStory] = true;

        zuck.saveLocalData('seenItems', zuck.internalData.seenItems);
        zuck.updateStorySeenPosition();
      }

      const stories = document.querySelector<HTMLElement>(
        '#zuck-modal .story-viewer.next'
      );
      if (!stories) {
        close();
      } else {
        if (zuck.option('rtl')) {
          moveStoryItem(false);
        } else {
          moveStoryItem(true);
        }
      }
    };

    zuck.option('callbacks', 'onEnd')(zuck.internalData.currentStory, callback);
  };

  const close = () => {
    const modalContainer =
      document.querySelector<ModalContainer>('#zuck-modal');
    const modalContent = document.querySelector<HTMLElement>(
      '#zuck-modal-content'
    );

    const callback = function () {
      if (zuck.option('backNative')) {
        window.location.hash = '';
      }

      fullScreen(modalContainer, true);

      if (modalContainer && modalContent) {
        if (zuck.option('openEffect')) {
          modalContainer.classList.add('closed');
        } else {
          modalContent.innerHTML = '';
          modalContainer.style.display = 'none';
        }
      }
    };

    zuck.option('callbacks', 'onClose')(
      zuck.internalData.currentStory,
      callback
    );
  };

  const translate = function (
    element?: Maybe<HTMLElement>,
    to?: number,
    duration?: number,
    ease?: string | null
  ) {
    if (to === undefined || (to && isNaN(to))) {
      return;
    }

    const direction = to > 0 ? 1 : -1;
    const modalWidth =
      document.querySelector<HTMLElement>('#zuck-modal')?.offsetWidth || 1;
    const to3d = (Math.abs(to) / modalWidth) * 90 * direction;

    if (zuck.option('cubeEffect')) {
      const scaling = to3d === 0 ? 'scale(0.95)' : 'scale(0.930,0.930)';

      setVendorVariable(
        document.querySelector<HTMLElement>('#zuck-modal-content')?.style,
        'Transform',
        scaling
      );

      if (to3d < -90 || to3d > 90) {
        return false;
      }
    }

    const transform = !zuck.option('cubeEffect')
      ? `translate3d(${to}px, 0, 0)`
      : `rotateY(${to3d}deg)`;

    if (element) {
      if (ease) {
        setVendorVariable(element?.style, 'TransitionTimingFunction', ease);
      }

      setVendorVariable(element?.style, 'TransitionDuration', `${duration}ms`);
      setVendorVariable(element?.style, 'Transform', transform);
    }
  };

  const fullScreen = function (elem?: Maybe<HTMLElement>, cancel?: boolean) {
    const anyDocument = document as any;
    const anyElem = elem as any;

    const func = 'RequestFullScreen';
    const elFunc = 'requestFullScreen';

    try {
      if (cancel) {
        if (
          anyDocument.fullscreenElement ||
          anyDocument.webkitFullscreenElement ||
          anyDocument.mozFullScreenElement ||
          anyDocument.msFullscreenElement
        ) {
          if (anyDocument.exitFullscreen) {
            anyDocument.exitFullscreen().catch(() => {});
          } else if (anyDocument.mozCancelFullScreen) {
            anyDocument.mozCancelFullScreen().catch(() => {});
          }
        }
      } else {
        if (anyElem[elFunc]) {
          anyElem[elFunc]();
        } else if (anyElem[`ms${func}`]) {
          anyElem[`ms${func}`]();
        } else if (anyElem[`moz${func}`]) {
          anyElem[`moz${func}`]();
        } else if (anyElem[`webkit${func}`]) {
          anyElem[`webkit${func}`]();
        }
      }
    } catch (e) {
      console.warn("[Zuck.js] Can't access fullscreen");
    }
  };

  const moveStoryItem = (direction: boolean) => {
    const modalContainer = document.querySelector<HTMLElement>(
      '#zuck-modal'
    ) as ModalContainer;
    const modalSlider = document.querySelector<HTMLElement>(
      `#zuck-modal-slider-${id}`
    );

    let target: 'previous' | 'next' | '' = '';
    let useless: 'previous' | 'next' | '' = '';
    let transform = 0;

    const slideItems = {
      previous: document.querySelector<HTMLElement>(
        '#zuck-modal .story-viewer.previous'
      ),
      next: document.querySelector<HTMLElement>(
        '#zuck-modal .story-viewer.next'
      ),
      viewing: document.querySelector<HTMLElement>(
        '#zuck-modal .story-viewer.viewing'
      )
    };

    if (
      (!slideItems.previous && !direction) ||
      (!slideItems.next && direction)
    ) {
      if (!zuck.option('rtl')) {
        return false;
      }
    }

    if (!direction) {
      target = 'previous';
      useless = 'next';
    } else {
      target = 'next';
      useless = 'previous';
    }

    const transitionTime = 600;
    if (zuck.option('cubeEffect')) {
      if (target === 'previous') {
        transform = safeNum(modalContainer?.slideWidth);
      } else if (target === 'next') {
        transform = safeNum(modalContainer?.slideWidth) * -1;
      }
    } else {
      transform = findPos(slideItems[target])[0] * -1;
    }

    translate(modalSlider, transform, transitionTime, null);

    setTimeout(() => {
      // set page data when transition complete
      if (zuck.option('rtl')) {
        const tmp = target;
        target = useless;
        useless = tmp;
      }

      if (target !== '' && slideItems[target] && useless !== '') {
        const currentStory = slideItems[target]?.getAttribute('data-story-id');
        zuck.internalData.currentStory = currentStory;

        const oldStory = document.querySelector<HTMLElement>(
          `#zuck-modal .story-viewer.${useless}`
        );
        if (oldStory) {
          oldStory?.parentNode?.removeChild(oldStory);
        }

        if (slideItems.viewing) {
          slideItems.viewing?.classList.add('stopped');
          slideItems.viewing?.classList.add(useless);
          slideItems.viewing?.classList.remove('viewing');
        }

        if (slideItems[target]) {
          slideItems[target]?.classList.remove('stopped');
          slideItems[target]?.classList.remove(target);
          slideItems[target]?.classList.add('viewing');
        }

        const newTimelineItem = getStoryMorningGlory(target);
        if (newTimelineItem) {
          createStoryViewer(newTimelineItem, target);
        }

        const storyId = zuck.internalData.currentStory;
        const storyWrap = document.querySelector(
          `#zuck-modal [data-story-id="${storyId}"]`
        ) as HTMLElement;
        if (storyWrap) {
          const items = storyWrap.querySelectorAll('[data-index].active');

          if (items?.[0]) {
            const duration = items?.[0].firstElementChild as HTMLElement;

            zuck.data[storyId].currentItem = safeNum(
              items?.[0].getAttribute('data-index')
            );

            if (items?.[0]) {
              items[0].innerHTML = `<b style="${duration?.style.cssText}"></b>`;
            }

            onAnimationEnd(duration, () => {
              zuck.nextItem(undefined);
            });
          }

          translate(modalSlider, 0, 0, null);

          if (items) {
            const storyViewer = document.querySelector<HTMLElement>(
              `#zuck-modal .story-viewer[data-story-id="${currentStory}"]`
            );

            zuck.playVideoItem(storyViewer, items);
          }

          zuck.option('callbacks', 'onView')(zuck.internalData.currentStory);
        }
      }
    }, transitionTime + 50);
  };

  const createStoryViewer = function (
    storyData: TimelineItem,
    className: string,
    forcePlay?: boolean
  ) {
    const modalSlider = document.querySelector<HTMLElement>(
      `#zuck-modal-slider-${id}`
    );
    const storyItems = storyData['items'];

    storyData.timeAgo =
      storyItems && storyItems[0]
        ? timeAgo(storyItems[0]['time'], zuck.option('language'))
        : '';

    let htmlItems = '';
    let pointerItems = '';

    const storyId = storyData['id'];
    const slides = document.createElement('div');
    const currentItem = storyData['currentItem'] || 0;
    const exists = document.querySelector<HTMLElement>(
      `#zuck-modal .story-viewer[data-story-id="${storyId}"]`
    );

    if (exists) {
      return false;
    }

    slides.className = 'slides';
    storyItems.forEach((item, i) => {
      item.timeAgo = timeAgo(item['time'], zuck.option('language'));

      if (currentItem > i) {
        storyData.items[i].timeAgo = item.timeAgo;
        storyData.items[i].seen = true;
        item.seen = true;
      }

      pointerItems += zuck.option('template', 'viewerItemPointer')(
        i,
        currentItem,
        item
      );
      htmlItems += zuck.option('template', 'viewerItemBody')(
        i,
        currentItem,
        item
      );
    });

    slides.innerHTML = htmlItems;

    const video = slides.querySelector('video');
    const addMuted = function (video: HTMLVideoElement) {
      const storyViewer = document.querySelector<HTMLElement>('.story-viewer');

      if (video.muted) {
        storyViewer?.classList.add('muted');
      } else {
        storyViewer?.classList.remove('muted');
      }
    };

    if (video) {
      video.onwaiting = () => {
        if (video.paused) {
          const storyViewer =
            document.querySelector<HTMLElement>('.story-viewer');
          storyViewer?.classList.add('paused');
          storyViewer?.classList.add('loading');
        }
      };

      video.onplay = () => {
        addMuted(video);

        const storyViewer =
          document.querySelector<HTMLElement>('.story-viewer');
        storyViewer?.classList.remove('stopped');
        storyViewer?.classList.remove('paused');
        storyViewer?.classList.remove('loading');
      };

      video.onload =
        video.onplaying =
        video.oncanplay =
          () => {
            addMuted(video);

            const storyViewer =
              document.querySelector<HTMLElement>('.story-viewer');
            storyViewer?.classList.remove('loading');
          };

      video.onvolumechange = () => {
        addMuted(video);
      };
    }

    const storyViewerWrap = document.createElement('div');
    storyViewerWrap.innerHTML = zuck.option('template', 'viewerItem')(
      storyData,
      currentItem
    );

    const storyViewer = storyViewerWrap.firstElementChild as HTMLElement;
    const storyViewerPointerWrap = storyViewer.querySelector<HTMLElement>(
      '.slides-pointers .wrap'
    );

    storyViewer.className = `story-viewer muted ${className} ${
      !forcePlay ? 'stopped' : ''
    } ${zuck.option('backButton') ? 'with-back-button' : ''}`;

    if (storyId) {
      storyViewer.setAttribute('data-story-id', storyId);
    }

    if (storyViewerPointerWrap) {
      storyViewerPointerWrap.innerHTML = pointerItems;
    }

    storyViewer
      .querySelectorAll<HTMLDivElement>('.close, .back')
      .forEach((el) => {
        el.onclick = (e) => {
          e.preventDefault();
          close();
        };
      });

    storyViewer.appendChild(slides);

    if (className === 'viewing') {
      zuck.playVideoItem(
        storyViewer,
        storyViewer.querySelectorAll<HTMLElement>(
          `[data-index="${currentItem}"].active`
        ),
        undefined
      );
    }

    storyViewer
      .querySelectorAll<HTMLDivElement>('.slides-pointers [data-index] > b')
      .forEach((el) => {
        onAnimationEnd(el, () => {
          zuck.nextItem(undefined);
        });
      });

    if (!modalSlider) {
      return;
    }

    if (className === 'previous') {
      prepend(modalSlider, storyViewer);
    } else {
      modalSlider.appendChild(storyViewer);
    }
  };

  const createStoryTouchEvents = function (modalSlider: Maybe<HTMLElement>) {
    const modalContainer =
      document.querySelector<ModalContainer>('#zuck-modal');
    const enableMouseEvents = true;

    let position: { x: number; y: number } | null | undefined = null;
    let touchOffset:
      | {
          x: number;
          y: number;
          time: number;
          valid: boolean;
        }
      | null
      | undefined = null;
    let isScrolling: boolean | null | undefined = null;
    let delta: { x: number; y: number } | null | undefined = null;
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;
    let nextTimer: ReturnType<typeof setTimeout> | undefined = undefined;

    const touchStart = function (event: TouchEvent | MouseEvent) {
      const storyViewer = document.querySelector<HTMLElement>(
        '#zuck-modal .viewing'
      );
      const storyViewerWrap = document.querySelector<HTMLElement>(
        '#zuck-modal .story-viewer'
      );

      if (event.target && event.target instanceof HTMLAnchorElement) {
        return;
      }

      const touches = (event as TouchEvent).touches
        ? (event as TouchEvent).touches[0]
        : (event as MouseEvent);
      const pos = findPos(
        document.querySelector<HTMLElement>('#zuck-modal .story-viewer.viewing')
      );

      if (modalContainer) {
        modalContainer.slideWidth = storyViewerWrap?.offsetWidth;
        modalContainer.slideHeight = storyViewerWrap?.offsetHeight;
      }

      position = {
        x: pos[0],
        y: pos[1]
      };

      const clientX = touches.clientX;
      const clientY = touches.clientY;

      touchOffset = {
        x: clientX,
        y: clientY,
        time: Date.now(),
        valid: true
      };

      if (clientY < 80 || clientY > safeNum(modalContainer?.slideHeight) - 80) {
        touchOffset.valid = false;
      } else {
        event.preventDefault();

        isScrolling = undefined;
        delta = undefined;

        if (enableMouseEvents) {
          modalSlider?.addEventListener('mousemove', touchMove);
          modalSlider?.addEventListener('mouseup', touchEnd);
          modalSlider?.addEventListener('mouseleave', touchEnd);
        }
        modalSlider?.addEventListener('touchmove', touchMove);
        modalSlider?.addEventListener('touchend', touchEnd);

        if (storyViewer) {
          storyViewer?.classList.add('paused');
        }

        zuck.pauseVideoItem();

        timer = setTimeout(() => {
          if (storyViewer) {
            storyViewer?.classList.add('longPress');
          }
        }, 600);

        nextTimer = setTimeout(() => {
          clearInterval(nextTimer);
        }, 250);
      }
    };

    const touchMove = function (event: TouchEvent | MouseEvent) {
      const touches = (event as TouchEvent).touches
        ? (event as TouchEvent).touches[0]
        : (event as MouseEvent);
      const clientX = touches.clientX;
      const clientY = touches.clientY;

      if (touchOffset && touchOffset.valid) {
        delta = {
          x: clientX - touchOffset.x,
          y: clientY - touchOffset.y
        };

        if (typeof isScrolling === 'undefined') {
          isScrolling = !!(
            isScrolling || Math.abs(delta.x) < Math.abs(delta.y)
          );
        }

        if (!isScrolling && touchOffset) {
          event.preventDefault();

          translate(
            modalSlider,
            safeNum(position?.x) + safeNum(delta?.x),
            0,
            null
          );
        }
      }
    };

    const touchEnd = (event: TouchEvent | MouseEvent) => {
      const storyViewer = document.querySelector<HTMLElement>(
        '#zuck-modal .viewing'
      );
      const lastTouchOffset = touchOffset;

      const duration = touchOffset ? Date.now() - touchOffset.time : undefined;
      const isValid =
        (Number(duration) < 300 && Math.abs(safeNum(delta?.x)) > 25) ||
        Math.abs(safeNum(delta?.x)) > safeNum(modalContainer?.slideWidth) / 3;
      const direction = safeNum(delta?.x) < 0;

      const index = direction
        ? document.querySelector<HTMLElement>('#zuck-modal .story-viewer.next')
        : document.querySelector<HTMLElement>(
            '#zuck-modal .story-viewer.previous'
          );
      const isOutOfBounds = (direction && !index) || (!direction && !index);

      if (touchOffset && !touchOffset.valid) {
      } else {
        if (delta) {
          if (!isScrolling) {
            if (isValid && !isOutOfBounds) {
              moveStoryItem(direction);
            } else {
              translate(modalSlider, safeNum(position?.x), 300);
            }
          }

          touchOffset = undefined;

          if (modalSlider) {
            if (enableMouseEvents) {
              modalSlider.removeEventListener('mousemove', touchMove);
              modalSlider.removeEventListener('mouseup', touchEnd);
              modalSlider.removeEventListener('mouseleave', touchEnd);
            }
            modalSlider.removeEventListener('touchmove', touchMove);
            modalSlider.removeEventListener('touchend', touchEnd);
          }
        }

        const video = zuck.internalData.currentVideoElement;

        if (timer) {
          clearInterval(timer);
        }

        if (storyViewer) {
          zuck.playVideoItem(
            storyViewer,
            storyViewer.querySelectorAll<HTMLElement>('.active'),
            undefined
          );
          storyViewer?.classList.remove('longPress');
          storyViewer?.classList.remove('paused');
        }

        if (nextTimer) {
          clearInterval(nextTimer);

          const navigateItem = (): boolean => {
            if (!direction) {
              if (
                safeNum(lastTouchOffset?.x) > window.screen.availWidth / 3 ||
                !zuck.option('previousTap')
              ) {
                if (zuck.option('rtl')) {
                  zuck.navigateItem('previous', event);
                } else {
                  zuck.navigateItem('next', event);
                }
              } else {
                if (zuck.option('rtl')) {
                  zuck.navigateItem('next', event);
                } else {
                  zuck.navigateItem('previous', event);
                }
              }
            }

            return true;
          };

          const storyViewerViewing = document.querySelector<HTMLElement>(
            '#zuck-modal .viewing'
          );

          if (storyViewerViewing && video) {
            if (storyViewerViewing?.classList.contains('muted')) {
              zuck.unmuteVideoItem(video, storyViewerViewing);
            } else {
              navigateItem();
            }
          } else {
            navigateItem();

            return false;
          }
        }
      }
    };

    if (modalSlider) {
      modalSlider.addEventListener('touchstart', touchStart);
      if (enableMouseEvents) {
        modalSlider.addEventListener('mousedown', touchStart);
      }
    }
  };

  const getStoryMorningGlory = function (what: string) {
    // my wife told me to stop singing Wonderwall. I SAID MAYBE.

    const currentStory = zuck.internalData.currentStory;

    if (currentStory) {
      const current = document.querySelector<HTMLElement>(
        `#${zuck.id} [data-id="${currentStory}"]`
      );
      const foundStory =
        what === 'previous'
          ? current?.previousElementSibling
          : current?.nextElementSibling;

      if (foundStory) {
        const storyId = foundStory?.getAttribute('data-id') || '';
        const data = zuck.data[storyId] || false;

        return data;
      }
    }

    return false;
  };

  const init = () => {
    let modalContainer = document.querySelector<HTMLElement>('#zuck-modal');
    let modalContent = document.querySelector<HTMLElement>(
      '#zuck-modal-content'
    );

    if (!modalContainer && !zuck.hasModal) {
      zuck.hasModal = true;

      modalContainer = document.createElement('div');
      modalContainer.id = 'zuck-modal';

      if (zuck.option('cubeEffect')) {
        modalContainer.className = 'with-cube';
      }

      modalContainer.innerHTML = '<div id="zuck-modal-content"></div>';
      modalContainer.style.display = 'none';

      modalContent = document.querySelector<HTMLElement>('#zuck-modal-content');

      modalContainer.setAttribute('tabIndex', '1');
      modalContainer.onkeyup = ({ keyCode }) => {
        const code = keyCode;

        if (code === 27) {
          close();
        } else if (code === 13 || code === 32) {
          next();
        }
      };

      if (zuck.option('openEffect')) {
        modalContainer?.classList.add('with-effects');
      }

      if (zuck.option('rtl')) {
        modalContainer?.classList.add('rtl');
      }

      onTransitionEnd(modalContainer, () => {
        if (
          modalContainer?.classList.contains('closed') &&
          modalContainer &&
          modalContent
        ) {
          modalContent.innerHTML = '';
          modalContainer.style.display = 'none';
          modalContainer.classList.remove('closed');
          modalContainer.classList.remove('animated');
        }
      });

      document.body.appendChild(modalContainer);
    }

    zuck.updateStorySeenPosition();

    return {
      show,
      close,
      next
    };
  };

  return init();
};
