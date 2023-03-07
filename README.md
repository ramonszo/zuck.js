# zuck.js

[![Zuck.JS demo](https://raw.githubusercontent.com/ramonszo/assets/master/zuck.js/preview.gif)](https://on.ramon.codes/2k9e7au)

## Add stories EVERYWHERE
MWHAHAHAHA. Seriously. This script is a copy of Facebook Stories of ~~a copy of Facebook Messenger Day (RIP)~~ of a copy of WhatsApp status of a copy of Instagram stories of a copy of Snapchat stories.

You can read stories from any endpoint (JSON, Firebase, etc.) and the script will do the rest.

Live demo: https://on.ramon.codes/2k9e7au

React sample: https://on.ramon.codes/2lDP53H

[![CDNJS](https://img.shields.io/cdnjs/v/zuck.js.svg?style=for-the-badge&logoColor=white&color=AA0000&maxAge=3600)](https://cdnjs.com/libraries/zuck.js) [![NPM](https://img.shields.io/npm/v/zuck.js.svg?style=for-the-badge&logoColor=white&color=AA0000&maxAge=3600)](https://www.npmjs.com/package/zuck.js)


## Features
* Custom CSS themes: [Snapgram](https://on.ramon.codes/cS5F), [FaceSnap](https://on.ramon.codes/oLt4), [Snapssenger](https://on.ramon.codes/G6Dt) and [VemDeZAP](https://on.ramon.codes/kj6R)
* Gestures, Custom events & Custom templates
* A simple API to manage your "Stories timeline"
* 3D cube effect
* React support
* RTL support
* TypeScript

## How to use
You can download this git repository or install via ```npm install zuck.js``` or ```yarn add zuck.js```

#### 1. Import

```js
import { Zuck } from 'zuck.js';

import 'zuck.js/css';
import 'zuck.js/skins/snapgram';
```

or include the script tag and css:

```HTML
<link rel="stylesheet" href="https://unpkg.com/zuck.js/dist/zuck.css" />
<link rel="stylesheet" href="https://unpkg.com/zuck.js/dist/skins/snapgram.css" />

<script src="https://unpkg.com/zuck.js/dist/zuck.js"></script>
```

#### 2. Initialize:

```HTML
<div id="stories"></div>
```


```js
const options = {}; // See ./src/options.ts

const element = document.querySelector("#stories");
const stories = Zuck(element, options);
```

## API

#### Add/update a story from timeline:

```js
const story = {}; // See TimelineItem on ./src/types.ts

stories.add(story);
stories.update(story);
 ```

#### Remove a story:

```js
stories.remove(storyId);
```

#### Add/remove a story item:

```js
const item = {}; // See StoryItem on ./src/types.ts

stories.addItem(storyId, item);
stories.removeItem(storyId, itemId);
```


#### Stories structure example
```js
// See StoriesTimeline on ./src/types.ts
```

#### Alternate call
```js
// See ./markup.sample.html
```

#### React support
This library is not made exclusively for React, but you can still use it with refs or by creating components based on the markup sample.

See `react.sample.html` for the simple implementation or `react-components.sample.html` for the detailed one.

#### Tips
- You can use with autoFullScreen option (disabled by default) to emulate an app on mobile devices.
- If you use Ionic or some js that uses ```location.hash```, you should always disable the "backNative" option which can mess your navigation.


## Limitations
On mobile browsers, video can't play with audio without a user gesture. So the script tries to play audio only when the user clicks to see the next story.
When the story is playing automatically, the video is muted, but an alert is displayed so the user may click to turn the audio on.

Stories links opens in a new window too. This behaviour occurs because most websites are blocked on iframe embedding.


## License
MIT


## Show your support!
Please ⭐️ this repository if this project helped you! Feel free to buy me a coffee:

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F710G8L)

---

<a href="https://ramon.codes" target="_blank">
  <img src="https://utils.ramon.codes/hit.svg?referrer=github.com&title=GitHub%20/%20zuck.js&location=https://github.com/ramonszo/zuck.js" width="24" height="24" />
</a>
