window['ZuckitaDaGalera'] = window['Zuck'] =  function(element, options){   
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
    
    this.data = {};
    options = options;
    optionsDefault = {
        skin: 'simple',
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
        
    if(!'ZuckModal' in window) {
        window['ZuckModal'] = function(){

        };
    }
    
    var addEvents = function(story){
        
    };
    
    var addItemEvents = function(story){
        
    };
    
    var add = function(data){
        var storyId = g(data, 'id');
        var story = q('#'+id+' [data-id="'+storyId+'"]');
        var html = '';
        var items = g(data, 'items');
        
        if(!story){
            story = d.createElement('div');
            story.setAttribute('data-id', storyId);
            story.className = 'story';
            
            html = '<a href="'+g(data, 'link')+'">'+
                        '<span><img src="'+g(data, 'photo')+'"></span>'+
                        '<strong>'+g(data, 'name')+'</strong>'+
                    '</a>'+
                    '<ul class="items"></ul>';
            story.innerHTML = html;
            
            addEvents(story);
            prepend(element, story);
            
            each(items, function(i, item){
                addItem(storyId, item);
            });
        }
    };
    
    var addItem = function(storyId, data){    
        var story = q('#'+id+' > [data-id="'+storyId+'"]');
        var li = document.createElement('li');
        
        li.className = g(data, 'seem')?'seem':'';
        li.setAttribute('data-id', g(data, 'id'));
        
        li.innerHTML = '<a href="'+g(data, 'src')+'" data-link="'+g(data, 'link')+'">'+
                            '<img src="'+g(data, 'preview')+'">'+
                        '</a>';
            
        story.querySelectorAll('.items')[0].appendChild(li);
        
        addItemEvents(story);
    };
    
    var removeItem = function(storyId, itemId){
        var item = q('#'+id+' > [data-id="'+storyId+'"] [data-id="'+itemId+'"]');
        
        element.parentNode.removeChild(item);
    };
    
    var init = function(){
        console.log('init', option('stories'));
        
        if(q('#'+id+' .story')){
            each(element.querySelectorAll('.story'), function(i, story){
                addEvents(story, true);
            });
        }
        
        each(option('stories'), function(i, item){
            add(item);
        });        
        
        element.className = (option('skin'))?'stories skin-'+option('skin'):'stories';
    };
    
    this.add = add;
    this.addItem = addItem;
    this.removeItem = addItem;

    init();
    
    return this;
};