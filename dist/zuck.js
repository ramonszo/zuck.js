"use strict";

/*
    zuck.js
    https://github.com/ramon82/zuck.js
    MIT License
*/
(function (window) {
  /* Utilities */
  var query = function query(qs) {
    return document.querySelectorAll(qs)[0];
  };

  var get = function get(array, what) {
    if (array) {
      return array[what] || '';
    } else {
      return '';
    }
  };

  var each = function each(arr, func) {
    if (arr) {
      var total = arr.length;

      for (var i = 0; i < total; i++) {
        func(i, arr[i]);
      }
    }
  };

  var setVendorVariable = function setVendorVariable(ref, variable, value) {
    var variables = [variable.toLowerCase(), "webkit".concat(variable), "MS".concat(variable), "o".concat(variable)];
    each(variables, function (i, val) {
      ref[val] = value;
    });
  };

  var addVendorEvents = function addVendorEvents(el, func, event) {
    var events = [event.toLowerCase(), "webkit".concat(event), "MS".concat(event), "o".concat(event)];
    each(events, function (i, val) {
      el.addEventListener(val, func, false);
    });
  };

  var onAnimationEnd = function onAnimationEnd(el, func) {
    addVendorEvents(el, func, 'AnimationEnd');
  };

  var onTransitionEnd = function onTransitionEnd(el, func) {
    if (!el.transitionEndEvent) {
      el.transitionEndEvent = true;
      addVendorEvents(el, func, 'TransitionEnd');
    }
  };

  var prepend = function prepend(parent, child) {
    if (parent.firstChild) {
      parent.insertBefore(child, parent.firstChild);
    } else {
      parent.appendChild(child);
    }
  };

  var generateId = function generateId() {
    return 'stories-' + Math.random().toString(36).substr(2, 9);
  };
  /* Zuckera */


  var ZuckJS = function ZuckJS(timeline, options) {
    var zuck = this;

    var option = function option(name, prop) {
      var type = function type(what) {
        return typeof what !== 'undefined';
      };

      if (prop) {
        if (type(options[name])) {
          return type(options[name][prop]) ? options[name][prop] : optionsDefault[name][prop];
        } else {
          return optionsDefault[name][prop];
        }
      } else {
        return type(options[name]) ? options[name] : optionsDefault[name];
      }
    };

    var fullScreen = function fullScreen(elem, cancel) {
      var func = 'RequestFullScreen';
      var elFunc = 'requestFullScreen'; // crappy vendor prefixes.

      try {
        if (cancel) {
          if (document.fullscreenElement || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['msFullscreenElement']) {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(function () {});
            } else if (document['mozCancelFullScreen']) {
              document['mozCancelFullScreen']().catch(function () {});
            } else if (document['mozCancelFullScreen']) {
              document['mozCancelFullScreen']().catch(function () {});
            }
          }
        } else {
          if (elem[elFunc]) {
            elem[elFunc]();
          } else if (elem["ms".concat(func)]) {
            elem["ms".concat(func)]();
          } else if (elem["moz".concat(func)]) {
            elem["moz".concat(func)]();
          } else if (elem["webkit".concat(func)]) {
            elem["webkit".concat(func)]();
          }
        }
      } catch (e) {
        console.warn('[Zuck.js] Can\'t access fullscreen');
      }
    };

    var translate = function translate(element, to, duration, ease) {
      var direction = to > 0 ? 1 : -1;
      var to3d = Math.abs(to) / query('#zuck-modal').offsetWidth * 90 * direction;

      if (option('cubeEffect')) {
        var scaling = to3d === 0 ? 'scale(0.95)' : 'scale(0.930,0.930)';
        setVendorVariable(query('#zuck-modal-content').style, 'Transform', scaling);

        if (to3d < -90 || to3d > 90) {
          return false;
        }
      }

      var transform = !option('cubeEffect') ? "translate3d(".concat(to, "px, 0, 0)") : "rotateY(".concat(to3d, "deg)");

      if (element) {
        setVendorVariable(element.style, 'TransitionTimingFunction', ease);
        setVendorVariable(element.style, 'TransitionDuration', "".concat(duration, "ms"));
        setVendorVariable(element.style, 'Transform', transform);
      }
    };

    var findPos = function findPos(obj, offsetY, offsetX, stop) {
      var curleft = 0;
      var curtop = 0;

      if (obj) {
        if (obj.offsetParent) {
          do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;

            if (obj === stop) {
              break;
            }
          } while (obj = obj.offsetParent);
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

    var timeAgo = function timeAgo(time) {
      time = Number(time) * 1000;
      var dateObj = new Date(time);
      var dateStr = dateObj.getTime();
      var seconds = (new Date().getTime() - dateStr) / 1000;
      var language = option('language', 'time');
      var formats = [[60, " ".concat(language['seconds']), 1], // 60
      [120, "1 ".concat(language['minute']), ''], // 60*2
      [3600, " ".concat(language['minutes']), 60], // 60*60, 60
      [7200, "1 ".concat(language['hour']), ''], // 60*60*2
      [86400, " ".concat(language['hours']), 3600], // 60*60*24, 60*60
      [172800, " ".concat(language['yesterday']), ''], // 60*60*24*2
      [604800, " ".concat(language['days']), 86400]];
      var currentFormat = 1;

      if (seconds < 0) {
        seconds = Math.abs(seconds);
        currentFormat = 2;
      }

      var i = 0;
      var format = void 0;

      while (format = formats[i++]) {
        if (seconds < format[0]) {
          if (typeof format[2] === 'string') {
            return format[currentFormat];
          } else {
            return Math.floor(seconds / format[2]) + format[1];
          }
        }
      }

      var day = dateObj.getDate();
      var month = dateObj.getMonth();
      var year = dateObj.getFullYear();
      return "".concat(day, "/").concat(month + 1, "/").concat(year);
    };
    /* options */


    var id = timeline.id;
    var optionsDefault = {
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
        onOpen: function onOpen(storyId, callback) {
          callback();
        },
        onView: function onView(storyId) {},
        onEnd: function onEnd(storyId, callback) {
          callback();
        },
        onClose: function onClose(storyId, callback) {
          callback();
        },
        onNextItem: function onNextItem(storyId, nextStoryId, callback) {
          callback();
        },
        onNavigateItem: function onNavigateItem(storyId, nextStoryId, callback) {
          callback();
        }
      },
      template: {
        timelineItem: function timelineItem(itemData) {
          return "\n            <div class=\"story ".concat(get(itemData, 'seen') === true ? 'seen' : '', "\">\n              <a class=\"item-link\" href=\"").concat(get(itemData, 'link'), "\">\n                <span class=\"item-preview\">\n                  <img lazy=\"eager\" src=\"").concat(option('avatars') || !get(itemData, 'currentPreview') ? get(itemData, 'photo') : get(itemData, 'currentPreview'), "\" />\n                </span>\n                <span class=\"info\" itemProp=\"author\" itemScope itemType=\"http://schema.org/Person\">\n                  <strong class=\"name\" itemProp=\"name\">").concat(get(itemData, 'name'), "</strong>\n                  <span class=\"time\">").concat(get(itemData, 'lastUpdatedAgo'), "</span>\n                </span>\n              </a>\n              \n              <ul class=\"items\"></ul>\n            </div>");
        },
        timelineStoryItem: function timelineStoryItem(itemData) {
          return "<a href=\"".concat(get(itemData, 'src'), "\"\n                      data-link=\"").concat(get(itemData, 'link'), "\"\n                      data-linkText=\"").concat(get(itemData, 'linkText'), "\"\n                      data-time=\"").concat(get(itemData, 'time'), "\"\n                      data-type=\"").concat(get(itemData, 'type'), "\"\n                      data-length=\"").concat(get(itemData, 'length'), "\">\n                    <img loading=\"auto\" src=\"").concat(get(itemData, 'preview'), "\" />\n                  </a>");
        },
        viewerItem: function viewerItem(storyData, currentStoryItem) {
          return "<div class=\"story-viewer\">\n                    <div class=\"head\">\n                      <div class=\"left\">\n                        ".concat(option('backButton') ? '<a class="back">&lsaquo;</a>' : '', "\n\n                        <span class=\"item-preview\">\n                          <img lazy=\"eager\" class=\"profilePhoto\" src=\"").concat(get(storyData, 'photo'), "\" />\n                        </span>\n\n                        <div class=\"info\">\n                          <strong class=\"name\">").concat(get(storyData, 'name'), "</strong>\n                          <span class=\"time\">").concat(get(storyData, 'timeAgo'), "</span>\n                        </div>\n                      </div>\n                      \n                      <div class=\"right\">\n                        <span class=\"time\">").concat(get(currentStoryItem, 'timeAgo'), "</span>\n                        <span class=\"loading\"></span>\n                        <a class=\"close\" tabIndex=\"2\">&times;</a>\n                      </div>\n                    </div>\n\n                    <div class=\"slides-pointers\">\n                      <div class=\"wrap\"></div>\n                    </div>\n\n                    ").concat(option('paginationArrows') ? "<div class=\"slides-pagination\">\n                          <span class=\"previous\">&lsaquo;</span>\n                          <span class=\"next\">&rsaquo;</span>\n                        </div>" : "", "\n                  </div>");
        },
        viewerItemPointer: function viewerItemPointer(index, currentIndex, item) {
          return "<span \n                    class=\"".concat(currentIndex === index ? 'active' : '', " ").concat(get(item, 'seen') === true ? 'seen' : '', "\"\n                    data-index=\"").concat(index, "\" data-item-id=\"").concat(get(item, 'id'), "\">\n                      <b style=\"animation-duration:").concat(get(item, 'length') === '' ? '3' : get(item, 'length'), "s\"></b>\n                  </span>");
        },
        viewerItemBody: function viewerItemBody(index, currentIndex, item) {
          return "<div \n                    class=\"item ".concat(get(item, 'seen') === true ? 'seen' : '', " ").concat(currentIndex === index ? 'active' : '', "\"\n                    data-time=\"").concat(get(item, 'time'), "\" data-type=\"").concat(get(item, 'type'), "\" data-index=\"").concat(index, "\" data-item-id=\"").concat(get(item, 'id'), "\">\n                    ").concat(get(item, 'type') === 'video' ? "<video class=\"media\" muted webkit-playsinline playsinline preload=\"auto\" src=\"".concat(get(item, 'src'), "\" ").concat(get(item, 'type'), "></video>\n                        <b class=\"tip muted\">").concat(option('language', 'unmute'), "</b>") : "<img loading=\"auto\" class=\"media\" src=\"".concat(get(item, 'src'), "\" ").concat(get(item, 'type'), " />\n                    "), "\n\n                    ").concat(get(item, 'link') ? "<a class=\"tip link\" href=\"".concat(get(item, 'link'), "\" rel=\"noopener\" target=\"_blank\">\n                            ").concat(!get(item, 'linkText') || get(item, 'linkText') === '' ? option('language', 'visitLink') : get(item, 'linkText'), "\n                          </a>") : "", "\n                  </div>");
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

    var ZuckModal = function ZuckModal() {
      var modalZuckContainer = query('#zuck-modal');

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

        modalZuckContainer.onkeyup = function (_ref) {
          var keyCode = _ref.keyCode;
          var code = keyCode;

          if (code === 27) {
            modal.close();
          } else if (code === 13 || code === 32) {
            modal.next();
          }
        };

        if (option('openEffect')) {
          modalZuckContainer.classList.add('with-effects');
        }

        onTransitionEnd(modalZuckContainer, function () {
          if (modalZuckContainer.classList.contains('closed')) {
            modalContent.innerHTML = '';
            modalZuckContainer.style.display = 'none';
            modalZuckContainer.classList.remove('closed');
            modalZuckContainer.classList.remove('animated');
          }
        });
        document.body.appendChild(modalZuckContainer);
      }

      var modalContent = query('#zuck-modal-content');

      var moveStoryItem = function moveStoryItem(direction) {
        var modalContainer = query('#zuck-modal');
        var target = '';
        var useless = '';
        var transform = 0;
        var modalSlider = query("#zuck-modal-slider-".concat(id));
        var slideItems = {
          previous: query('#zuck-modal .story-viewer.previous'),
          next: query('#zuck-modal .story-viewer.next'),
          viewing: query('#zuck-modal .story-viewer.viewing')
        };

        if (!slideItems['previous'] && !direction || !slideItems['next'] && direction) {
          return false;
        }

        if (!direction) {
          target = 'previous';
          useless = 'next';
        } else {
          target = 'next';
          useless = 'previous';
        }

        var transitionTime = 600;

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
        setTimeout(function () {
          if (target !== '' && slideItems[target] && useless !== '') {
            var currentStory = slideItems[target].getAttribute('data-story-id');
            zuck.internalData['currentStory'] = currentStory;
            var oldStory = query("#zuck-modal .story-viewer.".concat(useless));

            if (oldStory) {
              oldStory.parentNode.removeChild(oldStory);
            }

            if (slideItems['viewing']) {
              slideItems['viewing'].classList.add('stopped');
              slideItems['viewing'].classList.add(useless);
              slideItems['viewing'].classList.remove('viewing');
            }

            if (slideItems[target]) {
              slideItems[target].classList.remove('stopped');
              slideItems[target].classList.remove(target);
              slideItems[target].classList.add('viewing');
            }

            var newStoryData = getStoryMorningGlory(target);

            if (newStoryData) {
              createStoryViewer(newStoryData, target);
            }

            var storyId = zuck.internalData['currentStory'];
            var items = query("#zuck-modal [data-story-id=\"".concat(storyId, "\"]"));

            if (items) {
              items = items.querySelectorAll('[data-index].active');
              var duration = items[0].firstElementChild;
              zuck.data[storyId]['currentItem'] = parseInt(items[0].getAttribute('data-index'), 10);
              items[0].innerHTML = "<b style=\"".concat(duration.style.cssText, "\"></b>");
              onAnimationEnd(items[0].firstElementChild, function () {
                zuck.nextItem(false);
              });
            }

            translate(modalSlider, '0', 0, null);

            if (items) {
              var storyViewer = query("#zuck-modal .story-viewer[data-story-id=\"".concat(currentStory, "\"]"));
              playVideoItem(storyViewer, [items[0], items[1]], true);
            }

            option('callbacks', 'onView')(zuck.internalData['currentStory']);
          }
        }, transitionTime + 50);
      };

      var createStoryViewer = function createStoryViewer(storyData, className, forcePlay) {
        var modalSlider = query("#zuck-modal-slider-".concat(id));
        var storyItems = get(storyData, 'items');
        storyData.timeAgo = storyItems && storyItems[0] ? timeAgo(get(storyItems[0], 'time')) : '';
        var htmlItems = '';
        var pointerItems = '';
        var storyId = get(storyData, 'id');
        var slides = document.createElement('div');
        var currentItem = get(storyData, 'currentItem') || 0;
        var exists = query("#zuck-modal .story-viewer[data-story-id=\"".concat(storyId, "\"]"));
        var currentItemTime = '';

        if (exists) {
          return false;
        }

        slides.className = 'slides';
        each(storyItems, function (i, item) {
          item.timeAgo = timeAgo(get(item, 'time'));

          if (currentItem > i) {
            storyData['items'][i]['timeAgo'] = item.timeAgo;
            storyData['items'][i]['seen'] = true;
            item['seen'] = true;
          }

          if (currentItem === i) {
            currentItemTime = item.timeAgo;
          }

          pointerItems += option('template', 'viewerItemPointer')(i, currentItem, item);
          htmlItems += option('template', 'viewerItemBody')(i, currentItem, item);
        });
        slides.innerHTML = htmlItems;
        var video = slides.querySelector('video');

        var addMuted = function addMuted(video) {
          if (video.muted) {
            storyViewer.classList.add('muted');
          } else {
            storyViewer.classList.remove('muted');
          }
        };

        if (video) {
          video.onwaiting = function (e) {
            if (video.paused) {
              storyViewer.classList.add('paused');
              storyViewer.classList.add('loading');
            }
          };

          video.onplay = function () {
            addMuted(video);
            storyViewer.classList.remove('stopped');
            storyViewer.classList.remove('paused');
            storyViewer.classList.remove('loading');
          };

          video.onload = video.onplaying = video.oncanplay = function () {
            addMuted(video);
            storyViewer.classList.remove('loading');
          };

          video.onvolumechange = function () {
            addMuted(video);
          };
        }

        var storyViewerWrap = document.createElement('div');
        storyViewerWrap.innerHTML = option('template', 'viewerItem')(storyData, currentItem);
        var storyViewer = storyViewerWrap.firstElementChild;
        storyViewer.className = "story-viewer muted ".concat(className, " ").concat(!forcePlay ? 'stopped' : '', " ").concat(option('backButton') ? 'with-back-button' : '');
        storyViewer.setAttribute('data-story-id', storyId);
        storyViewer.querySelector('.slides-pointers .wrap').innerHTML = pointerItems;
        each(storyViewer.querySelectorAll('.close, .back'), function (i, el) {
          el.onclick = function (e) {
            e.preventDefault();
            modal.close();
          };
        });
        storyViewer.appendChild(slides);

        if (className === 'viewing') {
          playVideoItem(storyViewer, storyViewer.querySelectorAll("[data-index=\"".concat(currentItem, "\"].active")), false);
        }

        each(storyViewer.querySelectorAll('.slides-pointers [data-index] > b'), function (i, el) {
          onAnimationEnd(el, function () {
            zuck.nextItem(false);
          });
        });

        if (className === 'previous') {
          prepend(modalSlider, storyViewer);
        } else {
          modalSlider.appendChild(storyViewer);
        }
      };

      var createStoryTouchEvents = function createStoryTouchEvents(modalSliderElement) {
        var modalContainer = query('#zuck-modal');
        var enableMouseEvents = true;
        var modalSlider = modalSliderElement;
        var position = {};
        var touchOffset = void 0;
        var isScrolling = void 0;
        var delta = void 0;
        var timer = void 0;
        var nextTimer = void 0;

        var touchStart = function touchStart(event) {
          var storyViewer = query('#zuck-modal .viewing');

          if (event.target.nodeName === 'A') {
            return;
          }

          var touches = event.touches ? event.touches[0] : event;
          var pos = findPos(query('#zuck-modal .story-viewer.viewing'));
          modalContainer.slideWidth = query('#zuck-modal .story-viewer').offsetWidth;
          modalContainer.slideHeight = query('#zuck-modal .story-viewer').offsetHeight;
          position = {
            x: pos[0],
            y: pos[1]
          };
          var pageX = touches.pageX;
          var pageY = touches.pageY;
          touchOffset = {
            x: pageX,
            y: pageY,
            time: Date.now(),
            valid: true
          };

          if (pageY < 80 || pageY > modalContainer.slideHeight - 80) {
            touchOffset.valid = false;
            return;
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
            timer = setTimeout(function () {
              storyViewer.classList.add('longPress');
            }, 600);
            nextTimer = setTimeout(function () {
              clearInterval(nextTimer);
              nextTimer = false;
            }, 250);
          }
        };

        var touchMove = function touchMove(event) {
          var touches = event.touches ? event.touches[0] : event;
          var pageX = touches.pageX;
          var pageY = touches.pageY;

          if (touchOffset && touchOffset.valid) {
            delta = {
              x: pageX - touchOffset.x,
              y: pageY - touchOffset.y
            };

            if (typeof isScrolling === 'undefined') {
              isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
            }

            if (!isScrolling && touchOffset) {
              event.preventDefault();
              translate(modalSlider, position.x + delta.x, 0, null);
            }
          }
        };

        var touchEnd = function touchEnd(event) {
          var storyViewer = query('#zuck-modal .viewing');
          var lastTouchOffset = touchOffset;

          if (touchOffset && !touchOffset.valid) {
            return;
          } else {
            if (delta) {
              var duration = touchOffset ? Date.now() - touchOffset.time : undefined;
              var isValid = Number(duration) < 300 && Math.abs(delta.x) > 25 || Math.abs(delta.x) > modalContainer.slideWidth / 3;
              var direction = delta.x < 0;
              var index = direction ? query('#zuck-modal .story-viewer.next') : query('#zuck-modal .story-viewer.previous');
              var isOutOfBounds = direction && !index || !direction && !index;

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

            var video = zuck.internalData['currentVideoElement'];

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

              var navigateItem = function navigateItem() {
                if (lastTouchOffset.x > window.screen.width / 3 || !option('previousTap')) {
                  zuck.navigateItem('next', event);
                } else {
                  zuck.navigateItem('previous', event);
                }
              };

              var storyViewerViewing = query('#zuck-modal .viewing');

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
        show: function show(storyId, page) {
          var modalContainer = query('#zuck-modal');

          var callback = function callback() {
            modalContent.innerHTML = "<div id=\"zuck-modal-slider-".concat(id, "\" class=\"slider\"></div>");
            var storyData = zuck.data[storyId];
            var currentItem = storyData['currentItem'] || 0;
            var modalSlider = query("#zuck-modal-slider-".concat(id));
            createStoryTouchEvents(modalSlider);
            zuck.internalData['currentStory'] = storyId;
            storyData['currentItem'] = currentItem;

            if (option('backNative')) {
              window.location.hash = "#!".concat(id);
            }

            var previousItemData = getStoryMorningGlory('previous');

            if (previousItemData) {
              createStoryViewer(previousItemData, 'previous');
            }

            createStoryViewer(storyData, 'viewing', true);
            var nextItemData = getStoryMorningGlory('next');

            if (nextItemData) {
              createStoryViewer(nextItemData, 'next');
            }

            if (option('autoFullScreen')) {
              modalContainer.classList.add('fullscreen');
            }

            var tryFullScreen = function tryFullScreen() {
              if (modalContainer.classList.contains('fullscreen') && option('autoFullScreen') && window.screen.width <= 1024) {
                fullScreen(modalContainer);
              }

              modalContainer.focus();
            };

            if (option('openEffect')) {
              var storyEl = query("#".concat(id, " [data-id=\"").concat(storyId, "\"] .item-preview"));
              var pos = findPos(storyEl);
              modalContainer.style.marginLeft = "".concat(pos[0] + storyEl.offsetWidth / 2, "px");
              modalContainer.style.marginTop = "".concat(pos[1] + storyEl.offsetHeight / 2, "px");
              modalContainer.style.display = 'block';
              modalContainer.slideWidth = query('#zuck-modal .story-viewer').offsetWidth;
              setTimeout(function () {
                modalContainer.classList.add('animated');
              }, 10);
              setTimeout(function () {
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
        next: function next(unmute) {
          var callback = function callback() {
            var lastStory = zuck.internalData['currentStory'];
            var lastStoryTimelineElement = query("#".concat(id, " [data-id=\"").concat(lastStory, "\"]"));

            if (lastStoryTimelineElement) {
              lastStoryTimelineElement.classList.add('seen');
              zuck.data[lastStory]['seen'] = true;
              zuck.internalData['seenItems'][lastStory] = true;
              saveLocalData('seenItems', zuck.internalData['seenItems']);
              updateStorySeenPosition();
            }

            var stories = query('#zuck-modal .story-viewer.next');

            if (!stories) {
              modal.close();
            } else {
              moveStoryItem(true);
            }
          };

          option('callbacks', 'onEnd')(zuck.internalData['currentStory'], callback);
        },
        close: function close() {
          var modalContainer = query('#zuck-modal');

          var callback = function callback() {
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

          option('callbacks', 'onClose')(zuck.internalData['currentStory'], callback);
        }
      };
    };

    var modal = ZuckModal();
    /* parse functions */

    var parseItems = function parseItems(story, forceUpdate) {
      var storyId = story.getAttribute('data-id');
      var storyItems = document.querySelectorAll("#".concat(id, " [data-id=\"").concat(storyId, "\"] .items > li"));
      var items = [];

      if (!option('reactive') || forceUpdate) {
        each(storyItems, function (i, _ref2) {
          var firstElementChild = _ref2.firstElementChild;
          var a = firstElementChild;
          var img = a.firstElementChild;
          items.push({
            id: a.getAttribute('data-id'),
            src: a.getAttribute('href'),
            length: a.getAttribute('data-length'),
            type: a.getAttribute('data-type'),
            time: a.getAttribute('data-time'),
            link: a.getAttribute('data-link'),
            linkText: a.getAttribute('data-linkText'),
            preview: img.getAttribute('src')
          });
        });
        zuck.data[storyId].items = items;
        var callback = option('callbacks', 'onDataUpdate');

        if (callback) {
          callback(zuck.data, function () {});
        }
      }
    };

    var parseStory = function parseStory(story, returnCallback) {
      var storyId = story.getAttribute('data-id');
      var seen = false;

      if (zuck.internalData['seenItems'][storyId]) {
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

      story.onclick = function (e) {
        e.preventDefault();
        modal.show(storyId);
      };

      var callback = option('callbacks', 'onDataUpdate');

      if (callback) {
        callback(zuck.data, function () {});
      }
    }; // BIBLICAL


    var getStoryMorningGlory = function getStoryMorningGlory(what) {
      // my wife told me to stop singing Wonderwall. I SAID MAYBE.
      var currentStory = zuck.internalData['currentStory'];
      var whatElementYouMean = "".concat(what, "ElementSibling");

      if (currentStory) {
        var foundStory = query("#".concat(id, " [data-id=\"").concat(currentStory, "\"]"))[whatElementYouMean];

        if (foundStory) {
          var storyId = foundStory.getAttribute('data-id');
          var data = zuck.data[storyId] || false;
          return data;
        }
      }

      return false;
    };

    var updateStorySeenPosition = function updateStorySeenPosition() {
      each(document.querySelectorAll("#".concat(id, " .story.seen")), function (i, el) {
        var newData = zuck.data[el.getAttribute('data-id')];
        var timeline = el.parentNode;

        if (!option('reactive')) {
          timeline.removeChild(el);
        }

        zuck.update(newData, true);
      });
    };

    var playVideoItem = function playVideoItem(storyViewer, elements, unmute) {
      var itemElement = elements[1];
      var itemPointer = elements[0];

      if (!itemElement || !itemPointer) {
        return false;
      }

      var cur = zuck.internalData['currentVideoElement'];

      if (cur) {
        cur.pause();
      }

      if (itemElement.getAttribute('data-type') === 'video') {
        var video = itemElement.getElementsByTagName('video')[0];

        if (!video) {
          zuck.internalData['currentVideoElement'] = false;
          return false;
        }

        var setDuration = function setDuration() {
          if (video.duration) {
            setVendorVariable(itemPointer.getElementsByTagName('b')[0].style, 'AnimationDuration', "".concat(video.duration, "s"));
          }
        };

        setDuration();
        video.addEventListener('loadedmetadata', setDuration);
        zuck.internalData['currentVideoElement'] = video;
        video.play();

        if (unmute && unmute.target) {
          unmuteVideoItem(video, storyViewer);
        }
      } else {
        zuck.internalData['currentVideoElement'] = false;
      }
    };

    var pauseVideoItem = function pauseVideoItem() {
      var video = zuck.internalData['currentVideoElement'];

      if (video) {
        try {
          video.pause();
        } catch (e) {}
      }
    };

    var unmuteVideoItem = function unmuteVideoItem(video, storyViewer) {
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


    var saveLocalData = function saveLocalData(key, data) {
      try {
        if (option('localStorage')) {
          var keyName = "zuck-".concat(id, "-").concat(key);
          window.localStorage[keyName] = JSON.stringify(data);
        }
      } catch (e) {}
    };

    var getLocalData = function getLocalData(key) {
      if (option('localStorage')) {
        var keyName = "zuck-".concat(id, "-").concat(key);
        return window.localStorage[keyName] ? JSON.parse(window.localStorage[keyName]) : false;
      } else {
        return false;
      }
    };
    /* api */


    zuck.data = option('stories') || {};
    zuck.internalData = {};
    zuck.internalData['seenItems'] = getLocalData('seenItems') || {};

    zuck.add = zuck.update = function (data, append) {
      var storyId = get(data, 'id');
      var storyEl = query("#".concat(id, " [data-id=\"").concat(storyId, "\"]"));
      var items = get(data, 'items');
      var story = undefined;
      var preview = false;

      if (items[0]) {
        preview = items[0]['preview'] || '';
      }

      if (zuck.internalData['seenItems'][storyId] === true) {
        data.seen = true;
      }

      data.currentPreview = preview;

      if (!storyEl) {
        var storyItem = document.createElement('div');
        storyItem.innerHTML = option('template', 'timelineItem')(data);
        story = storyItem.firstElementChild;
      } else {
        story = storyEl;
      }

      if (data['seen'] === false) {
        zuck.internalData['seenItems'][storyId] = false;
        saveLocalData('seenItems', zuck.internalData['seenItems']);
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

      each(items, function (i, item) {
        zuck.addItem(storyId, item, append);
      });

      if (!append) {
        updateStorySeenPosition();
      }
    };

    zuck.next = function () {
      modal.next();
    };

    zuck.remove = function (storyId) {
      var story = query("#".concat(id, " > [data-id=\"").concat(storyId, "\"]"));
      story.parentNode.removeChild(story);
    };

    zuck.addItem = function (storyId, data, append) {
      var story = query("#".concat(id, " > [data-id=\"").concat(storyId, "\"]"));

      if (!option('reactive')) {
        var li = document.createElement('li');
        var el = story.querySelectorAll('.items')[0];
        li.className = get(data, 'seen') ? 'seen' : '';
        li.setAttribute('data-id', get(data, 'id')); // wow, too much jsx

        li.innerHTML = option('template', 'timelineStoryItem')(data);

        if (append) {
          el.appendChild(li);
        } else {
          prepend(el, li);
        }
      }

      parseItems(story);
    };

    zuck.removeItem = function (storyId, itemId) {
      var item = query("#".concat(id, " > [data-id=\"").concat(storyId, "\"] [data-id=\"").concat(itemId, "\"]"));

      if (!option('reactive')) {
        timeline.parentNode.removeChild(item);
      }
    };

    zuck.navigateItem = zuck.nextItem = function (direction, event) {
      var currentStory = zuck.internalData['currentStory'];
      var currentItem = zuck.data[currentStory]['currentItem'];
      var storyViewer = query("#zuck-modal .story-viewer[data-story-id=\"".concat(currentStory, "\"]"));
      var directionNumber = direction === 'previous' ? -1 : 1;

      if (!storyViewer || storyViewer.touchMove === 1) {
        return false;
      }

      var currentItemElements = storyViewer.querySelectorAll("[data-index=\"".concat(currentItem, "\"]"));
      var currentPointer = currentItemElements[0];
      var currentItemElement = currentItemElements[1];
      var navigateItem = currentItem + directionNumber;
      var nextItems = storyViewer.querySelectorAll("[data-index=\"".concat(navigateItem, "\"]"));
      var nextPointer = nextItems[0];
      var nextItem = nextItems[1];

      if (storyViewer && nextPointer && nextItem) {
        var navigateItemCallback = function navigateItemCallback() {
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
          each(storyViewer.querySelectorAll('.time'), function (i, el) {
            el.innerText = timeAgo(nextItem.getAttribute('data-time'));
          });
          zuck.data[currentStory]['currentItem'] = zuck.data[currentStory]['currentItem'] + directionNumber;
          playVideoItem(storyViewer, nextItems, event);
        };

        var callback = option('callbacks', 'onNavigateItem');
        callback = !callback ? option('callbacks', 'onNextItem') : option('callbacks', 'onNavigateItem');
        callback(currentStory, nextItem.getAttribute('data-story-id'), navigateItemCallback);
      } else if (storyViewer) {
        if (direction !== 'previous') {
          modal.next(event);
        }
      }
    };

    var init = function init() {
      if (timeline && timeline.querySelector('.story')) {
        each(timeline.querySelectorAll('.story'), function (storyIndex, story) {
          parseStory(story);
        });
      }

      if (option('backNative')) {
        if (window.location.hash === "#!".concat(id)) {
          window.location.hash = '';
        }

        window.addEventListener('popstate', function (e) {
          if (window.location.hash !== "#!".concat(id)) {
            window.location.hash = '';
          }
        }, false);
      }

      if (!option('reactive')) {
        var seenItems = getLocalData('seenItems');

        for (var key in seenItems) {
          if (seenItems.hasOwnProperty(key)) {
            if (zuck.data[key]) {
              zuck.data[key].seen = seenItems[key];
            }
          }
        }
      }

      each(option('stories'), function (i, item) {
        zuck.add(item, true);
      });
      updateStorySeenPosition();
      var avatars = option('avatars') ? 'user-icon' : 'story-preview';
      var list = option('list') ? 'list' : 'carousel';
      timeline.className += " stories ".concat(avatars, " ").concat(list, " ").concat("".concat(option('skin')).toLowerCase());
      return zuck;
    };

    return init();
  };
  /* Helpers */


  ZuckJS.buildTimelineItem = function (id, photo, name, link, lastUpdated, items) {
    var timelineItem = {
      id: id,
      photo: photo,
      name: name,
      link: link,
      lastUpdated: lastUpdated,
      items: []
    };
    each(items, function (itemIndex, itemArgs) {
      timelineItem.items.push(ZuckJS.buildStoryItem.apply(ZuckJS, itemArgs));
    });
    return timelineItem;
  };

  ZuckJS.buildStoryItem = function (id, type, length, src, preview, link, linkText, seen, time) {
    return {
      id: id,
      type: type,
      length: length,
      src: src,
      preview: preview,
      link: link,
      linkText: linkText,
      seen: seen,
      time: time
    };
  };
  /* Legacy code */


  ZuckJS.buildItem = ZuckJS.buildStoryItem; // CommonJS and Node.js module support.

  if (typeof exports !== 'undefined') {
    // Support Node.js specific `module.exports` (which can be a function)
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = ZuckJS;
    } // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)


    exports.ZuckJS = ZuckJS;
  } else {
    /* Too much zuck zuck to maintain legacy */
    window['ZuckitaDaGalera'] = window['Zuck'] = ZuckJS;
  }

  return ZuckJS;
})(window || {});