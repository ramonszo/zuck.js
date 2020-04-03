/*
    zuck.js
    https://github.com/ramon82/zuck.js
    MIT License
*/
module.exports = (window => {
  /* Utilities */
  const query = function (qs) {
    return document.querySelectorAll(qs)[0];
  };

  const get = function (array, what) {
    if (array) {
      return array[what] || '';
    } else {
      return '';
    }
  };

  const each = function (arr, func) {
    if (arr) {
      const total = arr.length;

      for (let i = 0; i < total; i++) {
        func(i, arr[i]);
      }
    }
  };

  const setVendorVariable = function (ref, variable, value) {
    const variables = [
      variable.toLowerCase(),
      `webkit${variable}`,
      `MS${variable}`,
      `o${variable}`
    ];

    each(variables, (i, val) => {
      ref[val] = value;
    });
  };

  const addVendorEvents = function (el, func, event) {
    const events = [
      event.toLowerCase(),
      `webkit${event}`,
      `MS${event}`,
      `o${event}`
    ];

    each(events, (i, val) => {
      el.addEventListener(val, func, false);
    });
  };

  const onAnimationEnd = function (el, func) {
    addVendorEvents(el, func, 'AnimationEnd');
  };

  const onTransitionEnd = function (el, func) {
    if (!el.transitionEndEvent) {
      el.transitionEndEvent = true;

      addVendorEvents(el, func, 'TransitionEnd');
    }
  };

  const prepend = function (parent, child) {
    if (parent.firstChild) {
      parent.insertBefore(child, parent.firstChild);
    } else {
      parent.appendChild(child);
    }
  };

  const generateId = () => {
    return 'stories-' + Math.random().toString(36).substr(2, 9);
  };

  /* Zuckera */
  const ZuckJS = function (timeline, options) {
    const zuck = this;
    const option = function (name, prop) {
      const type = function (what) {
        return typeof what !== 'undefined';
      };

      if (prop) {
        if (type(options[name])) {
          return type(options[name][prop])
            ? options[name][prop]
            : optionsDefault[name][prop];
        } else {
          return optionsDefault[name][prop];
        }
      } else {
        return type(options[name]) ? options[name] : optionsDefault[name];
      }
    };

    const fullScreen = function (elem, cancel) {
      const func = 'RequestFullScreen';
      const elFunc = 'requestFullScreen'; // crappy vendor prefixes.

      try {
        if (cancel) {
          if (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
          ) {
            if (document.exitFullscreen) {
              document.exitFullscreen()
                .catch(() => {});
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
                .catch(() => {});
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
                .catch(() => {});
            }
          }
        } else {
          if (elem[elFunc]) {
            elem[elFunc]();
          } else if (elem[`ms${func}`]) {
            elem[`ms${func}`]();
          } else if (elem[`moz${func}`]) {
            elem[`moz${func}`]();
          } else if (elem[`webkit${func}`]) {
            elem[`webkit${func}`]();
          }
        }
      } catch (e) {
        console.warn('[Zuck.js] Can\'t access fullscreen');
      }
    };

    const translate = function (element, to, duration, ease) {
      const direction = to > 0 ? 1 : -1;
      const to3d = (Math.abs(to) / query('#zuck-modal').offsetWidth) * 90 * direction;

      if (option('cubeEffect')) {
        const scaling = to3d === 0 ? 'scale(0.95)' : 'scale(0.930,0.930)';

        setVendorVariable(
          query('#zuck-modal-content').style,
          'Transform',
          scaling
        );

        if (to3d < -90 || to3d > 90) {
          return false;
        }
      }

      const transform = !option('cubeEffect')
        ? `translate3d(${to}px, 0, 0)`
        : `rotateY(${to3d}deg)`;

      if (element) {
        setVendorVariable(element.style, 'TransitionTimingFunction', ease);
        setVendorVariable(element.style, 'TransitionDuration', `${duration}ms`);
        setVendorVariable(element.style, 'Transform', transform);
      }
    };

    const findPos = function (obj, offsetY, offsetX, stop) {
      let curleft = 0;
      let curtop = 0;

      if (obj) {
        if (obj.offsetParent) {
          do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;

            if (obj === stop) {
              break;
            }
          } while ((obj = obj.offsetParent));
        }

        if (offsetY) {
          curtop = curtop - offsetY;
        }

        if (offsetX) {
          curleft = curleft - offsetX;
        }
      }

      return [curleft, curtop];
    };

    if (typeof timeline === 'string') {
      timeline = document.getElementById(timeline);
    }

    if (!timeline.id) {
      timeline.setAttribute('id', generateId());
    }

    const timeAgo = function (time) {
      time = Number(time) * 1000;

      const dateObj = new Date(time);
      const dateStr = dateObj.getTime();
      let seconds = (new Date().getTime() - dateStr) / 1000;

      const language = option('language', 'time');

      const formats = [
        [60, ` ${language.seconds}`, 1], // 60
        [120, `1 ${language.minute}`, ''], // 60*2
        [3600, ` ${language.minutes}`, 60], // 60*60, 60
        [7200, `1 ${language.hour}`, ''], // 60*60*2
        [86400, ` ${language.hours}`, 3600], // 60*60*24, 60*60
        [172800, ` ${language.yesterday}`, ''], // 60*60*24*2
        [604800, ` ${language.days}`, 86400]
      ];

      let currentFormat = 1;
      if (seconds < 0) {
        seconds = Math.abs(seconds);

        currentFormat = 2;
      }

      let result = false;
      each(formats, (formatKey, format) => {
        if (seconds < format[0] && !result) {
          if (typeof format[2] === 'string') {
            result = format[currentFormat];
          } else if (format !== null) {
            result = Math.floor(seconds / format[2]) + format[1];
          }
        }
      });

      if (!result) {
        const day = dateObj.getDate();
        const month = dateObj.getMonth();
        const year = dateObj.getFullYear();

        return `${day}/${month + 1}/${year}`;
      } else {
        return result;
      }
    };

    /* options */
    const id = timeline.id;
    const optionsDefault = {
      rtl: false,
      skin: 'snapgram',
      avatars: true,
      stories: [],
      backButton: true,
      backNative: false,
      paginationArrows: false,
      previousTap: true,
      autoFullScreen: false,
      openEffect: true,
      cubeEffect: false,
      list: false,
      localStorage: true,
      callbacks: {
        onOpen: function (storyId, callback) {
          callback();
        },
        onView: function (storyId) {},
        onEnd: function (storyId, callback) {
          callback();
        },
        onClose: function (storyId, callback) {
          callback();
        },
        onNextItem: function (storyId, nextStoryId, callback) {
          callback();
        },
        onNavigateItem: function (storyId, nextStoryId, callback) {
          callback();
        }
      },
      template: {
        timelineItem (itemData) {
          return `
            <div class="story ${get(itemData, 'seen') === true ? 'seen' : ''}">
              <a class="item-link" href="${get(itemData, 'link')}">
                <span class="item-preview">
                  <img lazy="eager" src="${
                    (option('avatars') || !get(itemData, 'currentPreview'))
                    ? get(itemData, 'photo')
                    : get(itemData, 'currentPreview')
                  }" />
                </span>
                <span class="info" itemProp="author" itemScope itemType="http://schema.org/Person">
                  <strong class="name" itemProp="name">${get(itemData, 'name')}</strong>
                  <span class="time">${get(itemData, 'lastUpdatedAgo')}</span>
                </span>
              </a>
              
              <ul class="items"></ul>
            </div>`;
        },

        timelineStoryItem (itemData) {
          const reserved = ['id', 'seen', 'src', 'link', 'linkText', 'time', 'type', 'length', 'preview'];
          let attributes = `
            href="${get(itemData, 'src')}"
            data-link="${get(itemData, 'link')}"
            data-linkText="${get(itemData, 'linkText')}"
            data-time="${get(itemData, 'time')}"
            data-type="${get(itemData, 'type')}"
            data-length="${get(itemData, 'length')}"
          `;

          for (const dataKey in itemData) {
            if (reserved.indexOf(dataKey) === -1) {
              attributes += ` data-${dataKey}="${itemData[dataKey]}"`;
            }
          }

          return `<a ${attributes}>
                    <img loading="auto" src="${get(itemData, 'preview')}" />
                  </a>`;
        },

        viewerItem (storyData, currentStoryItem) {
          return `<div class="story-viewer">
                    <div class="head">
                      <div class="left">
                        ${option('backButton') ? '<a class="back">&lsaquo;</a>' : ''}

                        <span class="item-preview">
                          <img lazy="eager" class="profilePhoto" src="${get(storyData, 'photo')}" />
                        </span>

                        <div class="info">
                          <strong class="name">${get(storyData, 'name')}</strong>
                          <span class="time">${get(storyData, 'timeAgo')}</span>
                        </div>
                      </div>

                      <div class="right">
                        <span class="time">${get(currentStoryItem, 'timeAgo')}</span>
                        <span class="loading"></span>
                        <a class="close" tabIndex="2">&times;</a>
                      </div>
                    </div>

                    <div class="slides-pointers">
                      <div class="wrap"></div>
                    </div>

                    ${
                      option('paginationArrows')
                      ? `<div class="slides-pagination">
                          <span class="previous">&lsaquo;</span>
                          <span class="next">&rsaquo;</span>
                        </div>`
                      : ''
                    }
                  </div>`;
        },

        viewerItemPointer (index, currentIndex, item) {
          return `<span 
                    class="${currentIndex === index ? 'active' : ''} ${get(item, 'seen') === true ? 'seen' : ''}"
                    data-index="${index}" data-item-id="${get(item, 'id')}">
                      <b style="animation-duration:${get(item, 'length') === '' ? '3' : get(item, 'length')}s"></b>
                  </span>`;
        },

        viewerItemBody (index, currentIndex, item) {
          return `<div 
                    class="item ${get(item, 'seen') === true ? 'seen' : ''} ${currentIndex === index ? 'active' : ''}"
                    data-time="${get(item, 'time')}" data-type="${get(item, 'type')}" data-index="${index}" data-item-id="${get(item, 'id')}">
                    ${
                      get(item, 'type') === 'video'
                      ? `<video class="media" muted webkit-playsinline playsinline preload="auto" src="${get(item, 'src')}" ${get(item, 'type')}></video>
                        <b class="tip muted">${option('language', 'unmute')}</b>`
                      : `<img loading="auto" class="media" src="${get(item, 'src')}" ${get(item, 'type')} />
                    `}

                    ${
                      get(item, 'link')
                      ? `<a class="tip link" href="${get(item, 'link')}" rel="noopener" target="_blank">
                            ${!get(item, 'linkText') || get(item, 'linkText') === '' ? option('language', 'visitLink') : get(item, 'linkText')}
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
    };

    /* modal */
    const ZuckModal = () => {
      let modalZuckContainer = query('#zuck-modal');

      if (!modalZuckContainer && !zuck.hasModal) {
        zuck.hasModal = true;

        modalZuckContainer = document.createElement('div');
        modalZuckContainer.id = 'zuck-modal';

        if (option('cubeEffect')) {
          modalZuckContainer.className = 'with-cube';
        }

        modalZuckContainer.innerHTML = '<div id="zuck-modal-content"></div>';
        modalZuckContainer.style.display = 'none';

        modalZuckContainer.setAttribute('tabIndex', '1');
        modalZuckContainer.onkeyup = ({ keyCode }) => {
          const code = keyCode;

          if (code === 27) {
            modal.close();
          } else if (code === 13 || code === 32) {
            modal.next();
          }
        };

        if (option('openEffect')) {
          modalZuckContainer.classList.add('with-effects');
        }

        if (option('rtl')) {
          modalZuckContainer.classList.add('rtl');
        }

        onTransitionEnd(modalZuckContainer, () => {
          if (modalZuckContainer.classList.contains('closed')) {
            modalContent.innerHTML = '';
            modalZuckContainer.style.display = 'none';
            modalZuckContainer.classList.remove('closed');
            modalZuckContainer.classList.remove('animated');
          }
        });

        document.body.appendChild(modalZuckContainer);
      }

      const modalContent = query('#zuck-modal-content');

      const moveStoryItem = function (direction) {
        const modalContainer = query('#zuck-modal');

        let target = '';
        let useless = '';
        let transform = 0;

        const modalSlider = query(`#zuck-modal-slider-${id}`);
        const slideItems = {
          previous: query('#zuck-modal .story-viewer.previous'),
          next: query('#zuck-modal .story-viewer.next'),
          viewing: query('#zuck-modal .story-viewer.viewing')
        };

        if (
          (!slideItems.previous && !direction) ||
            (!slideItems.next && direction)
        ) {
          if (!option('rtl')) {
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
        if (option('cubeEffect')) {
          if (target === 'previous') {
            transform = modalContainer.slideWidth;
          } else if (target === 'next') {
            transform = modalContainer.slideWidth * -1;
          }
        } else {
          transform = findPos(slideItems[target])[0] * -1;
        }

        translate(modalSlider, transform, transitionTime, null);

        setTimeout(() => {
          // set page data when transition complete
          if (option('rtl')) {
            const tmp = target;
            target = useless;
            useless = tmp;
          }

          if (target !== '' && slideItems[target] && useless !== '') {
            const currentStory = slideItems[target].getAttribute('data-story-id');
            zuck.internalData.currentStory = currentStory;

            const oldStory = query(`#zuck-modal .story-viewer.${useless}`);
            if (oldStory) {
              oldStory.parentNode.removeChild(oldStory);
            }

            if (slideItems.viewing) {
              slideItems.viewing.classList.add('stopped');
              slideItems.viewing.classList.add(useless);
              slideItems.viewing.classList.remove('viewing');
            }

            if (slideItems[target]) {
              slideItems[target].classList.remove('stopped');
              slideItems[target].classList.remove(target);
              slideItems[target].classList.add('viewing');
            }

            const newStoryData = getStoryMorningGlory(target);
            if (newStoryData) {
              createStoryViewer(newStoryData, target);
            }

            const storyId = zuck.internalData.currentStory;
            let items = query(`#zuck-modal [data-story-id="${storyId}"]`);

            if (items) {
              items = items.querySelectorAll('[data-index].active');
              const duration = items[0].firstElementChild;

              zuck.data[storyId].currentItem = parseInt(
                items[0].getAttribute('data-index'),
                10
              );

              items[0].innerHTML =
                  `<b style="${duration.style.cssText}"></b>`;
              onAnimationEnd(items[0].firstElementChild, () => {
                zuck.nextItem(false);
              });
            }

            translate(modalSlider, '0', 0, null);

            if (items) {
              const storyViewer = query(`#zuck-modal .story-viewer[data-story-id="${currentStory}"]`);

              playVideoItem(storyViewer, [items[0], items[1]], true);
            }

            option('callbacks', 'onView')(zuck.internalData.currentStory);
          }
        }, transitionTime + 50);
      };

      const createStoryViewer = function (storyData, className, forcePlay) {
        const modalSlider = query(`#zuck-modal-slider-${id}`);
        const storyItems = get(storyData, 'items');

        storyData.timeAgo = storyItems && storyItems[0] ? timeAgo(get(storyItems[0], 'time')) : '';

        let htmlItems = '';
        let pointerItems = '';

        const storyId = get(storyData, 'id');
        const slides = document.createElement('div');
        const currentItem = get(storyData, 'currentItem') || 0;
        const exists = query(`#zuck-modal .story-viewer[data-story-id="${storyId}"]`);

        if (exists) {
          return false;
        }

        slides.className = 'slides';
        each(storyItems, (i, item) => {
          item.timeAgo = timeAgo(get(item, 'time'));

          if (currentItem > i) {
            storyData.items[i].timeAgo = item.timeAgo;
            storyData.items[i].seen = true;
            item.seen = true;
          }

          pointerItems += option('template', 'viewerItemPointer')(i, currentItem, item);
          htmlItems += option('template', 'viewerItemBody')(i, currentItem, item);
        });

        slides.innerHTML = htmlItems;

        const video = slides.querySelector('video');
        const addMuted = function (video) {
          if (video.muted) {
            storyViewer.classList.add('muted');
          } else {
            storyViewer.classList.remove('muted');
          }
        };

        if (video) {
          video.onwaiting = e => {
            if (video.paused) {
              storyViewer.classList.add('paused');
              storyViewer.classList.add('loading');
            }
          };

          video.onplay = () => {
            addMuted(video);

            storyViewer.classList.remove('stopped');
            storyViewer.classList.remove('paused');
            storyViewer.classList.remove('loading');
          };

          video.onload = video.onplaying = video.oncanplay = () => {
            addMuted(video);

            storyViewer.classList.remove('loading');
          };

          video.onvolumechange = () => {
            addMuted(video);
          };
        }

        const storyViewerWrap = document.createElement('div');
        storyViewerWrap.innerHTML = option('template', 'viewerItem')(storyData, currentItem);

        const storyViewer = storyViewerWrap.firstElementChild;

        storyViewer.className = `story-viewer muted ${className} ${!forcePlay ? 'stopped' : ''} ${option('backButton') ? 'with-back-button' : ''}`;

        storyViewer.setAttribute('data-story-id', storyId);
        storyViewer.querySelector('.slides-pointers .wrap').innerHTML = pointerItems;

        each(storyViewer.querySelectorAll('.close, .back'), (i, el) => {
          el.onclick = e => {
            e.preventDefault();
            modal.close();
          };
        });

        storyViewer.appendChild(slides);

        if (className === 'viewing') {
          playVideoItem(storyViewer, storyViewer.querySelectorAll(`[data-index="${currentItem}"].active`), false);
        }

        each(storyViewer.querySelectorAll('.slides-pointers [data-index] > b'), (i, el) => {
          onAnimationEnd(el, () => {
            zuck.nextItem(false);
          });
        });

        if (className === 'previous') {
          prepend(modalSlider, storyViewer);
        } else {
          modalSlider.appendChild(storyViewer);
        }
      };

      const createStoryTouchEvents = function (modalSliderElement) {
        const modalContainer = query('#zuck-modal');
        const enableMouseEvents = true;

        const modalSlider = modalSliderElement;

        let position = {};
        let touchOffset = null;
        let isScrolling = null;
        let delta = null;
        let timer = null;
        let nextTimer = null;

        const touchStart = function (event) {
          const storyViewer = query('#zuck-modal .viewing');

          if (event.target.nodeName === 'A') {
            return;
          }

          const touches = event.touches ? event.touches[0] : event;
          const pos = findPos(query('#zuck-modal .story-viewer.viewing'));

          modalContainer.slideWidth = query('#zuck-modal .story-viewer').offsetWidth;
          modalContainer.slideHeight = query('#zuck-modal .story-viewer').offsetHeight;

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

          if (clientY < 80 || clientY > (modalContainer.slideHeight - 80)) {
            touchOffset.valid = false;
          } else {
            event.preventDefault();

            isScrolling = undefined;
            delta = {};

            if (enableMouseEvents) {
              modalSlider.addEventListener('mousemove', touchMove);
              modalSlider.addEventListener('mouseup', touchEnd);
              modalSlider.addEventListener('mouseleave', touchEnd);
            }
            modalSlider.addEventListener('touchmove', touchMove);
            modalSlider.addEventListener('touchend', touchEnd);

            if (storyViewer) {
              storyViewer.classList.add('paused');
            }

            pauseVideoItem();

            timer = setTimeout(() => {
              storyViewer.classList.add('longPress');
            }, 600);

            nextTimer = setTimeout(() => {
              clearInterval(nextTimer);
              nextTimer = false;
            }, 250);
          }
        };

        const touchMove = function (event) {
          const touches = event.touches ? event.touches[0] : event;
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

              translate(modalSlider, position.x + delta.x, 0, null);
            }
          }
        };

        const touchEnd = function (event) {
          const storyViewer = query('#zuck-modal .viewing');
          const lastTouchOffset = touchOffset;

          const duration = touchOffset ? Date.now() - touchOffset.time : undefined;
          const isValid = (Number(duration) < 300 && Math.abs(delta.x) > 25) || Math.abs(delta.x) > modalContainer.slideWidth / 3;
          const direction = delta.x < 0;

          const index = direction ? query('#zuck-modal .story-viewer.next') : query('#zuck-modal .story-viewer.previous');
          const isOutOfBounds = (direction && !index) || (!direction && !index);

          if (touchOffset && !touchOffset.valid) {

          } else {
            if (delta) {
              if (!isScrolling) {
                if (isValid && !isOutOfBounds) {
                  moveStoryItem(direction);
                } else {
                  translate(modalSlider, position.x, 300);
                }
              }

              touchOffset = undefined;

              if (enableMouseEvents) {
                modalSlider.removeEventListener('mousemove', touchMove);
                modalSlider.removeEventListener('mouseup', touchEnd);
                modalSlider.removeEventListener('mouseleave', touchEnd);
              }
              modalSlider.removeEventListener('touchmove', touchMove);
              modalSlider.removeEventListener('touchend', touchEnd);
            }

            const video = zuck.internalData.currentVideoElement;

            if (timer) {
              clearInterval(timer);
            }

            if (storyViewer) {
              playVideoItem(storyViewer, storyViewer.querySelectorAll('.active'), false);
              storyViewer.classList.remove('longPress');
              storyViewer.classList.remove('paused');
            }

            if (nextTimer) {
              clearInterval(nextTimer);
              nextTimer = false;

              const navigateItem = function () {
                if (!direction) {
                  if (lastTouchOffset.x > window.screen.availWidth / 3 || !option('previousTap')) {
                    if (option('rtl')) {
                      zuck.navigateItem('previous', event);
                    } else {
                      zuck.navigateItem('next', event);
                    }
                  } else {
                    if (option('rtl')) {
                      zuck.navigateItem('next', event);
                    } else {
                      zuck.navigateItem('previous', event);
                    }
                  }
                }
              };

              const storyViewerViewing = query('#zuck-modal .viewing');

              if (storyViewerViewing && video) {
                if (storyViewerViewing.classList.contains('muted')) {
                  unmuteVideoItem(video, storyViewerViewing);
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

        modalSlider.addEventListener('touchstart', touchStart);
        if (enableMouseEvents) {
          modalSlider.addEventListener('mousedown', touchStart);
        }
      };

      return {
        show (storyId, page) {
          const modalContainer = query('#zuck-modal');

          const callback = function () {
            modalContent.innerHTML = `<div id="zuck-modal-slider-${id}" class="slider"></div>`;

            const storyData = zuck.data[storyId];
            const currentItem = storyData.currentItem || 0;
            const modalSlider = query(`#zuck-modal-slider-${id}`);

            createStoryTouchEvents(modalSlider);

            zuck.internalData.currentStory = storyId;
            storyData.currentItem = currentItem;

            if (option('backNative')) {
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

            if (option('autoFullScreen')) {
              modalContainer.classList.add('fullscreen');
            }

            const tryFullScreen = function () {
              if (
                modalContainer.classList.contains('fullscreen') &&
                  option('autoFullScreen') &&
                  window.screen.availWidth <= 1024
              ) {
                fullScreen(modalContainer);
              }

              modalContainer.focus();
            };

            if (option('openEffect')) {
              const storyEl = query(
                `#${id} [data-id="${storyId}"] .item-preview`
              );
              const pos = findPos(storyEl);

              modalContainer.style.marginLeft = `${pos[0] + storyEl.offsetWidth / 2}px`;
              modalContainer.style.marginTop = `${pos[1] + storyEl.offsetHeight / 2}px`;
              modalContainer.style.display = 'block';

              modalContainer.slideWidth = query('#zuck-modal .story-viewer').offsetWidth;

              setTimeout(() => {
                modalContainer.classList.add('animated');
              }, 10);

              setTimeout(() => {
                tryFullScreen();
              }, 300); // because effects
            } else {
              modalContainer.style.display = 'block';
              modalContainer.slideWidth = query('#zuck-modal .story-viewer').offsetWidth;

              tryFullScreen();
            }

            option('callbacks', 'onView')(storyId);
          };

          option('callbacks', 'onOpen')(storyId, callback);
        },
        next (unmute) {
          const callback = function () {
            const lastStory = zuck.internalData.currentStory;
            const lastStoryTimelineElement = query(
              `#${id} [data-id="${lastStory}"]`
            );

            if (lastStoryTimelineElement) {
              lastStoryTimelineElement.classList.add('seen');

              zuck.data[lastStory].seen = true;
              zuck.internalData.seenItems[lastStory] = true;

              saveLocalData('seenItems', zuck.internalData.seenItems);
              updateStorySeenPosition();
            }

            const stories = query('#zuck-modal .story-viewer.next');
            if (!stories) {
              modal.close();
            } else {
              if (option('rtl')) {
                moveStoryItem(false);
              } else {
                moveStoryItem(true);
              }
            }
          };

          option('callbacks', 'onEnd')(
            zuck.internalData.currentStory,
            callback
          );
        },
        close () {
          const modalContainer = query('#zuck-modal');

          const callback = function () {
            if (option('backNative')) {
              window.location.hash = '';
            }

            fullScreen(modalContainer, true);

            if (option('openEffect')) {
              modalContainer.classList.add('closed');
            } else {
              modalContent.innerHTML = '';
              modalContainer.style.display = 'none';
            }
          };

          option('callbacks', 'onClose')(zuck.internalData.currentStory, callback);
        }
      };
    };

    const modal = ZuckModal();

    /* parse functions */
    const parseItems = function (story, forceUpdate) {
      const storyId = story.getAttribute('data-id');
      const storyItems = document.querySelectorAll(`#${id} [data-id="${storyId}"] .items > li`);
      const items = [];

      if (!option('reactive') || forceUpdate) {
        each(storyItems, (i, { firstElementChild }) => {
          const a = firstElementChild;
          const img = a.firstElementChild;

          const item = {
            id: a.getAttribute('data-id'),
            src: a.getAttribute('href'),
            length: a.getAttribute('data-length'),
            type: a.getAttribute('data-type'),
            time: a.getAttribute('data-time'),
            link: a.getAttribute('data-link'),
            linkText: a.getAttribute('data-linkText'),
            preview: img.getAttribute('src')
          };

          // collect all attributes
          const all = a.attributes;
          // exclude the reserved options
          const reserved = ['data-id', 'href', 'data-length', 'data-type', 'data-time', 'data-link', 'data-linktext'];
          for (let z = 0; z < all.length; z++) {
            if (reserved.indexOf(all[z].nodeName) === -1) {
              item[all[z].nodeName.replace('data-', '')] = all[z].nodeValue;
            }
          }

          // destruct the remaining attributes as options
          items.push(item);
        });

        zuck.data[storyId].items = items;

        const callback = option('callbacks', 'onDataUpdate');
        if (callback) {
          callback(zuck.data, () => {});
        }
      }
    };

    const parseStory = function (story, returnCallback) {
      const storyId = story.getAttribute('data-id');

      let seen = false;

      if (zuck.internalData.seenItems[storyId]) {
        seen = true;
      }

      /*
      REACT
      if (seen) {
        story.classList.add('seen');
      } else {
        story.classList.remove('seen');
      }
      */

      try {
        if (!zuck.data[storyId]) {
          zuck.data[storyId] = {};
        }

        zuck.data[storyId].id = storyId; // story id
        zuck.data[storyId].photo = story.getAttribute('data-photo'); // story preview (or user photo)
        zuck.data[storyId].name = story.querySelector('.name').innerText;
        zuck.data[storyId].link = story.querySelector('.item-link').getAttribute('href');
        zuck.data[storyId].lastUpdated = story.getAttribute('data-last-updated');
        zuck.data[storyId].seen = seen;

        if (!zuck.data[storyId].items) {
          zuck.data[storyId].items = [];
          zuck.data[storyId].noItems = true;
        }
      } catch (e) {
        zuck.data[storyId] = {
          items: []
        };
      }

      story.onclick = e => {
        e.preventDefault();

        modal.show(storyId);
      };

      const callback = option('callbacks', 'onDataUpdate');
      if (callback) {
        callback(zuck.data, () => {});
      }
    };

    // BIBLICAL
    const getStoryMorningGlory = function (what) {
      // my wife told me to stop singing Wonderwall. I SAID MAYBE.

      const currentStory = zuck.internalData.currentStory;
      const whatElementYouMean = `${what}ElementSibling`;

      if (currentStory) {
        const foundStory = query(`#${id} [data-id="${currentStory}"]`)[whatElementYouMean];

        if (foundStory) {
          const storyId = foundStory.getAttribute('data-id');
          const data = zuck.data[storyId] || false;

          return data;
        }
      }

      return false;
    };

    const updateStorySeenPosition = function () {
      each(document.querySelectorAll(`#${id} .story.seen`), (i, el) => {
        const newData = zuck.data[el.getAttribute('data-id')];
        const timeline = el.parentNode;

        if (!option('reactive')) {
          timeline.removeChild(el);
        }

        zuck.update(newData, true);
      });
    };

    const playVideoItem = function (storyViewer, elements, unmute) {
      const itemElement = elements[1];
      const itemPointer = elements[0];

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
          zuck.internalData.currentVideoElement = false;

          return false;
        }

        const setDuration = function () {
          if (video.duration) {
            setVendorVariable(
              itemPointer.getElementsByTagName('b')[0].style,
              'AnimationDuration',
              `${video.duration}s`
            );
          }
        };

        setDuration();
        video.addEventListener('loadedmetadata', setDuration);
        zuck.internalData.currentVideoElement = video;

        video.play();

        if (unmute && unmute.target) {
          unmuteVideoItem(video, storyViewer);
        }
      } else {
        zuck.internalData.currentVideoElement = false;
      }
    };

    const pauseVideoItem = function () {
      const video = zuck.internalData.currentVideoElement;
      if (video) {
        try {
          video.pause();
        } catch (e) {}
      }
    };

    const unmuteVideoItem = function (video, storyViewer) {
      video.muted = false;
      video.volume = 1.0;
      video.removeAttribute('muted');
      video.play();

      if (video.paused) {
        video.muted = true;
        video.play();
      }

      if (storyViewer) {
        storyViewer.classList.remove('paused');
      }
    };

    /* data functions */
    const saveLocalData = function (key, data) {
      try {
        if (option('localStorage')) {
          const keyName = `zuck-${id}-${key}`;

          window.localStorage[keyName] = JSON.stringify(data);
        }
      } catch (e) {}
    };

    const getLocalData = function (key) {
      if (option('localStorage')) {
        const keyName = `zuck-${id}-${key}`;

        return window.localStorage[keyName]
          ? JSON.parse(window.localStorage[keyName])
          : false;
      } else {
        return false;
      }
    };

    /* api */
    zuck.data = option('stories') || {};
    zuck.internalData = {};
    zuck.internalData.seenItems = getLocalData('seenItems') || {};

    zuck.add = zuck.update = (data, append) => {
      const storyId = get(data, 'id');
      const storyEl = query(`#${id} [data-id="${storyId}"]`);
      const items = get(data, 'items');

      let story;
      let preview = false;

      if (items[0]) {
        preview = items[0].preview || '';
      }

      if (zuck.internalData.seenItems[storyId] === true) {
        data.seen = true;
      }

      data.currentPreview = preview;

      if (!storyEl) {
        const storyItem = document.createElement('div');
        storyItem.innerHTML = option('template', 'timelineItem')(data);

        story = storyItem.firstElementChild;
      } else {
        story = storyEl;
      }

      if (data.seen === false) {
        zuck.internalData.seenItems[storyId] = false;

        saveLocalData('seenItems', zuck.internalData.seenItems);
      }

      story.setAttribute('data-id', storyId);
      story.setAttribute('data-photo', get(data, 'photo'));
      story.setAttribute('data-last-updated', get(data, 'lastUpdated'));

      parseStory(story);

      if (!storyEl && !option('reactive')) {
        if (append) {
          timeline.appendChild(story);
        } else {
          prepend(timeline, story);
        }
      }

      each(items, (i, item) => {
        zuck.addItem(storyId, item, append);
      });

      if (!append) {
        updateStorySeenPosition();
      }
    };

    zuck.next = () => {
      modal.next();
    };

    zuck.remove = (storyId) => {
      const story = query(`#${id} > [data-id="${storyId}"]`);

      story.parentNode.removeChild(story);
    };

    zuck.addItem = (storyId, data, append) => {
      const story = query(`#${id} > [data-id="${storyId}"]`);

      if (!option('reactive')) {
        const li = document.createElement('li');
        const el = story.querySelectorAll('.items')[0];

        li.className = get(data, 'seen') ? 'seen' : '';
        li.setAttribute('data-id', get(data, 'id'));

        // wow, too much jsx
        li.innerHTML = option('template', 'timelineStoryItem')(data);

        if (append) {
          el.appendChild(li);
        } else {
          prepend(el, li);
        }
      }

      parseItems(story);
    };

    zuck.removeItem = (storyId, itemId) => {
      const item = query(`#${id} > [data-id="${storyId}"] [data-id="${itemId}"]`);

      if (!option('reactive')) {
        timeline.parentNode.removeChild(item);
      }
    };

    zuck.navigateItem = zuck.nextItem = (direction, event) => {
      const currentStory = zuck.internalData.currentStory;
      const currentItem = zuck.data[currentStory].currentItem;
      const storyViewer = query(`#zuck-modal .story-viewer[data-story-id="${currentStory}"]`);
      const directionNumber = direction === 'previous' ? -1 : 1;

      if (!storyViewer || storyViewer.touchMove === 1) {
        return false;
      }

      const currentItemElements = storyViewer.querySelectorAll(`[data-index="${currentItem}"]`);
      const currentPointer = currentItemElements[0];
      const currentItemElement = currentItemElements[1];

      const navigateItem = currentItem + directionNumber;
      const nextItems = storyViewer.querySelectorAll(`[data-index="${navigateItem}"]`);
      const nextPointer = nextItems[0];
      const nextItem = nextItems[1];

      if (storyViewer && nextPointer && nextItem) {
        const navigateItemCallback = function () {
          if (direction === 'previous') {
            currentPointer.classList.remove('seen');
            currentItemElement.classList.remove('seen');
          } else {
            currentPointer.classList.add('seen');
            currentItemElement.classList.add('seen');
          }

          currentPointer.classList.remove('active');
          currentItemElement.classList.remove('active');

          nextPointer.classList.remove('seen');
          nextPointer.classList.add('active');

          nextItem.classList.remove('seen');
          nextItem.classList.add('active');

          each(storyViewer.querySelectorAll('.time'), (i, el) => {
            el.innerText = timeAgo(nextItem.getAttribute('data-time'));
          });

          zuck.data[currentStory].currentItem = zuck.data[currentStory].currentItem + directionNumber;

          playVideoItem(storyViewer, nextItems, event);
        };

        let callback = option('callbacks', 'onNavigateItem');
        callback = !callback ? option('callbacks', 'onNextItem') : option('callbacks', 'onNavigateItem');

        callback(currentStory, nextItem.getAttribute('data-story-id'), navigateItemCallback);
      } else if (storyViewer) {
        if (direction !== 'previous') {
          modal.next(event);
        }
      }
    };

    const init = function () {
      if (timeline && timeline.querySelector('.story')) {
        each(timeline.querySelectorAll('.story'), (storyIndex, story) => {
          parseStory(story);
        });
      }

      if (option('backNative')) {
        if (window.location.hash === `#!${id}`) {
          window.location.hash = '';
        }

        window.addEventListener(
          'popstate',
          e => {
            if (window.location.hash !== `#!${id}`) {
              window.location.hash = '';
            }
          },
          false
        );
      }

      if (!option('reactive')) {
        const seenItems = getLocalData('seenItems');

        each(Object.keys(seenItems), (keyIndex, key) => {
          if (zuck.data[key]) {
            zuck.data[key].seen = seenItems[key];
          }
        });
      }

      each(option('stories'), (itemKey, item) => {
        zuck.add(item, true);
      });

      updateStorySeenPosition();

      const avatars = option('avatars') ? 'user-icon' : 'story-preview';
      const list = option('list') ? 'list' : 'carousel';
      const rtl = option('rtl') ? 'rtl' : '';

      timeline.className += ` stories ${avatars} ${list} ${(`${option('skin')}`).toLowerCase()} ${rtl}`;

      return zuck;
    };

    return init();
  };

  /* Helpers */
  ZuckJS.buildTimelineItem = (id, photo, name, link, lastUpdated, items) => {
    const timelineItem = {
      id,
      photo,
      name,
      link,
      lastUpdated,
      items: []
    };

    each(items, (itemIndex, itemArgs) => {
      timelineItem.items.push(ZuckJS.buildStoryItem.apply(ZuckJS, itemArgs));
    });

    return timelineItem;
  };

  ZuckJS.buildStoryItem = (id, type, length, src, preview, link, linkText, seen, time) => {
    return {
      id,
      type,
      length,
      src,
      preview,
      link,
      linkText,
      seen,
      time
    };
  };

  /* Legacy code */
  ZuckJS.buildItem = ZuckJS.buildStoryItem;

  // CommonJS and Node.js module support.
  if (typeof exports !== 'undefined') {
    // Support Node.js specific `module.exports` (which can be a function)
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = ZuckJS;
    }
    // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
    exports.ZuckJS = ZuckJS;
  } else {
    /* Too much zuck zuck to maintain legacy */
    window.ZuckitaDaGalera = window.Zuck = ZuckJS;
  }

  return ZuckJS;
})(window || {});
