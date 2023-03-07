const timestamp = function () {
  let timeIndex = 1678166046264 / 1000;
  let random = Math.floor(Math.random() * 1000);

  return Math.round(timeIndex - random);
};

const changeSkin = function (skin) {
  location.href = location.href.split('#')[0].split('?')[0] + '?skin=' + skin;
};

const getCurrentSkin = function () {
  const header = document.getElementById('header');
  let skin = location.href.split('skin=')[1];

  if (!skin) {
    skin = 'Snapgram';
  }

  if (skin.indexOf('#') !== -1) {
    skin = skin.split('#')[0];
  }

  const skins = {
    Snapgram: {
      avatars: true,
      list: false,
      autoFullScreen: false,
      cubeEffect: true,
      paginationArrows: false
    },

    VemDeZAP: {
      avatars: false,
      list: true,
      autoFullScreen: false,
      cubeEffect: false,
      paginationArrows: true
    },

    FaceSnap: {
      avatars: true,
      list: false,
      autoFullScreen: true,
      cubeEffect: false,
      paginationArrows: true
    },

    Snapssenger: {
      avatars: false,
      list: false,
      autoFullScreen: false,
      cubeEffect: false,
      paginationArrows: false
    }
  };

  const el = document.querySelectorAll('#skin option');
  const total = el.length;
  for (let i = 0; i < total; i++) {
    const what = skin == el[i].value;

    if (what) {
      el[i].setAttribute('selected', 'selected');

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
