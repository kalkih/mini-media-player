```js script
import { html } from '@open-wc/demoing-storybook';
import '../mini-media-player.js';

export default {
  title: 'MiniMediaPlayer',
  component: 'mini-media-player',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# MiniMediaPlayer

Minimalistic media player card for Home Assistant.

## Features:

- ...

## How to use

### Installation

```bash
npm install --save mini-media-player
```

```js
import 'mini-media-player/mini-media-player.js';
```

```js preview-story
export const Simple = () => html`
  <mini-media-player></mini-media-player>
`;
```

## Variations

###### A feature...

```js preview-story
export const CustomTitle = () => html`
  <mini-media-player></mini-media-player>
`;
```
