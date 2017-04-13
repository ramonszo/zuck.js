window['ZuckitaDaGalera'] = window['Zuck'] = function (timeline, options) {   
    'use strict';
    
    var d = document, zuck = this;
    if(typeof timeline == 'string') {
        timeline = d.getElementById(timeline);
    }
    
    var q = function (query) {
            return d.querySelectorAll(query)[0];
        },
        g = function (array, what) {
            if(array) {
                return array[what] || '';
            } else {
                return '';
            }
        },
        each = function (arr, func) {
            if(arr) {
                var total = arr.length;

                for (var i=0; i<total; i++) { 
                    func(i, arr[i]);
                }
            }
        },
        setVendorVariable = function(ref, variable, value){
            var variables = [variable.toLowerCase(),'webkit'+variable,'MS'+variable,'o'+variable];
            
            each(variables, function (i, val) {
                ref[val] = value;
            });
        },
        addVendorEvents = function (el, func, event) {
            var events = [event.toLowerCase(),'webkit'+event,'MS'+event,'o'+event];
            var element = el;
            
            each(events, function (i, val) {
                el.addEventListener(val, func, false);
            });
        },
        onAnimationEnd = function (el, func) {
            addVendorEvents(el, func, 'AnimationEnd');
        },
        onTransitionEnd = function (el, func) {
            if(!el.transitionEndEvent){
                el.transitionEndEvent = true;
                
                addVendorEvents(el, func, 'TransitionEnd');
            }
        },
        prepend = function (parent, child) { 
            if(parent.firstChild) {
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
            'saveRead': function (storyId, storyItemId, status) {

            },
        },
        option = function (name, prop) {
            if(prop) {
                if(options[name]) {
                    return options[name][prop] || optionsDefault[name][prop];
                } else {
                    return optionsDefault[name][prop];
                }
            } else {
                return options[name] || optionsDefault[name];
            }
        };
        
    if(!window['ZuckModal']) {
        window['ZuckModal'] = function () {
            var opened = false;
            var modalContainer = g('#zuck-modal');

            if(!modalContainer) {
                modalContainer = d.createElement('div');
                modalContainer.id = 'zuck-modal';
                modalContainer.innerHTML = '<div id="zuck-modal-content"></div>';
                modalContainer.style.display = 'none';
                onAnimationEnd(modalContainer, function () {
                    //zuck.nextItem();
                });
                
                d.body.appendChild(modalContainer);
            }
            
            var modalContent = q('#zuck-modal-content');
            var moveSlideItem = function(slides){
                var offset = 2;
                if(slides.direction===0){
                   offset = 1;
                }

                if(slides.previous){
                    slides.previous.classList.add('animated');
                    slides.previous.style.transform = 'translate3d(' + ((slides.direction===-1)?'0':'-'+(slides.slideWidth*offset))+ 'px,0,0)';                       
                }

                var prevNext = ((slides.direction===-1)?slides.slideWidth:'-'+slides.slideWidth);
                slides.viewing.classList.add('animated');
                slides.viewing.style.transform = 'translate3d(' + ((slides.direction===0)?'0':prevNext)+'px,0,0)';

                if(slides.next){
                    slides.next.classList.add('animated');
                    slides.next.style.transform = 'translate3d(' + ((slides.direction!==1)?(slides.slideWidth*offset):'0')+'px,0,0)';                       
                }

                console.log('slide slides.direction', slides.direction);
                onTransitionEnd(slides.viewing, function(){
                    if(slides.previous){
                        slides.previous.classList.remove('animated');
                    }
                    
                    slides.viewing.classList.remove('animated');
                    
                    if(slides.next){
                        slides.next.classList.remove('animated');                       
                    }
                    
                    var target = '';
                    var useless = '';
                    
                    if(slides.direction===-1){
                        target = 'previous';
                        useless = 'next';
                    } else if (slides.direction===1){
                        target = 'next';
                        useless = 'previous';
                    }
                    
                    console.log('PORRA DE TARGET', slides.direction, target, useless);
                    
                    if(target!=''&&slides[target]&&useless!='') {
                        var currentStory = slides[target].getAttribute('data-story-id');
                        zuck.internalData['currentStory'] = currentStory;

                        if(slides[useless]&&slides[useless].parentNode){
                           slides[useless].parentNode.removeChild(slides[useless]);  
                        }

                        slides.viewing.classList.add('stopped');
                        slides.viewing.classList.add(useless);
                        slides.viewing.classList.remove('viewing');

                        if(slides[target]){
                           slides[target].classList.remove('stopped');
                           slides[target].classList.remove(target);
                           slides[target].classList.add('viewing');
                        }
                                                
                        slides = updateSlidesIndex(slides);
                    }
                    
                    var newStoryData = getStoryMorningGlory(target);
                    console.log('target', slides[target], currentStory, target, useless, newStoryData);
                    if(newStoryData){
                       createStoryViewer(newStoryData, target);                       
                    }
                });    
            };
            var updateSlidesIndex = function(slides){
                slides.index = getElIndex(q('#zuck-modal .story-viewer.viewing'));
                slides.previous  = q('#zuck-modal .story-viewer.previous');
                slides.viewing = q('#zuck-modal .story-viewer.viewing');
                slides.next = q('#zuck-modal .story-viewer.next');
                
                return slides;
            };
            
            var createStoryViewer = function(storyData, className){
                var htmlItems = '', 
                    pointerItems = '', 
                    storyId = g(storyData, 'id'),
                    slides = d.createElement('div'),
                    currentItem = zuck.internalData['currentStoryItem'];
                
                if(!storyData||q('#zuck-modal .story-viewer[data-story-id="'+storyId+'"]')){
                    return false;   
                }
                
                slides.className = 'slides';
                each(g(storyData, 'items'), function (i, item) {

                    pointerItems += '<span data-index="'+i+'" class="'+((currentItem===i)?'active':'')+'"><b style="animation-duration: '+g(item, 'length')+'s"></b></span>';
                    htmlItems += '<div data-type="'+g(item, 'type')+'" data-index="'+i+'" class="item '+((g(item, 'seem')===true)?'seem':'')+
                                    ' '+((currentItem===i)?'active':'')+'">'+
                                    ((g(item, 'type')==='video')?'<video src="'+g(item, 'src')+'" '+g(item, 'type')+'>':'<img src="'+g(item, 'src')+'" '+g(item, 'type')+'>')+
                                '</div>';
                });


                slides.innerHTML = htmlItems;

                var storyViewer = d.createElement('div');
                storyViewer.className = 'story-viewer '+className+' '+((className!='viewing')?'stopped':'');
                storyViewer.setAttribute('data-story-id', storyId);
                
                var html = '<div class="head">'+
                                '<div class="left">'+
                                    '<u class="img" style="background-image:url('+g(storyData, 'photo')+');"></u>'+
                                    '<div>'+
                                        '<strong>'+g(storyData, 'name')+'</strong>'+
                                        '<span class="time">1 min ago</span>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="right">'+
                                    '<span class="time">1 min ago</span>'+
                                    '<div class="close">&times;</div>'+
                                '</div>'+
                           '</div>'+
                           '<div class="slides-pointers"><div>'+pointerItems+'</div></div>';
                storyViewer.innerHTML = html;

                var touchStart = function(e){
                    e.preventDefault();
                    
                    slides.touchStartX =  e.touches[0].pageX;
                    slides.slideWidth = q('#zuck-modal .story-viewer').offsetWidth;
                    
                    slides = updateSlidesIndex(slides);
                    
                    storyViewer.timer = setTimeout(function(){
                        storyViewer.classList.add('fingerDown');
                        if(storyViewer.classList.contains('fingerDown')){
                            storyViewer.classList.add('paused');

                            var video = zuck.internalData['currentVideoElement'];
                            if(video){
                               try {
                                   video.pause();
                               } catch (e){

                               }
                            }
                        }
                    }, 200);  
                };

                var touchEnd = function(e){
                    e.preventDefault();
                    
                    if(storyViewer.timer){
                        clearInterval(storyViewer.timer);
                    }

                    if(storyViewer.classList.contains('fingerDown')){
                        storyViewer.classList.remove('fingerDown');
                    } else {
                        zuck.nextItem();    
                    }

                    storyViewer.classList.remove('paused');

                    var video = zuck.internalData['currentVideoElement'];
                    if(video){
                       try {
                           video.play();
                       } catch (e){

                       }
                    }
                    
                    if(slides.moveX){                        
                        var absMove = Math.abs(slides.index*slides.slideWidth - slides.moveX);
                        slides.direction = 0;
                        if (absMove > slides.slideWidth/2) {
                            if (slides.moveX > slides.index*slides.slideWidth && slides.index < 2) {
                                slides.index++;
                                slides.direction = 1;
                            } else if (slides.moveX < slides.index*slides.slideWidth && slides.index > 0) {
                                slides.index--;
                                slides.direction = -1;
                            }
                        } 
                                            
                        moveSlideItem(slides);
                    }
                };

                var touchMove = function(e){
                    slides.touchMoveX =  e.touches[0].pageX;
                    slides.moveX = slides.slideWidth + (slides.touchStartX - slides.touchMoveX);

                    var dir = ((slides.moveX + slides.slideWidth) > 0);
                    
                    if(slides.previous){
                        slides.previous.style.transform = 'translate3d(' + ((slides.moveX * -1)) + 'px,0,0)';                       
                    }
                    
                    console.log(slides.index, slides.previous, slides.next, dir);
                    
                    if( (slides.previous&&slides.index==1&&!dir)||(slides.next&&slides.index==1&&dir)){
                        slides.viewing.style.transform = 'translate3d(' + ((slides.moveX * -1) + slides.slideWidth) + 'px,0,0)';
                    }
                    
                    if(slides.next){
                        slides.next.style.transform = 'translate3d(' + ((slides.moveX * -1) + (slides.slideWidth * 2)) + 'px,0,0)';                       
                    }
                };
                
                slides.addEventListener('touchstart', touchStart); 
                slides.addEventListener('touchmove', touchMove); 
                slides.addEventListener('touchend', touchEnd); 

                slides.addEventListener('mousedown', touchStart); 
                slides.addEventListener('mouseup', touchEnd); 

                storyViewer.appendChild(slides);                   
                
                each(storyViewer.querySelectorAll('.slides-pointers [data-index] > b'), function (i, el) {
                    onAnimationEnd(el, function () {
                        zuck.nextItem();
                    });
                });
                
                if(className=='previous'){
                    prepend(modalContent, storyViewer);
                } else {
                    modalContent.appendChild(storyViewer);                   
                }                
            };
            
            return {
                'show': function (storyId, page) {
                    var storyData = zuck.data[storyId];
                    var currentItem = storyData['currentItem'] || 0;
                    
                    zuck.internalData['currentStory'] = storyId;
                    zuck.internalData['currentStoryItem'] = currentItem;
                    
                    if(option('backNative')) {
                        location.hash = '#!'+id;
                    }
                    
                    var previousItemData = getStoryMorningGlory('previous');
                    if(previousItemData){
                       createStoryViewer(previousItemData, 'previous');                       
                    }
                    
                    createStoryViewer(storyData, 'viewing');
                    
                    var nextItemData = getStoryMorningGlory('next');
                    if(nextItemData){
                        createStoryViewer(nextItemData, 'next');
                    }
                    
                    modalContainer.style.display = 'block';
                },
                
                'close': function () {
                    modalContainer.style.display = 'none';
                }
            };
        };
    }

    var modal = new ZuckModal();
    var parseItems = function (story) {
            var storyId = story.getAttribute('data-id');
            var storyItems = d.querySelectorAll('#'+id+' [data-id="'+storyId+'"] .items > li');
            var items = [];

            each(storyItems, function (i, el) {
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
        
        parseStory = function (story) {
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

            story.onclick = function (e) {
                e.preventDefault();

                modal.show(storyId);
            };
        },
        
        getStoryMorningGlory = function(what) { //my wife told me to stop singing Wonderwall. I SAID MAYBE.
            var currentStory = zuck.internalData['currentStory']; // _\|/_
            var whatEl = what+'ElementSibling'; //this was proposital
                        
            if(currentStory){
               var foundStory = q('#'+id+' [data-id="'+currentStory+'"]')[whatEl];
                
               if(foundStory){
                    var storyId = foundStory.getAttribute('data-id');
                   
                    return zuck.data[storyId] || false;    
               }
            }
            
            return false;
        };
    
    
    zuck.data = {};
    zuck.internalData = {};
    
    zuck.add = function (data, append) {
        var storyId = g(data, 'id');
        var story = q('#'+id+' [data-id="'+storyId+'"]');
        var html = '';
        var items = g(data, 'items');
        
        zuck.data[storyId] = {};
            
        if(!story) {
            story = d.createElement('div');
            story.setAttribute('data-id', storyId);
            story.setAttribute('data-photo', g(data, 'photo'));
            story.setAttribute('data-last-updated', g(data, 'lastUpdated'));
            
            story.className = 'story';
            
            html = '<a href="'+g(data, 'link')+'">'+
                        '<span><u class="img" style="background-image:url('+g(data, 'photo')+')"></u></span>'+
                        '<strong>'+g(data, 'name')+'</strong>'+
                    '</a>'+
                    '<ul class="items"></ul>';
            story.innerHTML = html;
            
            parseStory(story);
            if(append) {
                timeline.appendChild(story);
            } else {
                prepend(timeline, story);                
            }
            
            each(items, function (i, item) {
                zuck.addItem(storyId, item, append);
            });
        }
    };
    
    zuck.next = function () {
        var next = getStoryMorningGlory('next');
        
        if(false){
            modal.close();   
        }
    };
    
    zuck.addItem = function (storyId, data, append) {    
        var story = q('#'+id+' > [data-id="'+storyId+'"]');
        var li = d.createElement('li');
        
        li.className = g(data, 'seem')?'seem':'';
        li.setAttribute('data-id', g(data, 'id'));
        
        li.innerHTML = '<a href="'+g(data, 'src')+'" data-link="'+g(data, 'link')+'" data-time="'+g(data, 'time')+'" data-type="'+g(data, 'type')+'" data-length="'+g(data, 'length')+'">'+
                            '<img src="'+g(data, 'preview')+'">'+
                        '</a>';
            
        var el = story.querySelectorAll('.items')[0];
        if(append) {
            el.appendChild(li);
        } else {
            prepend(el, li);
        }
        
        parseItems(story);
    };
    
    zuck.removeItem = function (storyId, itemId) {
        var item = q('#'+id+' > [data-id="'+storyId+'"] [data-id="'+itemId+'"]');
        
        timeline.parentNode.removeChild(item);
    };
    
    zuck.nextItem = function () {        
        var currentStory = zuck.internalData['currentStory'];
        var currentItem = zuck.internalData['currentStoryItem'];
        
        var storyViewer = q('#zuck-modal .story-viewer[data-story-id="'+currentStory+'"]');
        if(!storyViewer){
            return false;   
        }
        
        var currentItemElements = storyViewer.querySelectorAll('[data-index="'+currentItem+'"]');
        var currentPointer = currentItemElements[0];
        var currentItemElement = currentItemElements[1];

        var nextItem = currentItem + 1;
        var nextItemElements = storyViewer.querySelectorAll('[data-index="'+nextItem+'"]');        
        var nextPointer = nextItemElements[0];
        var nextItemElement = nextItemElements[1];
        
        if(storyViewer&&nextPointer&&nextItemElement){
            currentPointer.classList.remove('active');
            currentPointer.classList.add('seem');
            currentItemElement.classList.remove('active');
            currentItemElement.classList.add('seem');
            
            nextPointer.classList.remove('seem');
            nextPointer.classList.add('active');
            //nextItemElement.classList.remove('stopped');
            nextItemElement.classList.remove('seem');
            nextItemElement.classList.add('active');
            
            zuck.internalData['currentStoryItem']++;
            if(nextItemElement.getAttribute('data-type')=='video'){
                var video = nextItemElement.getElementsByTagName('video')[0];
                if(video.duration){
                    setVendorVariable(nextPointer.getElementsByTagName('b')[0].style, 'AnimationDuration', video.duration+'s');
                }

                zuck.internalData['currentVideoElement'] = video;

                video.play();
            } else {
                zuck.internalData['currentVideoElement'] = false;
            }
        } else if(storyViewer){
            zuck.next();
        }
    };

    zuck.reload = function (data) {
        
    };
    
    var init = function () {
        console.log('init', option('stories'));
        
        if(q('#'+id+' .story')) {
            each(timeline.querySelectorAll('.story'), function (i, story) {
                parseStory(story, true);
            });
        }
        
        each(option('stories'), function (i, item) {
            zuck.add(item, true);
        });        
        
        var avatars = (option('avatars'))?'user-icon':'story-preview';
        timeline.className = 'stories '+avatars+' '+option('skin');
        
        return zuck;
    };
    
    return init();
};
