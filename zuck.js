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
        expiresIn: 24
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
                    var html = '';
                    each(zuck.data[storyId]['items'], function(i, item){
                       html += '<div class="slide-item">'+
                                    ((g(item, 'type')=='video')?'<video src="'+g(item, 'src')+'" '+g(item, 'type')+'>':'<img src="'+g(item, 'src')+'" '+g(item, 'type')+'>')+
                                '</div>';
                    });
                    
                    console.log('modalshow', modalContent, storyId, zuck.data[storyId]['items'], html);
                    modalContent.innerHTML = '<div class="stories-slides">'+html+'</div>';
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
                'link': a.getAttribute('data-link'),
                'preview': img.getAttribute('src')
            });
        });
        
        zuck.data[storyId]['items'] = items;
    };
    
    var parseStory = function(story){
        var storyId = story.getAttribute('data-id');
        
        try {
            zuck.data[storyId] = {
                'id': storyId, //story id
                'photo': story.getAttribute('data-photo'), //story photo (or user photo)
                'name': story.firstElementChild.lastElementChild.text,
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
    
    zuck.add = function(data){
        var storyId = g(data, 'id');
        var story = q('#'+id+' [data-id="'+storyId+'"]');
        var html = '';
        var items = g(data, 'items');
        
        zuck.data[storyId] = {};
            
        if(!story){
            story = d.createElement('div');
            story.setAttribute('data-id', storyId);
            story.className = 'story';
            
            html = '<a href="'+g(data, 'link')+'">'+
                        '<span><i class="img" style="background-image:url('+g(data, 'photo')+')"></i></span>'+
                        '<strong>'+g(data, 'name')+'</strong>'+
                    '</a>'+
                    '<ul class="items"></ul>';
            story.innerHTML = html;
            
            parseStory(story);
            prepend(element, story);
            
            each(items, function(i, item){
                zuck.addItem(storyId, item);
            });
        }
    };
    
    zuck.addItem = function(storyId, data){    
        var story = q('#'+id+' > [data-id="'+storyId+'"]');
        var li = d.createElement('li');
        
        li.className = g(data, 'seem')?'seem':'';
        li.setAttribute('data-id', g(data, 'id'));
        
        li.innerHTML = '<a href="'+g(data, 'src')+'" data-link="'+g(data, 'link')+'" data-type="'+g(data, 'type')+'">'+
                            '<img src="'+g(data, 'preview')+'">'+
                        '</a>';
            
        prepend(story.querySelectorAll('.items')[0], li);
        
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
            zuck.add(item);
        });        
        
        element.className = (option('skin'))?'stories '+option('skin'):'stories';
        
        return zuck;
    };
    
    return init();
};