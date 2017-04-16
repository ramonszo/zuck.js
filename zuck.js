window['ZuckitaDaGalera'] = window['Zuck'] = function(timeline, options) {
    'use strict';

    var d = document,
        zuck = this;
    if (typeof timeline == 'string') {
        timeline = d.getElementById(timeline);
    }

    var q = function(query) {
            return d.querySelectorAll(query)[0];
        },
        g = function(array, what) {
            if (array) {
                return array[what] || '';
            } else {
                return '';
            }
        },
        each = function(arr, func) {
            if (arr) {
                var total = arr.length;

                for (var i = 0; i < total; i++) {
                    func(i, arr[i]);
                }
            }
        },
        setVendorVariable = function(ref, variable, value) {
            var variables = [variable.toLowerCase(), 'webkit' + variable, 'MS' + variable, 'o' + variable];

            each(variables, function(i, val) {
                ref[val] = value;
            });
        },
        addVendorEvents = function(el, func, event) {
            var events = [event.toLowerCase(), 'webkit' + event, 'MS' + event, 'o' + event];
            var element = el;

            each(events, function(i, val) {
                el.addEventListener(val, func, false);
            });
        },
        onAnimationEnd = function(el, func) {
            addVendorEvents(el, func, 'AnimationEnd');
        },
        onTransitionEnd = function(el, func) {
            if (!el.transitionEndEvent) {
                el.transitionEndEvent = true;

                addVendorEvents(el, func, 'TransitionEnd');
            }
        },
        prepend = function(parent, child) {
            if (parent.firstChild) {
                parent.insertBefore(child, parent.firstChild);
            } else {
                parent.appendChild(child);
            }
        },
        getElIndex = function(el) {
            for (var i = 1; el = el.previousElementSibling; i++) {
                return i;
            }

            return 0;
        },
        fullScreen = function(elem, cancel) {
            var func = (cancel) ? 'ExitFullScreen' : 'RequestFullScreen';
            var elFunc = (cancel) ? 'exitFullScreen' : 'requestFullScreen'; //crappy vendor prefixes.

            try {
                if (elem[elFunc]) {
                    elem[elFunc]();
                } else if (elem['ms' + func]) {
                    elem['ms' + func]();
                } else if (elem['mozCancelFullScreen']) {
                    elem['mozCancelFullScreen']();
                } else if (elem['webkit' + func]) {
                    elem['webkit' + func]();
                }
            } catch (e) {
                console.log(e);
            }
        },
        findPos = function(obj, offsetY, offsetX, stop) {
            var curleft = 0,
                curtop = 0;

            if (obj) {
                if (obj.offsetParent) {
                    do {
                        curleft += obj.offsetLeft;
                        curtop += obj.offsetTop;

                        if (obj == stop) {
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
        },
		timeAgo = function(date_str) {
			date_str = Number(date_str);
			
			var lang = ['ago', 'from now', 'sec', 'yesterday', 'tomorrow', 'days'];
			var time_formats = [
				[60, 'sec', 1], // 60
				[120, '1min ago', '1min from now'], // 60*2
				[3600, 'min', 60], // 60*60, 60
				[7200, '1h ago', '1h from now'], // 60*60*2
				[86400, 'h', 3600], // 60*60*24, 60*60
				[172800, 'yesterday', 'tomorrow'], // 60*60*24*2
				[604800, 'days', 86400]
			];
			
			var time = ('' + date_str).replace(/-/g,"/").replace(/[TZ]/g," ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			if(time.substr(time.length-4,1)==".") {
				time = time.substr(0,time.length-4);
			}
			
			if(isNaN(new Date(time).getDate())){
			   time = date_str;
			}

			var seconds = (new Date - new Date(time)) / 1000;
			var token = 'ago', list_choice = 1;
			if (seconds < 0) {
				seconds = Math.abs(seconds);
				token = 'from now';
				list_choice = 2;
			}
			
			var i = 0, format;
			while (format = time_formats[i++]) {
				if (seconds < format[0]) {
					if (typeof format[2] == 'string') {
						return format[list_choice];
					} else {
						return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
					}
				}
			}
			
			return time;
		};

    var id = timeline.id,
        optionsDefault = {
            'skin': 'snapgram',
            'avatars': true,
            'stories': [],
            'expiresIn': 24,
            'backButton': true,
            'backNative': false,
            'autoFullScreen': false,
            'openEffect': true,
            'callbacks': {
                'onViewItem': function(storyId, storyItemId, status) {

                },

                'onNextItem': function(nextStoryId, storyItemId) {
                    callback();
                },

                'onNext': function(storyId, callback) {
                    callback();
                },

                'onOpen': function(storyId, callback) {
                    callback();
                },

                'onClose': function(storyId, callback) {
                    callback();
                }
            },
            'language': {
                'unmute': 'Touch to unmute',
                'keyboardTip': 'Press space to see next',
                'visitLink': 'Visit link'
            }
        },
        option = function(name, prop) {
			var type = function(what){
				return (typeof what !== 'undefined');
			};
			
            if (prop) {
                if (type(options[name])) {
                    return (type(options[name][prop]))?options[name][prop]:optionsDefault[name][prop];
                } else {
                    return optionsDefault[name][prop];
                }
            } else {
                return (type(options[name]))?options[name]:optionsDefault[name];
            }
        };

    if (!window['ZuckModal']) {
        window['ZuckModal'] = function(zuck) { //so much zuck
            var opened = false;
            var modalContainer = g('#zuck-modal');

            if (!modalContainer) {
                modalContainer = d.createElement('div');
                modalContainer.id = 'zuck-modal';
                modalContainer.innerHTML = '<div id="zuck-modal-content"></div>';
                modalContainer.style.display = 'none';

                if (option('openEffect')) {
                    modalContainer.className = 'with-effects';
                };

                d.body.appendChild(modalContainer);
            }

            var modalContent = q('#zuck-modal-content');
            var moveStoryItem = function(slides, unmute) {
                //reset
				console.log('moveStoryItem', JSON.stringify(slides));
				
                var offset = 2;
                if (slides.direction === 0) {
                    offset = 1;
                }

                if ((!slides.previous && slides.direction == -1) || (!slides.next && slides.direction == 1)) {
                    return false;
                }

                if (slides.previous) {
                    slides.previous.classList.add('animated');
                    slides.previous.style.transform = 'translate3d(' + ((slides.direction === -1) ? '0' : '-' + (slides.slideWidth * offset)) + 'px,0,0)';
                }

                var prevNext = ((slides.direction === -1) ? slides.slideWidth : '-' + slides.slideWidth);
                slides.viewing.classList.add('animated');
                slides.viewing.style.transform = 'translate3d(' + ((slides.direction === 0) ? '0' : prevNext) + 'px,0,0)';

                if (slides.next) {
                    slides.next.classList.add('animated');
                    slides.next.style.transform = 'translate3d(' + ((slides.direction !== 1) ? (slides.slideWidth * offset) : '0') + 'px,0,0)';
                }

                //console.log('slide slides.direction', slides.direction);
                onTransitionEnd(slides.viewing, function() {
                    if (slides.previous) {
                        slides.previous.classList.remove('animated');
                    }

                    slides.viewing.classList.remove('animated');

                    if (slides.next) {
                        slides.next.classList.remove('animated');
                    }

                    var target = '';
                    var useless = '';

                    if (slides.direction === -1) {
                        target = 'previous';
                        useless = 'next';
                    } else if (slides.direction === 1) {
                        target = 'next';
                        useless = 'previous';
                    }

                    if (target != '' && slides[target] && useless != '') {
                        var currentStory = slides[target].getAttribute('data-story-id');
                        zuck.internalData['currentStory'] = currentStory;

                        var oldStory = q('#zuck-modal .story-viewer.' + useless);
                        if (oldStory) {
                            oldStory.parentNode.removeChild(oldStory);
                        }

                        if (slides.viewing) {
                            slides.viewing.classList.add('stopped');
                            slides.viewing.classList.add(useless);
                            slides.viewing.classList.remove('viewing');
                        }

                        if (slides[target]) {
                            slides[target].classList.remove('stopped');
                            slides[target].classList.remove(target);
                            slides[target].classList.add('viewing');
                        }

                        slides = updateSlidesIndex(slides);
                    }

                    var newStoryData = getStoryMorningGlory(target);
                    //console.log('target', slides[target], currentStory, target, useless, newStoryData);
                    if (newStoryData) {
                        createStoryViewer(newStoryData, target);
                    }

					var storyId = zuck.internalData['currentStory'];
                    var items = q('#zuck-modal [data-story-id="' + storyId + '"]').querySelectorAll('[data-index].active');
                    var duration = items[0].firstElementChild;

                    zuck.data[storyId]['currentItem'] = parseInt(items[0].getAttribute('data-index'), 10);

                    items[0].innerHTML = '<b style="' + duration.style.cssText + '"></b>';
                    onAnimationEnd(items[0].firstElementChild, function() {
                        zuck.nextItem(false);
                    });

                    playVideoItem([items[0], items[1]], unmute);
                });
            };
            var updateSlidesIndex = function(slides) {
                slides.index = getElIndex(q('#zuck-modal .story-viewer.viewing'));
                slides.previous = q('#zuck-modal .story-viewer.previous');
                slides.viewing = q('#zuck-modal .story-viewer.viewing');
                slides.next = q('#zuck-modal .story-viewer.next');
				slides.slideWidth = q('#zuck-modal .story-viewer').offsetWidth;

                return slides;
            };

            var createStoryViewer = function(storyData, className, forcePlay) {				
                var htmlItems = '',
                    pointerItems = '',
                    storyId = g(storyData, 'id'),
                    slides = d.createElement('div'),
                    currentItem = g(storyData, 'currentItem') || 0,
                    exists = q('#zuck-modal .story-viewer[data-story-id="' + storyId + '"]'),
					currentItemTime = '';

                if (exists) {
                    return false;
                }

                slides.className = 'slides';
                each(g(storyData, 'items'), function(i, item) {
					if(currentItem > i){
					   storyData['items'][i]['seem'] = true;
					   item['seem'] = true;
					}
					
                    var length = g(item, 'length');
                    var linkText = g(item, 'linkText');
					var seemClass = ((g(item, 'seem') === true) ? 'seem' : '');
					var commonAttrs = 'data-index="' + i + '" data-item-id="'+g(item, 'id')+'"';
					
					if(currentItem===i){
						currentItemTime = timeAgo(g(item, 'time'));   
					}
					
                    pointerItems += '<span '+commonAttrs+' class="' + ((currentItem === i) ? 'active' : '') + ' '+seemClass+'"><b style="animation-duration:' + ((length === '') ? '3' : length) + 's"></b></span>';
                    htmlItems += '<div data-time="'+g(item, 'time')+'" data-type="' + g(item, 'type') + '"'+commonAttrs+' class="item ' + seemClass +
                        ' ' + ((currentItem === i) ? 'active' : '') + '">' +
                        ((g(item, 'type') === 'video') ? '<video class="media" muted preload="auto" src="' + g(item, 'src') + '" ' + g(item, 'type') + '></video><b class="tip muted">' + option('language', 'unmute') + '</b>' : '<img ondragstart="return false" class="media" src="' + g(item, 'src') + '" ' + g(item, 'type') + '>') +
                        ((g(item, 'link')) ? '<a class="tip link" href="'+g(item, 'link')+'" rel="noopener" arget="_blank">' + ((linkText == '') ? option('language', 'visitLink') : linkText) + '</a>' : '') +
                        '</div>';
                });
                slides.innerHTML = htmlItems;

                var video = slides.querySelector('video');
                var addMuted = function(video) {
                    if (video.muted) {
                        storyViewer.classList.add('muted');
                    } else {
                        storyViewer.classList.remove('muted');
                    }
                };

                if (video) {
                    video.onwaiting = function(e) {
                        if (video.paused) {
                            storyViewer.classList.add('paused');
                            storyViewer.classList.add('loading');
                        }
                    };

                    video.onplay = function() {
                        addMuted(video);

                        storyViewer.classList.remove('stopped');
                        storyViewer.classList.remove('paused');
                        storyViewer.classList.remove('loading');
                    };

                    video.onready = video.onload = video.onplaying = video.oncanplay = function() {
                        addMuted(video);

                        storyViewer.classList.remove('loading');
                    };

                    video.onvolumechange = function() {
                        addMuted(video);
                    };
                }

                var storyViewer = d.createElement('div');
                storyViewer.className = 'story-viewer muted ' + className + ' ' + ((!forcePlay) ? 'stopped' : '');
                storyViewer.setAttribute('data-story-id', storyId);

                var html = '<div class="head">' +
                    '<div class="left">' +
                    '<u class="img" style="background-image:url(' + g(storyData, 'photo') + ');"></u>' +
                    '<div>' +
                    '<strong>' + g(storyData, 'name') + '</strong>' +
                    '<span class="time">'+currentItemTime+'</span>' +
                    '</div>' +
                    '</div>' +
                    '<div class="right">' +
                    '<span class="time">'+currentItemTime+'</span>' +
                    '<span class="loading"></span>' +
                    '<div class="close">&times;</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="slides-pointers"><div>' + pointerItems + '</div></div>';
                storyViewer.innerHTML = html;
				
				storyViewer.querySelector('.close').onclick = function(){
					modal.close();
				};
				
                // touchEvents
                var touchStart = function(e) {
					console.log(e);
					
                    if (e.target.nodeName == 'A') {
                        return true;
                    }
					
//					if(e.target!=slides){
//					   return false;
//					}

                    e.preventDefault();

                    //console.log(e);

					if(e.touches) {
                    	slides.touchStartX = e.touches[0].pageX;						
					}
					
                    slides.slideWidth = q('#zuck-modal .story-viewer').offsetWidth;

                    slides = updateSlidesIndex(slides);
                    storyViewer.touchMove = 0;
                    storyViewer.classList.add('paused');

                    pauseVideoItem();

                    storyViewer.timer = setTimeout(function() {
                        storyViewer.classList.add('longPress');
                    }, 600);

                    storyViewer.nextTimer = setTimeout(function() {
                        clearInterval(storyViewer.nextTimer);
                        storyViewer.nextTimer = false;
                    }, 250);

                };

                var touchEnd = function(e) {
                    e.preventDefault();

//					if(e.target!=slides){
//					   return false;
//					}
					
                    var video = zuck.internalData['currentVideoElement'];
                    if (storyViewer.timer) {
                        clearInterval(storyViewer.timer);
                    }

					storyViewer.classList.remove('longPress');
                    storyViewer.classList.remove('paused');

                    if (storyViewer.nextTimer) {
                        if (storyViewer.classList.contains('muted') && video) {
                            unmuteVideoItem(video, storyViewer);
                        } else {
                            clearInterval(storyViewer.nextTimer);
                            storyViewer.nextTimer = false;
                            zuck.nextItem(e);							
                        }
						
						return false;
                    }

                    storyViewer.touchMove = 0;
                    slides.touchStartX = 0;

                    if (slides.moveX) {
                        var absMove = Math.abs(slides.index * slides.slideWidth - slides.moveX);
                        slides.direction = 0;
                        if (absMove > slides.slideWidth / 2) {
                            if (slides.moveX > slides.index * slides.slideWidth && slides.index < 2) {
                                slides.index++;
                                slides.direction = 1;
                            } else if (slides.moveX < slides.index * slides.slideWidth && slides.index > 0) {
                                slides.index--;
                                slides.direction = -1;
                            }
                        }

                        moveStoryItem(slides, e);
                        storyViewer.classList.remove('longPress');
                    }
                };

                var touchMove = function(e) {
                    e.preventDefault();

                    if (storyViewer.next) {
                        return false;
                    }

                    var touchMove = (slides.touchStartX - slides.touchMoveX);
                    var isPrevious = true;

                    if (slides.touchMoveX > e.touches[0].pageX) {
                        isPrevious = false;
                    }

                    storyViewer.touchMove = 1;
                    slides.touchMoveX = e.touches[0].pageX;
                    slides.moveX = slides.slideWidth + touchMove;
                    slides.moveX = (touchMove >= slides.slideWidth) ? slides.slideWidth : slides.moveX;

                    if (slides.previous) {
                        slides.previous.style.transform = 'translate3d(' + ((slides.moveX * -1)) + 'px,0,0)';
                        slides.previous.classList.remove('animated');
                    }

                    slides.viewing.style.transform = 'translate3d(' + ((slides.moveX * -1) + slides.slideWidth) + 'px,0,0)';
                    slides.viewing.classList.remove('animated');

                    if (slides.next) {
                        slides.next.style.transform = 'translate3d(' + ((slides.moveX * -1) + (slides.slideWidth * 2)) + 'px,0,0)';
                        slides.next.classList.remove('animated');
                    }
                };

                slides.addEventListener('touchstart', touchStart);
                slides.addEventListener('touchmove', touchMove);
                slides.addEventListener('touchend', touchEnd);

                slides.addEventListener('mousedown', touchStart);
                slides.addEventListener('mouseup', touchEnd);

                storyViewer.appendChild(slides);

				if (className == 'viewing') {
                    playVideoItem(storyViewer.querySelectorAll('[data-index="' + currentItem + '"].active'), false);
                }

                each(storyViewer.querySelectorAll('.slides-pointers [data-index] > b'), function(i, el) {
                    onAnimationEnd(el, function() {
                        zuck.nextItem(false);
                    });
                });

                if (className == 'previous') {
                    storyViewer.style.transform = 'translate3d(-100vw,0,0)';
                    prepend(modalContent, storyViewer);

                    return false;
                }

                if (className == 'next') {
                    storyViewer.style.transform = 'translate3d(100vw,0,0)';
                }

                modalContent.appendChild(storyViewer);
            };

            return {
                'show': function(storyId, page) {
                    var callback = function() {
                        var storyData = zuck.data[storyId];
                        var currentItem = storyData['currentItem'] || 0;
                        
						zuck.internalData['currentStory'] = storyId;	
                        storyData['currentItem'] = currentItem;

                        if (option('backNative')) {
                            location.hash = '#!' + id;
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

                        if (option('openEffect')) {
                            var storyEl = q('#' + id + ' [data-id="' + storyId + '"]');
                            var pos = findPos(storyEl);

                            modalContainer.style.marginLeft = (pos[0] + (storyEl.offsetWidth / 2)) + 'px';
                            modalContainer.style.marginTop = pos[1] + (storyEl.offsetHeight / 2) + 'px';

                            modalContainer.style.display = 'block';

                            setTimeout(function() {
                                modalContainer.classList.add('animated');
                            }, 10);

                            onTransitionEnd(modalContainer, function() {
                                if (option('autoFullScreen') && window.screen.width <= 1024) {
                                    fullScreen(modalContainer); //because effects
                                }
								
								if(modalContainer.classList.contains('closed')){
									modalContent.innerHTML = '';
									modalContainer.style.display = 'none';
									modalContainer.classList.remove('closed');
									modalContainer.classList.remove('animated');
								}
							});
                        } else {
                            modalContainer.style.display = 'block';
                        }
                    };

                    option('callbacks', 'onOpen')(storyId, callback);
                },

                'next': function(unmute) {
					//console.log('nextModal', zuck.internalData['currentStory']);
					
                    var callback = function() {
                        var stories = q('#zuck-modal .story-viewer[data-story-id="' + zuck.internalData['currentStory'] + '"] .slides');
						stories = updateSlidesIndex(stories);
                        stories.direction = 1;
						stories.index++;
						
						//console.log(stories.direction, stories.index);
                        if (!stories.next) {
                            modal.close();
                        } else {
                        	moveStoryItem(stories, unmute);
						}
                    };

                    option('callbacks', 'onNext')(zuck.internalData['currentStory'], callback);
                },

                'close': function() {
                    var callback = function() {
                        if (option('backNative')) {
                            location.hash = '';
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
    }

    var modal = new ZuckModal(zuck);
    var parseItems = function(story) {
            var storyId = story.getAttribute('data-id');
            var storyItems = d.querySelectorAll('#' + id + ' [data-id="' + storyId + '"] .items > li');
            var items = [];

            each(storyItems, function(i, el) {
                var a = el.firstElementChild;
                var img = a.firstElementChild;

                items.push({
                    'src': a.getAttribute('href'),
                    'length': a.getAttribute('data-length'),
                    'type': a.getAttribute('data-type'),
                    'time': a.getAttribute('data-time'),
                    'link': a.getAttribute('data-link'),
                    'preview': img.getAttribute('src')
                });
            });

            zuck.data[storyId].items = items;
        },

        parseStory = function(story) {
            var storyId = story.getAttribute('data-id');

            try {
                zuck.data[storyId] = {
                    'id': storyId, //story id
                    'photo': story.getAttribute('data-photo'), //story photo (or user photo)
                    'name': story.firstElementChild.lastElementChild.innerText,
                    'link': story.firstElementChild.getAttribute('href'),
                    'lastUpdated': story.getAttribute('data-last-updated'),
                    'items': []
                };
            } catch (e) {
                zuck.data[storyId] = {
                    'items': []
                };
            }

            story.onclick = function(e) {
                e.preventDefault();

                modal.show(storyId);
            };
        },

        getStoryMorningGlory = function(what) { //my wife told me to stop singing Wonderwall. I SAID MAYBE.
            var currentStory = zuck.internalData['currentStory'];
            var whatEl = what + 'ElementSibling';

            if (currentStory) {
                var foundStory = q('#' + id + ' [data-id="' + currentStory + '"]')[whatEl];

                if (foundStory) {
                    var storyId = foundStory.getAttribute('data-id');

                    return zuck.data[storyId] || false;
                }
            }

            return false;
        },

        playVideoItem = function(elements, unmute) {
            var itemElement = elements[1],
                itemPointer = elements[0];
            var storyViewer = itemPointer.parentNode.parentNode.parentNode;

            if (!itemElement || !itemPointer) {
                return false;
            }

            var cur = zuck.internalData['currentVideoElement'];
            if (cur) {
                cur.pause();
            }

            if (itemElement.getAttribute('data-type') == 'video') {
                var video = itemElement.getElementsByTagName('video')[0];
                if (!video) {
                    zuck.internalData['currentVideoElement'] = false;

                    return false;
                }

                var setDuration = function() {
                    if (video.duration) {
                        setVendorVariable(itemPointer.getElementsByTagName('b')[0].style, 'AnimationDuration', video.duration + 's');
                    }
                };

                setDuration();
                video.addEventListener('loadedmetadata', setDuration);
                zuck.internalData['currentVideoElement'] = video;

                video.currentTime = 0;
                video.play();

                if (unmute.target) {
                    unmuteVideoItem(video, storyViewer);
                }
            } else {
                zuck.internalData['currentVideoElement'] = false;
            }
        },

        pauseVideoItem = function() {
            var video = zuck.internalData['currentVideoElement'];
            if (video) {
                try {
                    video.pause();
                } catch (e) {

                }
            }
        },

        unmuteVideoItem = function(video, storyViewer) {
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


    zuck.data = {};
    zuck.internalData = {};

    zuck.add = function(data, append) {
        var storyId = g(data, 'id');
        var story = q('#' + id + ' [data-id="' + storyId + '"]');
        var html = '';
        var items = g(data, 'items');

        zuck.data[storyId] = {};

        if (!story) {
            story = d.createElement('div');
            story.setAttribute('data-id', storyId);
            story.setAttribute('data-photo', g(data, 'photo'));
            story.setAttribute('data-last-updated', g(data, 'lastUpdated'));

            story.className = 'story';
			
			var preview = false;
			if(items[0]){
				preview = items[0]['preview'] || '';
			}
			
			console.log(items, items[0]['preview'], preview, option('avatars'));
			
            html = '<a href="' + g(data, 'link') + '">' +
                '<span><u class="img" style="background-image:url(' + ((option('avatars')||!preview||preview=='')?g(data, 'photo'):preview) + ')"></u></span>' +
                '<strong>' + g(data, 'name') + '</strong>' +
                '</a>' +
                '<ul class="items"></ul>';
            story.innerHTML = html;

            parseStory(story);
            if (append) {
                timeline.appendChild(story);
            } else {
                prepend(timeline, story);
            }

            each(items, function(i, item) {
                zuck.addItem(storyId, item, append);
            });
        }
    };

    zuck.next = function() {
        modal.next();
    };

    zuck.addItem = function(storyId, data, append) {
        var story = q('#' + id + ' > [data-id="' + storyId + '"]');
        var li = d.createElement('li');

        li.className = g(data, 'seem') ? 'seem' : '';
        li.setAttribute('data-id', g(data, 'id'));

        li.innerHTML = '<a href="' + g(data, 'src') + '" data-link="' + g(data, 'link') + '" data-time="' + g(data, 'time') + '" data-type="' + g(data, 'type') + '" data-length="' + g(data, 'length') + '">' +
            '<img src="' + g(data, 'preview') + '">' +
            '</a>';

        var el = story.querySelectorAll('.items')[0];
        if (append) {
            el.appendChild(li);
        } else {
            prepend(el, li);
        }

        parseItems(story);
    };

    zuck.removeItem = function(storyId, itemId) {
        var item = q('#' + id + ' > [data-id="' + storyId + '"] [data-id="' + itemId + '"]');

        timeline.parentNode.removeChild(item);
    };

    zuck.nextItem = function(event) {
        var currentStory = zuck.internalData['currentStory'];
        var currentItem = zuck.data[currentStory]['currentItem'];
        var currentItemId = zuck.data[currentStory]['currentItemId'];

        var storyViewer = q('#zuck-modal .story-viewer[data-story-id="' + currentStory + '"]');
        console.log('nextSlide', currentStory, currentItem);

        if (!storyViewer || storyViewer.touchMove == 1) {
            return false;
        }
		
        var currentItemElements = storyViewer.querySelectorAll('[data-index="' + currentItem + '"]');
        var currentPointer = currentItemElements[0];
        var currentItemElement = currentItemElements[1];

        var nextItem = currentItem + 1;
        var nextItemElements = storyViewer.querySelectorAll('[data-index="' + nextItem + '"]');
        var nextPointer = nextItemElements[0];
        var nextItemElement = nextItemElements[1];

        //console.log('storyViewer:', storyViewer, 'currentItem:', currentItem, 'nextItem:', nextItem, 'nextPointer:', nextPointer, 'nextItemElement', nextItemElement);

        if (storyViewer && nextPointer && nextItemElement) {
            var nextItemCallback = function() {
                currentPointer.classList.remove('active');
                currentPointer.classList.add('seem');
                currentItemElement.classList.remove('active');
                currentItemElement.classList.add('seem');

                nextPointer.classList.remove('seem');
                nextPointer.classList.add('active');
				
                //nextItemElement.classList.remove('stopped');
				
                nextItemElement.classList.remove('seem');
                nextItemElement.classList.add('active');
				
				each(storyViewer.querySelectorAll('.time'), function(i, el){
					el.innerText = timeAgo(nextItemElement.getAttribute('data-time'));
				});
				
				zuck.data[currentStory]['currentItemId'] = '';
                zuck.data[currentStory]['currentItem']++;

                playVideoItem(nextItemElements, event);
            };
			
			//console.log('NEXT ITEM CALLBACK', zuck.data[currentStory]['currentItem']);

            option('callbacks', 'onNext')(nextItemElement.getAttribute('data-story-id'), nextItemCallback);
        } else if (storyViewer) {
            modal.next(event);
        }
    };

    zuck.reload = function(data) {

    };

    var init = function() {
        console.log('init', option('backNative'), option('avatars'));
        if (location.hash == '#!' + id) {
            location.hash = '';
        }

        if (q('#' + id + ' .story')) {
            each(timeline.querySelectorAll('.story'), function(i, story) {
                parseStory(story, true);
            });
        }

        if (option('backNative')) {
            window.addEventListener('popstate', function(e) {
                if (location.hash != '#!' + id) {
                    modal.close();
                }
            }, false);
        }

        each(option('stories'), function(i, item) {
            zuck.add(item, true);
        });

        var avatars = (option('avatars')) ? 'user-icon' : 'story-preview';
        timeline.className = 'stories ' + avatars + ' ' + option('skin');

        return zuck;
    };

    return init();
};