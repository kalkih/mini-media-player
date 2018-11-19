# Mini Media Player
A minimalistic yet powerful & customizable media player card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

![Preview Image](https://user-images.githubusercontent.com/457678/47517460-9282d600-d888-11e8-9705-cf9ec3698c3c.png)

## Install

### Simple install

1. Download and copy `mini-media-player-bundle.js` from the [latest release](https://github.com/kalkih/mini-media-player/releases/latest) into your `config/www` directory.

- Add a reference to `mini-media-player-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-media-player-bundle.js?v=0.9.3
      type: module
  ```

### CLI install

1. Move into your `config/www` directory

- Grab `mini-media-player-bundle.js`

  ```
  $ wget https://github.com/kalkih/mini-media-player/releases/download/v0.9.3/mini-media-player-bundle.js
  ```

- Add a reference to `mini-media-player-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-media-player-bundle.js?v=0.9.3
      type: module
  ```

### *(Optional)* Add to custom updater

1. Make sure you've the [custom_updater](https://github.com/custom-components/custom_updater) component installed and working.

- Add a new reference under `card_urls` in your `custom_updater` configuration in `configuration.yaml`.

  ```yaml
  custom_updater:
    card_urls:
      - https://raw.githubusercontent.com/kalkih/mini-media-player/master/tracker.json
  ```

## Updating
 **Important:** If you are updating from a version prior to v0.5, make sure you change `- type: js` to `- type: module` in your reference to the card in your `ui-lovelace.ysml`.

1. Find your `mini-media-player-bundle.js` file in `config/www` or wherever you ended up storing it.

- Replace the local file with the latest one attached in the [latest release](https://github.com/kalkih/mini-media-player/releases/latest).

- Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

  ```yaml
  resources:
    - url: /local/mini-media-player-bundle.js?v=0.9.3
      type: module
  ```

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
| group | boolean | false | v0.1 | Disable paddings and box-shadow.
| show_tts | string | optional | v0.2 | Show Text-To-Speech input, specify [TTS platform](https://www.home-assistant.io/components/tts/), e.g. `show_tts: google` or `show_tts: amazon_polly`.
| show_source | string | false | v0.7 | `true` display source select, `small` to only display the source button (v0.8.1), `full` display the full source name (v0.9.1).
| show_progress | boolean | false | v0.8.3 | Display a progress bar when media progress information is available.
| show_shuffle | boolean | false | v0.8.9 | Display a shuffle button (only for players with `shuffle_set` support).
| hide_power | boolean | false | v0.7 | Hide the power button.
| hide_controls | boolean | false | v0.8 | Hide media control buttons (*sets `short_info` to `true`*).
| hide_volume | boolean | false | v0.8 | Hide volume controls. (*sets `short_info` to `true`*).
| hide_media_info | boolean | false | v0.9.1 | Hide media information.
| hide_mute | boolean | false | v0.8.1 | Hide the mute button.
| hide_info | boolean | false | v0.8.4 | Hide entity icon, entity name & media information.
| hide_icon | boolean | false | v0.8.8 | Hide the entity icon.
| artwork | string | default | v0.4 | `cover` to display current artwork in the card background, `full-cover` to display full artwork, `none` to hide artwork.
| short_info | boolean | false | v0.8 | Limit media information to one row.
| scroll_info | boolean | false | v0.8 | Limit media information to one row, scroll through the overflow.
| power_color | boolean | false | v0.4 | Make power button change color based on on/off state.
| artwork_border | boolean | false | v0.3 | Display a border around the `default` media artwork.
| volume_stateless | boolean | false | v0.6 | Swap out the volume slider for volume up & down buttons.
| toggle_power | boolean | true | v0.8.9 | Change power button behaviour `turn_off` / `turn_on` or `toggle`
| idle_view | boolean | false | v0.9.3 | Display a less cluttered view when player is idle.
| consider_idle_after | number | optional | v0.8.9 | Specify a number (minutes) *only supported on players with `media_position_updated_at`)* after which the player displays as idle.
| consider_pause_idle | boolean | false | v0.9.1 | Display the player as idle when player is paused
| more_info | boolean | true | v0.1 | Enable the "more info" dialog when pressing on the card.
| max_volume | number | true | v0.8.2 | Max volume for the volume slider (number between 1 - 100).
| background | string | optional | v0.8.6 | Background image, specify the image url `"/local/background-img.png"` e.g.

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

## Development

**Clone this repository into your `config/www` folder using git.**

```
$ git clone https://github.com/kalkih/mini-media-player.git
```

**Add a reference to the card in your `ui-lovelace.yaml`.**

```yaml
resources:
  - url: /local/mini-media-player/mini-media-player.js
    type: module
```

### Generate the bundle

*Requires `nodejs` & `npm`*

**Move into the `mini-media-player` repo & install dependencies.**

```
$ npm install
```

**Edit the source file `mini-media-player.js`, build by running**
```
$ npm run build
```

The `mini-media-player-bundle.js` will be rebuilt and ready.


## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest version of `mini-media-player-bundle.js`.

If you have issues after updating the card, try clearing your browsers cache or restart Home Assistant.

If you are getting "Custom element doesn't exist: mini-media-player" or running older browsers try replacing `type: module` with `type: js` in your resource reference, like below.

```yaml
resources:
  - url: /local/mini-media-player-bundle.js?v=...
    type: js
```

## Inspiration
- [@ciotlosm](https://github.com/ciotlosm) - [custom-lovelace](https://github.com/ciotlosm/custom-lovelace)
- [@c727](https://github.com/c727) - [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135)

## License
This project is under the MIT license.
