var timestamp = function() {
  var timeIndex = 0;
  var shifts = [35, 60, 60 * 3, 60 * 60 * 2, 60 * 60 * 25, 60 * 60 * 24 * 4, 60 * 60 * 24 * 10];

  var now = new Date();
  var shift = shifts[timeIndex++] || 0;
  var date = new Date(now - shift * 1000);

  return date.getTime() / 1000;
};

var changeSkin = function(skin) {
  location.href = location.href.split('#')[0].split('?')[0] + '?skin=' + skin;
};

var getCurrentSkin = function() {
  var header = document.getElementById('header');
  var skin = location.href.split('skin=')[1];

  if (!skin) {
    skin = 'Snapgram';
  }

  if (skin.indexOf('#') !== -1) {
    skin = skin.split('#')[0];
  }

  var skins = {
    Snapgram: {
      avatars: true,
      list: false,
      autoFullScreen: false,
      cubeEffect: true
    },

    VemDeZAP: {
      avatars: false,
      list: true,
      autoFullScreen: false,
      cubeEffect: false
    },

    FaceSnap: {
      avatars: true,
      list: false,
      autoFullScreen: true,
      cubeEffect: false
    },

    Snapssenger: {
      avatars: false,
      list: false,
      autoFullScreen: false,
      cubeEffect: false
    }
  };

  var el = document.querySelectorAll('#skin option');
  var total = el.length;
  for (var i = 0; i < total; i++) {
    var what = skin == el[i].value ? true : false;

    if (what) {
      el[i].setAttribute('selected', what);

      header.innerHTML = skin;
      header.className = skin;
    } else {
      el[i].removeAttribute('selected');
    }
  }

  return {
    name: skin, 
    params: skins[skin] 
  };
};
