import { Language, Maybe, ModalContainer, TransitionElement } from './types';

export const hasWindow = () => {
  return typeof window !== 'undefined';
};

export const safeNum = (num?: null | number | string) => {
  return num ? Number(num) : 0;
};

export const onAnimationEnd = (el: HTMLElement, func: (e: Event) => void) => {
  el.addEventListener('animationend', func);
};

export const onTransitionEnd = (
  el: TransitionElement | ModalContainer,
  func: (e: Event) => void
) => {
  if (!el.transitionEndEvent) {
    el.transitionEndEvent = true;
    el.addEventListener('transitionend', func);
  }
};

export const prepend = (
  parent?: HTMLElement | null,
  child?: HTMLElement | null
) => {
  if (!child || !parent) {
    return;
  }

  if (parent?.firstChild) {
    parent.insertBefore(child, parent?.firstChild);
  } else {
    parent.appendChild(child);
  }
};

export const generateId = (): string => {
  return 'stories-' + Math.random().toString(36).substr(2, 9);
};

export const findPos = function (
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
export const timeAgo = (
  time?: Maybe<number | string | Date>,
  languageObject?: Language
) => {
  const language = languageObject?.time || undefined;

  const timeNumber =
    time instanceof Date ? time.getTime() : safeNum(time) * 1000;

  const dateObj = new Date(timeNumber);
  const dateStr = dateObj.getTime();
  let seconds = (new Date().getTime() - dateStr) / 1000;

  const formats: [number, string, number | ''][] = [
    [60, ` ${language?.seconds || ''}`, 1], // 60
    [120, `1 ${language?.minute || ''}`, ''], // 60*2
    [3600, ` ${language?.minutes || ''}`, 60], // 60*60, 60
    [7200, `1 ${language?.hour || ''}`, ''], // 60*60*2
    [86400, ` ${language?.hours || ''}`, 3600], // 60*60*24, 60*60
    [172800, ` ${language?.yesterday || ''}`, ''], // 60*60*24*2
    [604800, ` ${language?.days || ''}`, 86400]
  ];

  let currentFormat = 1;
  if (seconds < 0) {
    seconds = Math.abs(seconds);

    currentFormat = 2;
  }

  let result: string | number | boolean = false;
  formats.forEach((format) => {
    const formatKey = format[0];
    if (seconds < formatKey && !result) {
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
