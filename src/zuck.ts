import {
  Maybe, Zuck, OptionsLanguage, StoryItem, TimelineItem, ModalOptions, Callbacks, Options, ModalContainer, TransitionElement
} from './types';

export const ZuckJS = function(timeline: HTMLElement, options?: Options) {
  /* Utilities */
  const safeNum = (num?: null | number | string) => {
    return num ? Number(num) : 0;
  };
  
  const setVendorVariable = (ref?: CSSStyleDeclaration, variable?: string, value?: string) => {
    const variables = [
      `${variable}`.toLowerCase(),
        `webkit${variable}`,
        `MS${variable}`,
        `o${variable}`
    ];
  
    variables?.forEach((val) => {
      (ref as any)[val] = value;
    });
  };
  
  const addVendorEvents = (
    el: HTMLElement,
    func: (e: Event) => void,
    event: string
  ) => {
    const events = [
      event.toLowerCase(),
        `webkit${event}`,
        `MS${event}`,
        `o${event}`
    ];
  
    events.forEach((val) => {
      el.addEventListener(val, func, false);
    });
  };
  
  const onAnimationEnd = (
    el: HTMLElement,
    func: (e: Event) => void
  ) => {
    addVendorEvents(el, func, 'AnimationEnd');
  };
  
  const onTransitionEnd = (
    el: TransitionElement | ModalContainer,
    func: (e: Event) => void
  ) => {
    if (!el.transitionEndEvent) {
      el.transitionEndEvent = true;
      addVendorEvents(el, func, 'TransitionEnd');
    }
  };
  
  const prepend = (parent?: HTMLElement | null, child?: HTMLElement | null) => {
    if (!child || !parent) {
      return;
    }
  
    if (parent?.firstChild) {
      parent.insertBefore(child, parent?.firstChild);
    } else {
      parent.appendChild(child);
    }
  };
  
  const generateId = (): string => {
    return (
      'stories-' +
        Math.random()
          .toString(36)
          .substr(2, 9)
    );
  };
  
  const zuck = {} as any;

  const option = function(name: string, prop?: string) {
    const notUndefined = function(what: string): boolean {
      return typeof what !== "undefined";
    };

    if (prop) {
      if (notUndefined(options?.[name])) {
        return notUndefined(options?.[name]?.[prop])
          ? options?.[name]?.[prop]
          : optionsDefault[name]?.[prop];
      } else {
        return optionsDefault[name]?.[prop];
      }
    } else {
      return notUndefined(options?.[name]) ? options?.[name] : optionsDefault[name];
    }
  };

  const fullScreen = function(elem?: Maybe<HTMLElement>, cancel?: boolean) {
    const anyDocument = (document as any);
    const anyElem = (elem as any);

    const func = "RequestFullScreen";
    const elFunc = "requestFullScreen";

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

  const translate = function(
    element?: Maybe<HTMLElement>,
    to?: number,
    duration?: number,
    ease?: string | null
  ) {
    if (to===undefined || to && isNaN(to)) {
      return;
    }

    const direction = to > 0 ? 1 : -1;
    const modalWidth = document.querySelector<HTMLElement>("#zuck-modal")?.offsetWidth || 1;
    const to3d =
      (Math.abs(to) / modalWidth) * 90 * direction;

    if (option("cubeEffect")) {
      const scaling = to3d === 0 ? "scale(0.95)" : "scale(0.930,0.930)";

      setVendorVariable(
        document.querySelector<HTMLElement>("#zuck-modal-content")?.style,
        "Transform",
        scaling
      );

      if (to3d < -90 || to3d > 90) {
        return false;
      }
    }

    const transform = !option("cubeEffect")
      ? `translate3d(${to}px, 0, 0)`
      : `rotateY(${to3d}deg)`;

    if (element) {
      if (ease) {
        setVendorVariable(element?.style, "TransitionTimingFunction", ease);
      }

      setVendorVariable(element?.style, "TransitionDuration", `${duration}ms`);
      setVendorVariable(element?.style, "Transform", transform);
    }
  };

  const findPos = function(
    obj?: Maybe<HTMLElement>,
    offsetY?: number,
    offsetX?: number,
    stop?: Maybe<HTMLElement>
  ): [number, number] {
    let curleft = 0;
    let curtop = 0;

    if (obj) {
      if (obj.offsetParent as HTMLElement) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;

          if (obj === stop) {
            break;
          }
        } while ((obj = obj.offsetParent as HTMLElement));
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
  const timeAgo = (time?: Maybe<number | string>, langObj?: OptionsLanguage['time']) => {
    const language = langObj || option("language");

    time = safeNum(time) * 1000;

    const dateObj = new Date(time);
    const dateStr = dateObj.getTime();
    let seconds = (new Date().getTime() - dateStr) / 1000;

    const formats: [number, string, number | ""][] = [
      [60, ` ${language.seconds}`, 1], // 60
      [120, `1 ${language.minute}`, ""], // 60*2
      [3600, ` ${language.minutes}`, 60], // 60*60, 60
      [7200, `1 ${language.hour}`, ""], // 60*60*2
      [86400, ` ${language.hours}`, 3600], // 60*60*24, 60*60
      [172800, ` ${language.yesterday}`, ""], // 60*60*24*2
      [604800, ` ${language.days}`, 86400]
    ];

    let currentFormat = 1;
    if (seconds < 0) {
      seconds = Math.abs(seconds);

      currentFormat = 2;
    }

    let result: string | number | boolean = false;
    formats.forEach(format => {
      const formatKey = format[0];
      if (seconds < formatKey && !result) {
        if (typeof format[2] === "string") {
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

  if (!timeline.id) {
    timeline.setAttribute("id", generateId());
  }

  /* options */
  const id = timeline.id;
  const optionsDefault: Options = {
    rtl: false,
    skin: "snapgram",
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
      onOpen: function(storyId, callback) {
        callback();
      },
      onView: function(storyId) {},
      onEnd: function(storyId, callback) {
        callback();
      },
      onClose: function(storyId, callback) {
        callback();
      },
      onNextItem: function(storyId, nextStoryId, callback) {
        callback();
      },
      onNavigateItem: function(storyId, nextStoryId, callback) {
        callback();
      }
    },
    template: {
      timelineItem(itemData: TimelineItem) {
        return `
          <div class="story ${itemData["seen"] === true ? "seen" : ""}">
            <a class="item-link" ${itemData['link'] ? `href="${itemData["link"] || ''}"` : ''}>
              <span class="item-preview">
                <img lazy="eager" src="${
                  option("avatars") || !itemData["currentPreview"]
                    ? itemData["photo"]
                    : itemData["currentPreview"]
                }" />
              </span>
              <span class="info" itemProp="author" itemScope itemType="http://schema.org/Person">
                <strong class="name" itemProp="name">${(itemData["name"])}</strong>
                <span class="time">${itemData["lastUpdatedAgo"]}</span>
              </span>
            </a>
            
            <ul class="items"></ul>
          </div>`;
      },

      timelineStoryItem(itemData: StoryItem) {
        const reserved = [
          "id",
          "seen",
          "src",
          "link",
          "linkText",
          "time",
          "type",
          "length",
          "preview"
        ];
        let attributes = `
          href="${itemData["src"]}"
          data-link="${itemData["link"]}"
          data-linkText="${itemData["linkText"]}"
          data-time="${itemData["time"]}"
          data-type="${itemData["type"]}"
          data-length="${itemData["length"]}"
        `;

        for (const dataKey in itemData) {
          if (reserved.indexOf(dataKey) === -1) {
            attributes += ` data-${dataKey}="${itemData[dataKey]}"`;
          }
        }

        return `<a ${attributes}>
                  <img loading="auto" src="${itemData["preview"]}" />
                </a>`;
      },

      viewerItem(storyData: StoryItem, currentStoryItem: StoryItem) {
        return `<div class="story-viewer">
                  <div class="head">
                    <div class="left">
                      ${
                        option("backButton")
                          ? '<a class="back">&lsaquo;</a>'
                          : ""
                      }

                      <span class="item-preview">
                        <img lazy="eager" class="profilePhoto" src="${storyData["photo"]}" />
                      </span>

                      <div class="info">
                        <strong class="name">${storyData["name"]}</strong>
                        <span class="time">${storyData["timeAgo"]}</span>
                      </div>
                    </div>

                    <div class="right">
                      <span class="time">${currentStoryItem["timeAgo"]}</span>
                      <span class="loading"></span>
                      <a class="close" tabIndex="2">&times;</a>
                    </div>
                  </div>

                  <div class="slides-pointers">
                    <div class="wrap"></div>
                  </div>

                  ${
                    option("paginationArrows")
                      ? `<div class="slides-pagination">
                        <span class="previous">&lsaquo;</span>
                        <span class="next">&rsaquo;</span>
                      </div>`
                      : ""
                  }
                </div>`;
      },

      viewerItemPointer(index: number, currentIndex: number, item: StoryItem) {
        return `<span 
                  class="${currentIndex === index ? "active" : ""} ${
          item["seen"] === true ? "seen" : ""
        }"
                  data-index="${index}" data-item-id="${item["id"]}">
                    <b style="animation-duration:${
                      safeNum(item["length"]) ? item["length"] : "3"
                    }s"></b>
                </span>`;
      },

      viewerItemBody(index: number, currentIndex: number, item: StoryItem) {
        return `<div 
                  class="item ${item["seen"] === true ? "seen" : ""} ${
          currentIndex === index ? "active" : ""
        }"
                  data-time="${item["time"]}" data-type="${
          item
          ["type"]
        }" data-index="${index}" data-item-id="${item["id"]}">
                  ${
                    item["type"] === "video"
                      ? `<video class="media" muted webkit-playsinline playsinline preload="auto" src="${(
                          item["src"]
                        )}" ${item["type"]}></video>
                      <b class="tip muted">${option(
                        "language",
                        "unmute"
                      )}</b>`
                      : `<img loading="auto" class="media" src="${(
                          item["src"]
                        )}" ${item["type"]} />
                  `
                  }

                  ${
                    item["link"]
                      ? `<a class="tip link" href="${(
                          item["link"]
                        )}" rel="noopener" target="_blank">
                          ${
                            !item["linkText"] ||
                            item["linkText"] === ""
                              ? option("language", "visitLink")
                              : item["linkText"]
                          }
                        </a>`
                      : ""
                  }
                </div>`;
      }
    },
    language: {
      unmute: "Touch to unmute",
      keyboardTip: "Press space to see next",
      visitLink: "Visit link",
      time: {
        ago: "ago",
        hour: "hour ago",
        hours: "hours ago",
        minute: "minute ago",
        minutes: "minutes ago",
        fromnow: "from now",
        seconds: "seconds ago",
        yesterday: "yesterday",
        tomorrow: "tomorrow",
        days: "days ago"
      }
    }
  };

  /* modal */
  const ZuckModal = () => {
    const init = () => {
    let modalContainer = document.querySelector<HTMLElement>("#zuck-modal");
    let modalContent = document.querySelector<HTMLElement>("#zuck-modal-content");

    if (!modalContainer && !zuck.hasModal) {
      zuck.hasModal = true;

      modalContainer = document.createElement("div");
      modalContainer.id = "zuck-modal";

      if (option("cubeEffect")) {
        modalContainer.className = "with-cube";
      }

      modalContainer.innerHTML = '<div id="zuck-modal-content"></div>';
      modalContainer.style.display = "none";

      modalContent = document.querySelector<HTMLElement>("#zuck-modal-content");

      modalContainer.setAttribute("tabIndex", "1");
      modalContainer.onkeyup = ({ keyCode }) => {
        const code = keyCode;

        if (code === 27) {
          modal.close();
        } else if (code === 13 || code === 32) {
          modal.next();
        }
      };

      if (option("openEffect")) {
        modalContainer?.classList.add("with-effects");
      }

      if (option("rtl")) {
        modalContainer?.classList.add("rtl");
      }

      onTransitionEnd(modalContainer, () => {
        if (modalContainer?.classList.contains("closed") && modalContainer && modalContent) {
          modalContent.innerHTML = "";
          modalContainer.style.display = "none";
          modalContainer.classList.remove("closed");
          modalContainer.classList.remove("animated");
        }
      });

      document.body.appendChild(modalContainer);
    }
  }
    const moveStoryItem = (direction: boolean) => {
      const modalContainer = document.querySelector<HTMLElement>("#zuck-modal") as ModalContainer;
      const modalSlider = document.querySelector<HTMLElement>(`#zuck-modal-slider-${id}`);

      let target: 'previous' | 'next' | '' = "";
      let useless: 'previous' | 'next' | '' = "";
      let transform = 0;

      const slideItems = {
        previous: document.querySelector<HTMLElement>("#zuck-modal .story-viewer.previous"),
        next: document.querySelector<HTMLElement>("#zuck-modal .story-viewer.next"),
        viewing: document.querySelector<HTMLElement>("#zuck-modal .story-viewer.viewing")
      };

      if (
        (!slideItems.previous && !direction) ||
        (!slideItems.next && direction)
      ) {
        if (!option("rtl")) {
          return false;
        }
      }

      if (!direction) {
        target = "previous";
        useless = "next";
      } else {
        target = "next";
        useless = "previous";
      }

      const transitionTime = 600;
      if (option("cubeEffect")) {
        if (target === "previous") {
          transform = safeNum(modalContainer?.slideWidth);
        } else if (target === "next") {
          transform = safeNum(modalContainer?.slideWidth) * -1;
        }
      } else {
        transform = findPos(slideItems[target])[0] * -1;
      }

      translate(modalSlider, transform, transitionTime, null);

      setTimeout(() => {
        // set page data when transition complete
        if (option("rtl")) {
          const tmp = target;
          target = useless;
          useless = tmp;
        }

        if (target !== "" && slideItems[target] && useless !== "") {
          const currentStory = slideItems[target]?.getAttribute(
            "data-story-id"
          );
          zuck.internalData.currentStory = currentStory;

          const oldStory = document.querySelector<HTMLElement>(`#zuck-modal .story-viewer.${useless}`);
          if (oldStory) {
            oldStory?.parentNode?.removeChild(oldStory);
          }

          if (slideItems.viewing) {
            slideItems.viewing?.classList.add("stopped");
            slideItems.viewing?.classList.add(useless);
            slideItems.viewing?.classList.remove("viewing");
          }

          if (slideItems[target]) {
            slideItems[target]?.classList.remove("stopped");
            slideItems[target]?.classList.remove(target);
            slideItems[target]?.classList.add("viewing");
          }

          const newTimelineItem = getStoryMorningGlory(target);
          if (newTimelineItem) {
            createStoryViewer(newTimelineItem, target);
          }

          const storyId = zuck.internalData.currentStory;
          const storyWrap = document.querySelector(`#zuck-modal [data-story-id="${storyId}"]`) as HTMLElement;
          if (storyWrap) {
            let items = storyWrap.querySelectorAll("[data-index].active");

            if (items?.[0]) {
              const duration = items?.[0].firstElementChild as HTMLElement;

              zuck.data[storyId].currentItem = safeNum(
                items?.[0].getAttribute("data-index")
              );

              if (items?.[0]) {
                items[0].innerHTML = `<b style="${duration?.style.cssText}"></b>`;
              }

              onAnimationEnd(duration, () => {
                zuck.nextItem(false);
              });
            }

            translate(modalSlider, 0, 0, null);

            if (items) {
              const storyViewer = document.querySelector<HTMLElement>(
                `#zuck-modal .story-viewer[data-story-id="${currentStory}"]`
              );

              playVideoItem(storyViewer, items);
            }

            option("callbacks", "onView")(zuck.internalData.currentStory);
          }
        }
      }, transitionTime + 50);
    };

    const createStoryViewer = function(
      storyData: TimelineItem,
      className: string,
      forcePlay?: boolean
    ) {
      const modalContainer = document.querySelector<ModalContainer>("#zuck-modal");
      const modalSlider = document.querySelector<HTMLElement>(`#zuck-modal-slider-${id}`);
      const storyItems = storyData["items"];

      storyData.timeAgo =
        storyItems && storyItems[0]
          ? timeAgo(storyItems[0]["time"])
          : "";

      let htmlItems = "";
      let pointerItems = "";

      const storyId = storyData["id"];
      const slides = document.createElement("div");
      const currentItem = storyData["currentItem"] || 0;
      const exists = document.querySelector<HTMLElement>(
        `#zuck-modal .story-viewer[data-story-id="${storyId}"]`
      );

      if (exists) {
        return false;
      }

      slides.className = "slides";
      storyItems.forEach((item, i) => {
        item.timeAgo = timeAgo(item["time"]);

        if (currentItem > i) {
          storyData.items[i].timeAgo = item.timeAgo;
          storyData.items[i].seen = true;
          item.seen = true;
        }

        pointerItems += option("template", "viewerItemPointer")(
          i,
          currentItem,
          item
        );
        htmlItems += option("template", "viewerItemBody")(
          i,
          currentItem,
          item
        );
      });

      slides.innerHTML = htmlItems;

      const video = slides.querySelector("video");
      const addMuted = function(video: HTMLVideoElement) {
        const storyViewer = document.querySelector<HTMLElement>(".story-viewer");

        if (video.muted) {
          storyViewer?.classList.add("muted");
        } else {
          storyViewer?.classList.remove("muted");
        }
      };

      if (video) {
        video.onwaiting = e => {
          if (video.paused) {
            const storyViewer = document.querySelector<HTMLElement>(".story-viewer");
            storyViewer?.classList.add("paused");
            storyViewer?.classList.add("loading");
          }
        };

        video.onplay = () => {
          addMuted(video);

          const storyViewer = document.querySelector<HTMLElement>(".story-viewer");
          storyViewer?.classList.remove("stopped");
          storyViewer?.classList.remove("paused");
          storyViewer?.classList.remove("loading");
        };

        video.onload = video.onplaying = video.oncanplay = () => {
          addMuted(video);

          const storyViewer = document.querySelector<HTMLElement>(".story-viewer");
          storyViewer?.classList.remove("loading");
        };

        video.onvolumechange = () => {
          addMuted(video);
        };
      }

      const storyViewerWrap = document.createElement("div");
      storyViewerWrap.innerHTML = option("template", "viewerItem")(
        storyData,
        currentItem
      );

      const storyViewer = storyViewerWrap.firstElementChild as HTMLElement;
      const storyViewerPointerWrap = storyViewer.querySelector<HTMLElement>(
        ".slides-pointers .wrap"
      );

      storyViewer.className = `story-viewer muted ${className} ${
        !forcePlay ? "stopped" : ""
      } ${option("backButton") ? "with-back-button" : ""}`;

      if (storyId) {
        storyViewer.setAttribute("data-story-id", storyId);
      }

      if (storyViewerPointerWrap) {
        storyViewerPointerWrap.innerHTML = pointerItems;
      }

      storyViewer.querySelectorAll<HTMLDivElement>(".close, .back").forEach((el) => {
        el.onclick = e => {
          e.preventDefault();
          modal.close();
        };
      });

      storyViewer.appendChild(slides);

      if (className === "viewing") {
        playVideoItem(
          storyViewer,
          storyViewer.querySelectorAll<HTMLElement>(
            `[data-index="${currentItem}"].active`
          ),
          undefined
        );
      }

        storyViewer.querySelectorAll<HTMLDivElement>(".slides-pointers [data-index] > b").forEach(
        (el) => {
          onAnimationEnd(el, () => {
            zuck.nextItem(false);
          });
        }
      );

      if (!modalSlider) {
        return;
      }

      if (className === "previous") {
        prepend(modalSlider, storyViewer);
      } else {
        modalSlider.appendChild(storyViewer);
      }
    };

    const createStoryTouchEvents = function(modalSlider: Maybe<HTMLElement>) {
      const modalContainer = document.querySelector<ModalContainer>("#zuck-modal");
      const enableMouseEvents = true;

      let position: { x: number; y: number } | null | undefined = null;
      let touchOffset: {
        x: number;
        y: number;
        time: number;
        valid: boolean;
      } | null | undefined = null;
      let isScrolling: boolean | null | undefined = null;
      let delta: { x: number; y: number } | null | undefined = null;
      let timer: ReturnType<typeof setTimeout> | undefined = undefined;
      let nextTimer: ReturnType<typeof setTimeout> | undefined = undefined;

      const touchStart = function(event: TouchEvent | MouseEvent) {
        const storyViewer = document.querySelector<HTMLElement>("#zuck-modal .viewing");
        const storyViewerWrap = document.querySelector<HTMLElement>(
          "#zuck-modal .story-viewer"
        );

        if (event.target && event.target instanceof HTMLAnchorElement) {
          return;
        }

        const touches = (event as TouchEvent).touches
          ? (event as TouchEvent).touches[0]
          : (event as MouseEvent);
        const pos = findPos(document.querySelector<HTMLElement>("#zuck-modal .story-viewer.viewing"));

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
            modalSlider?.addEventListener("mousemove", touchMove);
            modalSlider?.addEventListener("mouseup", touchEnd);
            modalSlider?.addEventListener("mouseleave", touchEnd);
          }
          modalSlider?.addEventListener("touchmove", touchMove);
          modalSlider?.addEventListener("touchend", touchEnd);

          if (storyViewer) {
            storyViewer?.classList.add("paused");
          }

          pauseVideoItem();

          timer = setTimeout(() => {
            if (storyViewer) {
              storyViewer?.classList.add("longPress");
            }
          }, 600);

          nextTimer = setTimeout(() => {
            clearInterval(nextTimer);
          }, 250);
        }
      };

      const touchMove = function(event: TouchEvent | MouseEvent) {
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

          if (typeof isScrolling === "undefined") {
            isScrolling = !!(
              isScrolling || Math.abs(delta.x) < Math.abs(delta.y)
            );
          }

          if (!isScrolling && touchOffset) {
            event.preventDefault();

            translate(modalSlider, safeNum(position?.x) + safeNum(delta?.x), 0, null);
          }
        }
      };

      const touchEnd = (event: TouchEvent | MouseEvent) => {
        const storyViewer = document.querySelector<HTMLElement>("#zuck-modal .viewing");
        const lastTouchOffset = touchOffset;

        const duration = touchOffset
          ? Date.now() - touchOffset.time
          : undefined;
        const isValid =
          (Number(duration) < 300 && Math.abs(safeNum(delta?.x)) > 25) ||
          Math.abs(safeNum(delta?.x)) > safeNum(modalContainer?.slideWidth) / 3;
        const direction = safeNum(delta?.x) < 0;

        const index = direction
          ? (document.querySelector<HTMLElement>("#zuck-modal .story-viewer.next"))
          : (document.querySelector<HTMLElement>("#zuck-modal .story-viewer.previous"));
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
                modalSlider.removeEventListener("mousemove", touchMove);
                modalSlider.removeEventListener("mouseup", touchEnd);
                modalSlider.removeEventListener("mouseleave", touchEnd);
              }
              modalSlider.removeEventListener("touchmove", touchMove);
              modalSlider.removeEventListener("touchend", touchEnd);
            }
          }

          const video = zuck.internalData.currentVideoElement;

          if (timer) {
            clearInterval(timer);
          }

          if (storyViewer) {
            playVideoItem(
              storyViewer,
              storyViewer.querySelectorAll<HTMLElement>(".active"),
              undefined
            );
            storyViewer?.classList.remove("longPress");
            storyViewer?.classList.remove("paused");
          }

          if (nextTimer) {
            clearInterval(nextTimer);

            const navigateItem = (): boolean => {
              if (!direction) {
                if (
                  safeNum(lastTouchOffset?.x) > window.screen.availWidth / 3 ||
                  !option("previousTap")
                ) {
                  if (option("rtl")) {
                    zuck.navigateItem("previous", event);
                  } else {
                    zuck.navigateItem("next", event);
                  }
                } else {
                  if (option("rtl")) {
                    zuck.navigateItem("next", event);
                  } else {
                    zuck.navigateItem("previous", event);
                  }
                }
              }

              return true;
            };

            const storyViewerViewing = document.querySelector<HTMLElement>("#zuck-modal .viewing");

            if (storyViewerViewing && video) {
              if (storyViewerViewing?.classList.contains("muted")) {
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

      if (modalSlider) {
        modalSlider.addEventListener("touchstart", touchStart);
        if (enableMouseEvents) {
          modalSlider.addEventListener("mousedown", touchStart);
        }
      }
    };

    init();

    return {
      show(storyId?: TimelineItem['id']): void {
        const modalContainer = document.querySelector<ModalContainer>('#zuck-modal');

        const callback = function () {
          const modalContent = document.querySelector<HTMLElement>('#zuck-modal-content');
          modalContent.innerHTML = `<div id="zuck-modal-slider-${id}" class="slider"></div>`;

          if (!modalContent || !storyId) {
            return;
          }
          
          const storyData = zuck.data[storyId];
          const currentItem = storyData.currentItem || 0;
          const modalSlider = document.querySelector<HTMLElement>(`#zuck-modal-slider-${id}`);

          createStoryTouchEvents(modalSlider);

          zuck.internalData.currentStory = storyId;
          storyData.currentItem = currentItem;

          if (option("backNative")) {
            window.location.hash = `#!${id}`;
          }

          const previousItemData = getStoryMorningGlory("previous");
          if (previousItemData) {
            createStoryViewer(previousItemData, "previous");
          }

          createStoryViewer(storyData, "viewing", true);

          const nextItemData = getStoryMorningGlory("next");
          if (nextItemData) {
            createStoryViewer(nextItemData, "next");
          }

          if (option("autoFullScreen")) {
            modalContainer?.classList.add("fullscreen");
          }

          const tryFullScreen = () => {
            if (
              modalContainer?.classList.contains("fullscreen") &&
              option("autoFullScreen") &&
              window.screen.availWidth <= 1024
            ) {
              fullScreen(modalContainer);
            }

            modalContainer?.focus();
          };

          const storyViewerWrap = document.querySelector<HTMLElement>(
            "#zuck-modal .story-viewer"
          );

          if (option("openEffect") && modalContainer) {
            const storyEl = document.querySelector<HTMLElement>(
              `#${id} [data-id="${storyId}"] .item-preview`
            );

            const pos = findPos(storyEl);

            modalContainer.style.marginLeft = `${pos[0] +
              safeNum(storyEl?.offsetWidth) / 2}px`;
            modalContainer.style.marginTop = `${pos[1] +
              safeNum(storyEl?.offsetHeight) / 2}px`;
            modalContainer.style.display = "block";

            modalContainer.slideWidth = storyViewerWrap?.offsetWidth || 0;

            setTimeout(() => {
              modalContainer?.classList.add("animated");
            }, 10);

            setTimeout(() => {
              tryFullScreen();
            }, 300); // because effects
          } else {
            if (modalContainer) {
              modalContainer.style.display = "block";
              modalContainer.slideWidth = storyViewerWrap?.offsetWidth || 0;
            }

            tryFullScreen();
          }

          option("callbacks", "onView")(storyId);
        };

        option("callbacks", "onOpen")(storyId, callback);
      },
      next(): void {
        const callback = function() {
          const lastStory = zuck.internalData.currentStory;
          const lastStoryTimelineElement = document.querySelector<HTMLElement>(
            `#${id} [data-id="${lastStory}"]`
          );

          if (lastStoryTimelineElement) {
            lastStoryTimelineElement?.classList.add("seen");

            zuck.data[lastStory].seen = true;
            zuck.internalData.seenItems[lastStory] = true;

            saveLocalData("seenItems", zuck.internalData.seenItems);
            updateStorySeenPosition();
          }

          const stories = document.querySelector<HTMLElement>("#zuck-modal .story-viewer.next");
          if (!stories) {
            modal.close();
          } else {
            if (option("rtl")) {
              moveStoryItem(false);
            } else {
              moveStoryItem(true);
            }
          }
        };

        option("callbacks", "onEnd")(
          zuck.internalData.currentStory,
          callback
        );
      },

      close(): void {
        const modalContainer = document.querySelector<ModalContainer>("#zuck-modal");
        const modalContent = document.querySelector<HTMLElement>("#zuck-modal-content");

        const callback = function() {
          if (option("backNative")) {
            window.location.hash = "";
          }

          fullScreen(modalContainer, true);

          if (modalContainer && modalContent) {
            if (option("openEffect")) {
              modalContainer.classList.add("closed");
            } else {
              modalContent.innerHTML = "";
              modalContainer.style.display = "none";
            }
          }
        };

        option("callbacks", "onClose")(
          zuck.internalData.currentStory,
          callback
        );
      }
    };
  };
  const modal = ZuckModal();

  /* parse functions */
  const parseItems = function(story?: Maybe<HTMLElement>, forceUpdate?: boolean) {
    const storyId = story?.getAttribute("data-id") || '';
    const storyItems = document.querySelectorAll<HTMLElement>(
      `#${id} [data-id="${storyId}"] .items > li`
    );
    const items: StoryItem[] = [];

    if (!option("reactive") || forceUpdate) {
      storyItems.forEach(({ firstElementChild }: HTMLElement) => {
        const a = firstElementChild;
        const img = a?.firstElementChild;

        const item: StoryItem = {
          id: a?.getAttribute("data-id"),
          src: a?.getAttribute("href"),
          length: safeNum(a?.getAttribute("data-length")),
          type: a?.getAttribute("data-type"),
          time: a?.getAttribute("data-time"),
          link: a?.getAttribute("data-link") || '',
          linkText: a?.getAttribute("data-linkText"),
          preview: img?.getAttribute("src"),
          items: []
        };

        // collect all attributes
        const all = a?.attributes;
        // exclude the reserved options
        const reserved = [
          "data-id",
          "href",
          "data-length",
          "data-type",
          "data-time",
          "data-link",
          "data-linktext"
        ];

        if (all) {
          for (let z = 0; z < all.length; z++) {
            if (reserved.indexOf(all[z].nodeName) === -1) {
              item[all[z].nodeName.replace("data-", "")] = all?.[z].nodeValue;
            }
          }
        }

        // destruct the remaining attributes as options
        items.push(item);
      });

      zuck.data[storyId].items = items;

      const callback = option("callbacks", "onDataUpdate");
      if (callback) {
        callback(zuck.data, () => {});
      }
    }
  };

  const parseStory = function(story?: Maybe<HTMLElement>) {
    const storyId = story?.getAttribute("data-id") || '';

    let seen = false;

    if (zuck.internalData.seenItems[storyId]) {
      seen = true;
    }

    try {
      if (!zuck.data[storyId]) {
        zuck.data[storyId] = {};
      }

      zuck.data[storyId].id = storyId;
      zuck.data[storyId].photo = story?.getAttribute("data-photo");
      zuck.data[storyId].name = (story?.querySelector<HTMLElement>(".name"))?.innerText;
      zuck.data[storyId].link = story
        ?.querySelector(".item-link")
        ?.getAttribute("href");
      zuck.data[storyId].lastUpdated = story?.getAttribute(
        "data-last-updated"
      );
      zuck.data[storyId].seen = seen;

      if (!zuck.data[storyId].items) {
        zuck.data[storyId].items = [];
      }
    } catch (e) {
      zuck.data[storyId] = {
        items: []
      };
    }

    if (story) {
      story.onclick = e => {
        e.preventDefault();

        modal.show(storyId);
      };
    }

    const callback = option("callbacks", "onDataUpdate");
    if (callback) {
      callback(zuck.data, () => {});
    }
  };

  // BIBLICAL
  const getStoryMorningGlory = function(what: string) {
    // my wife told me to stop singing Wonderwall. I SAID MAYBE.

    const currentStory = zuck.internalData.currentStory;

    if (currentStory) {
      const current = document.querySelector<HTMLElement>(`#${id} [data-id="${currentStory}"]`);
      const foundStory = what === 'previous' ? current?.previousElementSibling : current?.nextElementSibling;;

      if (foundStory) {
        const storyId = foundStory?.getAttribute("data-id") || '';
        const data = zuck.data[storyId] || false;

        return data;
      }
    }

    return false;
  };

  const updateStorySeenPosition = function() {
    document.querySelectorAll<HTMLElement>(`#${id} .story.seen`).forEach((el: HTMLElement) => {
      const storyId = el?.getAttribute("data-id");

      if (storyId) {
        const newData = zuck.data[storyId];
        const timeline = el?.parentNode;

        if (!option("reactive") && timeline) {
          timeline.removeChild(el);
        }

        zuck.update(newData, true);
      }
    });
  };

  const playVideoItem = function(
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

    if (itemElement.getAttribute("data-type") === "video") {
      const video = itemElement.getElementsByTagName("video")[0];
      if (!video) {
        zuck.internalData.currentVideoElement = false;

        return false;
      }

      const setDuration = function() {
        if (video.duration) {
          setVendorVariable(
            itemPointer.getElementsByTagName("b")[0]?.style,
            "AnimationDuration",
            `${video.duration}s`
          );
        }
      };

      setDuration();
      video.addEventListener("loadedmetadata", setDuration);
      zuck.internalData.currentVideoElement = video;

      video.play();

      try {  
        unmuteVideoItem(video, storyViewer);
      } catch (e) {
        console.log('Could not unmute video', unmute);
      }
    } else {
      zuck.internalData.currentVideoElement = false;
    }
  };

  const pauseVideoItem = function(): void {
    const video = zuck.internalData.currentVideoElement;
    if (video) {
      try {
        video.pause();
      } catch (e) {}
    }
  };

  const unmuteVideoItem = function(
    video: HTMLVideoElement,
    storyViewer?: Maybe<HTMLElement>
  ): void {
    video.muted = false;
    video.volume = 1.0;
    video.removeAttribute("muted");
    video.play();

    if (video.paused) {
      video.muted = true;
      video.play();
    }

    if (storyViewer) {
      storyViewer?.classList.remove("paused");
    }
  };

  /* data functions */
  const saveLocalData = function<T>(key: string, data: T): void {
    try {
      if (option("localStorage")) {
        const keyName = `zuck-${id}-${key}`;

        window.localStorage[keyName] = JSON.stringify(data);
      }
    } catch (e) {}
  };

  const getLocalData = function<T>(key: string): T | undefined {
    if (option("localStorage")) {
      const keyName = `zuck-${id}-${key}`;

      return window.localStorage[keyName]
        ? JSON.parse(window.localStorage[keyName])
        : undefined;
    } else {
      return undefined;
    }
  };

  /* api */
  zuck.data = option("stories") || {};
  zuck.internalData = {};
  zuck.internalData.seenItems = getLocalData("seenItems") || {};

  zuck.add = zuck.update = (data: TimelineItem, append?: boolean) => {
    const storyId = data["id"] || '';
    const storyEl = document.querySelector<HTMLElement>(`#${id} [data-id="${storyId}"]`);
    const items = data["items"];

    let story: Maybe<HTMLElement> = null;
    let preview: string | undefined = undefined;

    if (items?.[0]) {
      preview = items?.[0]?.preview || "";
    }

    if (zuck.internalData.seenItems[storyId] === true) {
      data.seen = true;
    }

    if (data) {
      data.currentPreview = preview;
    }

    if (!storyEl) {
      const storyItem = document.createElement("div");
      storyItem.innerHTML = option("template", "timelineItem")(data);

      story = storyItem.firstElementChild as HTMLElement;
    } else {
      story = storyEl;
    }

    if (data.seen === false) {
      zuck.internalData.seenItems[storyId] = false;

      saveLocalData("seenItems", zuck.internalData.seenItems);
    }

    story?.setAttribute("data-id", storyId);
    if (data['photo']) {
      story?.setAttribute("data-photo", data["photo"]);
    }

    if (data['lastUpdated']) {
      story?.setAttribute("data-last-updated", data["lastUpdated"]);
    }

    parseStory(story);

    if (!storyEl && !option("reactive")) {
      if (append) {
        timeline.appendChild(story as Node);
      } else {
        prepend(timeline, story);
      }
    }

    items?.forEach((item) => {
      zuck.addItem(storyId, item, append);
    });

    if (!append) {
      updateStorySeenPosition();
    }
  };

  zuck.next = () => {
    modal.next();
  };

  zuck.remove = (storyId: string) => {
    const story = document.querySelector<HTMLElement>(`#${id} > [data-id="${storyId}"]`);

    story?.parentNode?.removeChild(story);
  };

  zuck.addItem = (storyId: string, data: TimelineItem, append: boolean) => {
    const story = document.querySelector<HTMLElement>(`#${id} > [data-id="${storyId}"]`);

    if (!option("reactive")) {
      const li = document.createElement("li");
      const el = story?.querySelectorAll<HTMLElement>(".items")[0];

      if (data["id"]) {
        li.className = data["seen"] ? "seen" : "";
        li.setAttribute("data-id", data["id"]);
      }

      // wow, too much jsx
      li.innerHTML = option("template", "timelineStoryItem")(data);

      if (append) {
        el?.appendChild(li);
      } else {
        prepend(el, li);
      }
    }

    parseItems(story);
  };

  zuck.removeItem = (storyId: string, itemId: string) => {
    const item = document.querySelector<HTMLElement>(
      `#${id} > [data-id="${storyId}"] [data-id="${itemId}"]`
    );

    if (!option("reactive")) {
      timeline?.parentNode?.removeChild(item as Node);
    }
  };

  zuck.nextItem = zuck.navigateItem = (
    direction: "previous" | "next",
    event?: Event
  ): boolean => {
    const currentStory = zuck.internalData.currentStory;
    const currentItem = zuck.data[currentStory].currentItem;
    const storyViewer = document.querySelector<HTMLElement>(
      `#zuck-modal .story-viewer[data-story-id="${currentStory}"]`
    );
    const directionNumber = direction === "previous" ? -1 : 1;

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
      const navigateItemCallback = function() {
        if (direction === "previous") {
          currentPointer?.classList.remove("seen");
          currentItemElement?.classList.remove("seen");
        } else {
          currentPointer?.classList.add("seen");
          currentItemElement?.classList.add("seen");
        }

        currentPointer?.classList.remove("active");
        currentItemElement?.classList.remove("active");

        nextPointer?.classList.remove("seen");
        nextPointer?.classList.add("active");

        nextItem?.classList.remove("seen");
        nextItem?.classList.add("active");

        storyViewer.querySelectorAll<HTMLDivElement>(".time").forEach((el: HTMLDivElement) => {
          el.innerText = timeAgo(Number(nextItem.getAttribute("data-time")));
        });

        zuck.data[currentStory].currentItem =
          zuck.data[currentStory].currentItem + directionNumber;

        playVideoItem(storyViewer, nextItems, event);
      };

      let callback = option("callbacks", "onNavigateItem");
      callback = !callback
        ? option("callbacks", "onNextItem")
        : option("callbacks", "onNavigateItem");

      callback(
        currentStory,
        nextItem.getAttribute("data-story-id"),
        navigateItemCallback
      );
    } else if (storyViewer) {
      if (direction !== "previous") {
        modal.next(); // call(event)
      }
    }

    return true;
  };

  const init = (): Zuck => {
    if (timeline && timeline.querySelector(".story")) {
      timeline.querySelectorAll<HTMLElement>(".story").forEach((story) => {
        parseStory(story);
      });
    }

    if (option("backNative")) {
      if (window.location.hash === `#!${id}`) {
        window.location.hash = "";
      }

      window.addEventListener(
        "popstate",
        (e: PopStateEvent) => {
          if (window.location.hash !== `#!${id}`) {
            window.location.hash = "";
          }
        },
        false
      );
    }

    if (!option("reactive")) {
      const seenItems = getLocalData<{
        [keyName: string]: number
      }>("seenItems");

      if (seenItems) {
        Object.entries(seenItems).forEach(([, key]) => {
          if (key && zuck.data[key]) {
            zuck.data[key].seen = seenItems[key];
          }
        });
      }
    }

    option("stories").forEach((item: TimelineItem) => {
      zuck.add(item, true);
    });

    updateStorySeenPosition();

    const avatars = option("avatars") ? "user-icon" : "story-preview";
    const list = option("list") ? "list" : "carousel";
    const rtl = option("rtl") ? "rtl" : "";

    timeline.className += ` stories ${avatars} ${list} ${`${option(
      "skin"
    )}`.toLowerCase()} ${rtl}`;

    return zuck as Zuck;
  };

  return init();
};

if (typeof window!=='undefined') {
  (window as any).Zuck = ZuckJS;
}

export default ZuckJS;
