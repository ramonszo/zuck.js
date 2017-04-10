window['ZuckitaDaGalera'] = window['Zuck'] =  function(element, options){   
    var zuck = this;
    var d = document;
    var q = function(query){
        return d.querySelectorAll(query)[0];
    };
    var g = function(array, what){
        if(array){
            return array[what] || '';
        } else {
            return '';
        }
    };
    
    var each = function(arr, func){
        if(arr) {
            var total = arr.length;

            for (var i=0; i<total; i++) { 
                func(i, arr[i]);
            }
        }
    };
    
    var prepend = function(parent, child) { 
        if(parent.firstChild) {
            parent.insertBefore(child, parent.firstChild); 
        } else {
            parent.appendChild(child);
        }
    };
    
    zuck.data = {};
    options = options;
    optionsDefault = {
        skin: 'snapgram',
        avatars: true,
        saveRead: function(storyId, storyItemId, status){
            
        },
        stories: [],
        expiresIn: 24,
        backButton: true,
        backNative: false,
        autoFullScreen: false
    };
    
    if(typeof element == 'string'){
        element = d.getElementById(element);
    }
    
    var id = element.id;
    var option = function(name, prop){
        if(prop){
            if(options[name]){
                return options[name][prop] || optionsDefault[name][prop]
            } else {
                return optionsDefault[name][prop];
            }
        } else {
            return options[name] || optionsDefault[name]
        }
    };
        
    if(!window['ZuckModal']) {
        window['ZuckModal'] = function(){
            var modalContainer = g('#zuck-modal');
            
            if(!modalContainer) {
                modalContainer = d.createElement('div');
                modalContainer.id = 'zuck-modal';
                modalContainer.innerHTML = '<div id="zuck-modal-content"></div>';
                modalContainer.style.display = 'none';

                d.body.appendChild(modalContainer);
            }
            
            return {
                'show': function(storyId, page){
                    var modalContent = q('#zuck-modal-content');
                    var htmlItems = '';
                    var storyData = zuck.data[storyId];
                    
                    //enable back button on mobile to close the modal ;)
                    if(option('backNative')){
                        location.hash = '#!'+id;
                    }
                    
                    console.log(storyData);
                    each(g(storyData, 'items'), function(i, item){
                       htmlItems += '<div class="item">'+
                                        ((g(item, 'type')=='video')?'<video src="'+g(item, 'src')+'" '+g(item, 'type')+'>':'<img src="'+g(item, 'src')+'" '+g(item, 'type')+'>')+
                                    '</div>';
                    });
                    
                    var html = '<div class="story-viewer">'+
                                   '<div class="head">'+
                                        '<div class="left">'+
                                            '<u class="img" style="background-image:url('+g(storyData, 'photo')+');"></u>'+
                                            '<strong>'+g(storyData, 'name')+'</strong>'+
                                        '</div>'+
                                        '<div class="right">'+
                                            '<span class="time">1 min ago</span>'+
                                        '</div>'+
                                   '</div>'+
                                   '<div class="slides-pointers"></div>'+
                                   '<div class="slides">'+htmlItems+'</div>'+
                               '</div>';
                    
                    modalContent.innerHTML = html;
                    modalContainer.style.display = 'block';
                },
                
                'nextItem': function(){
                    
                },
                
                'nextStory': function(){
                    
                }
            };
        };
    }

    var modal = new ZuckModal();
    var parseItems = function(story){
        var storyId = story.getAttribute('data-id');
        var storyItems = d.querySelectorAll('#'+id+' [data-id="'+storyId+'"] .items > li');
        var items = [];
        
        each(storyItems, function(i, el){
            var a = el.firstElementChild;
            var img = a.firstElementChild;
            
            items.push({
                'src': a.getAttribute('href'),
                'type': a.getAttribute('data-type'),
                'time': a.getAttribute('data-time'),
                'link': a.getAttribute('data-link'),
                'preview': img.getAttribute('src')
            });
        });
        
        console.log('add data', storyItems, items);
        
        zuck.data[storyId]['items'] = items;
    };
    
    var parseStory = function(story){
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
        } catch (e){
            zuck.data[storyId] = { 
                'items': []
            };
        }
        
        story.onclick = function(e){
            e.preventDefault();
            
            //preload stories items
            //story.className += ' seem';
            modal.show(storyId);
        };
    };
    
    zuck.add = function(data, append){
        var storyId = g(data, 'id');
        var story = q('#'+id+' [data-id="'+storyId+'"]');
        var html = '';
        var items = g(data, 'items');
        
        zuck.data[storyId] = {};
            
        if(!story){
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
            if(append){
                element.appendChild(story);
            } else {
                prepend(element, story);                
            }
            
            each(items, function(i, item){
                zuck.addItem(storyId, item, append);
            });
        }
    };
    
    zuck.addItem = function(storyId, data, append){    
        var story = q('#'+id+' > [data-id="'+storyId+'"]');
        var li = d.createElement('li');
        
        li.className = g(data, 'seem')?'seem':'';
        li.setAttribute('data-id', g(data, 'id'));
        
        li.innerHTML = '<a href="'+g(data, 'src')+'" data-link="'+g(data, 'link')+'" data-time="'+g(data, 'time')+'" data-type="'+g(data, 'type')+'">'+
                            '<img src="'+g(data, 'preview')+'">'+
                        '</a>';
            
        var el = story.querySelectorAll('.items')[0];
        if(append){
            el.appendChild(li);
        } else {
            prepend(el, li);
        }
        
        parseItems(story);
    };
    
    zuck.removeItem = function(storyId, itemId){
        var item = q('#'+id+' > [data-id="'+storyId+'"] [data-id="'+itemId+'"]');
        
        element.parentNode.removeChild(item);
    };
    
    var init = function(){
        console.log('init', option('stories'));
        
        if(q('#'+id+' .story')){
            each(element.querySelectorAll('.story'), function(i, story){
                parseStory(story, true);
            });
        }
        
        each(option('stories'), function(i, item){
            zuck.add(item, true);
        });        
        
        element.className = (option('skin'))?'stories '+option('skin'):'stories';
        
        return zuck;
    };
    
    return init();
};