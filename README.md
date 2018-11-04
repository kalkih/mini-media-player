# Mini Media Player
A minimalistic yet powerful & customizable media player card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

![Preview Image](https://user-images.githubusercontent.com/457678/47517460-9282d600-d888-11e8-9705-cf9ec3698c3c.png)

## Install

### Simple install

- Copy `mini-media-player.js` into your `config/www` folder.
- Add a reference to the `mini-media-player.js` inside your `ui-lovelace.yaml`.

```yaml
resources:
  - url: /local/mini-media-player.js?v=0.8.9
    type: module
```

### Install using git

- Clone this repository into your `config/www` folder using git.

```bash
git clone https://github.com/kalkih/mini-media-player.git
```

- Add a reference to the card in your `ui-lovelace.yaml`.

```yaml
resources:
  - url: /local/mini-media-player/mini-media-player.js?v=0.8.9
    type: module
```

### *(Optional)* Add to custom updater

- Make sure you got the [custom_updater](https://github.com/custom-components/custom_updater) component installed.
- Add a reference under `card_urls` in your `custom_updater` configuration in `configuration.yaml`.

```yaml
custom_updater:
  card_urls:
    - https://raw.githubusercontent.com/kalkih/mini-media-player/master/tracker.json
```

## Updating
 **Important:** If you are updating from a version prior to v0.5, make sure you change `- type: js` to `- type: module` in your reference to the card in your `ui-lovelace.ysml`.

- Find your `mini-media-player.js` file in `config/www` or wherever you ended up storing it.
- Replace the file with the latest version of [mini-media-player.js](mini-media-player.js).
- Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

```yaml
resources:
  - url: /local/mini-media-player.js?v=0.8.9
    type: module
```

If you went the `git clone` route, just run `git pull` from inside your `config/www/mini-media-player` directory, to get the latest version of the code.

*You may need to empty the browsers cache if you have problems loading the updated card.*

## Using the card

### Options

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type | string | **required** | v0.1 | `custom:mini-media-player`
| entity | string | **required** | v0.1 | An entity_id from an entity within the `media_player` domain.
| title | string | optional | v0.1 | Set a card title.
| name | string | optional | v0.6 | Override the entities friendly name.
| icon | string | optional | v0.1 | Specify a custom icon from any of the available mdi icons.
| group | boolean | false | v0.1 | Are you using this card inside another card, `entities` for example? Then set this option to true to avoid double paddings and the extra box-shadow.
| show_tts | string | optional | v0.2 | If you want to show the TTS input directly on the media player card, specify your [TTS platform](https://www.home-assistant.io/components/tts/) here: `show_tts: google`, `show_tts: amazon_polly`, `show_tts: marytts` e.g.
| show_source | string | false | v0.7 | Set this option to `true` to display the current source, set to `small` to hide current source and only display the source button (v0.8.1).
| show_progress | boolean | false | v0.8.3 | Set to `true` to show a progress bar when media progress information is available.
| show_shuffle | boolean | false | v0.8.9 | Set to `true` to show a shuffle button (only for players that support `shuffle_set`).
| hide_power | boolean | false | v0.7 | Set to `true` to hide the power button.
| hide_controls | boolean | false | v0.8 | Set to `true` to hide media control buttons (*sets `short_info` to `true`*).
| hide_volume | boolean | false | v0.8 | Set to `true` to hide volume controls. (*sets `short_info` to `true`*).
| hide_mute | boolean | false | v0.8.1 | Set to `true` to hide the mute button.
| hide_info | boolean | false | v0.8.4 | Set to `true` to hide entity icon, entity name & media information.
| hide_icon | boolean | false | v0.8.8 | Set to `true` to hide the entity icon.
| artwork | string | default | v0.4 | Set to `cover` to have artwork displayed as the cards background *(looks best for ungrouped cards without a title)*, set to `none` to never display artwork.
| short_info | boolean | false | v0.8 | Set to `true` to have the media information stay on a single line and cut off any potential overflowing text.
| scroll_info | boolean | false | v0.8 | Set to `true` to have the media information stay on a single line and scroll through any potential overflowing text.
| power_color | boolean | false | v0.4 | Set to `true` to have the power button change color based on power on/off.
| artwork_border | boolean | false | v0.3 | Set to `true` to display a border around the media artwork, border color changes depending on playing state. *only applies to `artwork: default`*
| volume_stateless | boolean | false | v0.6 | Set to `true` to swap out the volume slider for volume. up/down buttons (useful for media players that doesn't support volume state).
| toggle_power | boolean | true | v0.8.9 | Set to `false` to have the card call `turn_off` / `turn_on` service instead of `toggle` when pressing the power button.
| consider_idle_after | number | optional | v0.8.9 | Useful for players that doesn't turn off, specify a number (minutes), if the player hasn't updated its media position in specified amount of minutes the card will render as idle. (only supported on players that report `media_position_updated_at`).
| more_info | boolean | true | v0.1 | Set to `false` to disable the "more info" dialog when clicking on the card.
| max_volume | number | true | v0.8.2 | Set a max volume for the volume slider (number between 1 - 100).
| background | string | optional | v0.8.6 | Set a background image, specify the image url `"/local/background-img.png"` e.g.

### Example usage

#### Single player
```yaml
- type: custom:mini-media-player
  entity: media_player.avr
  icon: mdi:router-wireless
  artwork_border: true
  show_source: true
```

<img src="https://user-images.githubusercontent.com/457678/47515832-256d4180-d884-11e8-97a6-267c5c63c000.png" width="500px" />

#### Compact player
Setting either `hide_volume` and/or `hide_controls` to `true` will make the  player collapse into one row.
```yaml
- type: custom:mini-media-player
  entity: media_player.spotify
  name: Spotify Player
  artwork: cover
  power_color: true
  hide_volume: true
  show_progress: true
```

<img src="https://user-images.githubusercontent.com/457678/47516141-fc997c00-d884-11e8-9bc9-eb9b0818f28b.png" width="500px" />

#### Grouping players
Set the `group` option to `true` when nesting the mini media player(s) inside  cards that already have margins/paddings.

```yaml
- type: entities
  title: Media Players
  entities:
    - entity: media_player.spotify
      type: custom:mini-media-player
      group: true
    - entity: media_player.google_home
      type: custom:mini-media-player
      hide_controls: true
      show_tts: google
      group: true
    - entity: media_player.samsung_tv
      type: custom:mini-media-player
      hide_controls: true
      group: true
```

<img src="https://user-images.githubusercontent.com/457678/47516557-08d20900-d886-11e8-8922-4973c0aab94a.png" width="500px" />

## Bundle

If you want to avoid loading resources from https://unpkg.com, you can use
`mini-media-player-bundle.js` instead.

## Updating bundle (for developer)

Install `nodejs` and `npm`, install dependances by running:

```
$ npm install
```

Edit source file `mini-media-player.js`, build by running:
```
$ npm build
```

Then `mini-media-player-bundle.js` will be updated and ready to use.

Finally commit file `mini-media-player-bundle.js` to git.

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest version of `mini-media-player.js`.

If you have issues after updating the card, try clearing your browsers cache or restart Home Assistant.

## Inspiration
- [@ciotlosm](https://github.com/ciotlosm) - [custom-lovelace](https://github.com/ciotlosm/custom-lovelace)
- [@c727](https://github.com/c727) - [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135)

## License
This project is under the MIT license.
