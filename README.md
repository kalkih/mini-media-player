# Lovelace Mini Media Player
A minimalistic lovelace media player card for [Home Assistant](https://github.com/home-assistant/home-assistant).

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

| Single player | Grouping players| Customizable |
|:----:|:----:|:----:|
| <img src="https://user-images.githubusercontent.com/457678/45498746-0fe00480-b77b-11e8-8930-6b350877445d.png" alt="Preview 1" width="250"> | <img src="https://user-images.githubusercontent.com/457678/45498745-0fe00480-b77b-11e8-8a54-8946c535ac11.png" alt="Preview 2" width="250"> | <img src="https://user-images.githubusercontent.com/457678/46092838-0c566f80-c1b6-11e8-9c54-3797a03f39e7.gif" alt="Preview 3" width="250"> |

## Install

### Simple install

- Copy `mini-media-player.js` into your `config/www` folder.
- Add a reference to the `mini-media-player.js` inside your `ui-lovelace.yaml`.

```yaml
resources:
  - url: /local/mini-media-player.js
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
  - url: /local/mini-media-player/mini-media-player.js
    type: module
```

## Updating
 **Important:** If you are updating from a version prior to v0.5, make sure you change `- type: js` to `- type: module` in your reference to the card in your `ui-lovelace.ysml`.

- Find your `mini-media-player.js` file in `config/www` or wherever you ended up storing it.
- Replace the file with the latest version of [mini-media-player.js](mini-media-player.js).
- Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

```yaml
resources:
  - url: /local/mini-media-player.js?ver=0.8
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
| show_source | boolean | false | v0.7 | Set this option to `true` to display the current source and a source select dropdown.
| hide_power | boolean | false | v0.7 | Set to `true` to hide the power button.
| hide_controls | boolean | false | v0.8 | Set to `true` to hide media control buttons (*sets `short_info` to `true`*).
| hide_volume | boolean | false | v0.8 | Set to `true` to hide volume controls. (*sets `short_info` to `true`*).
| artwork | string | default | v0.4 | Set to `cover` to have artwork displayed as the cards background *(looks best for ungrouped cards without a title)*.
| short_info | boolean | false | v0.8 | Set to `true` to have the media information stay on a single line and cut off any potential overflowing text.
| scroll_info | boolean | false | v0.8 | Set to `true` to have the media information stay on a single line and scroll through any potential overflowing text.
| power_color | boolean | false | v0.4 | Set to `true` to have the power button change color based on power on/off.
| artwork_border | boolean | false | v0.3 | Set to `true` to display a border around the media artwork, border color changes depending on playing state. *only applies to `artwork: default`*
| volume_stateless | boolean | false | v0.6 | Set to `true` to swap out the volume slider for volume. up/down buttons (useful for media players that doesn't support volume state).
| more_info | boolean | true | v0.1 | Set to `false` to disable the "more info" dialog when clicking on the card.


### Example usage

#### Single player
```yaml
- type: custom:mini-media-player
  entity: media_player.spotify
  icon: 'mdi:cast'
  artwork_border: true
  power_color: true
  show_source: true
```

<img src="https://user-images.githubusercontent.com/457678/46084819-d957b000-c1a4-11e8-897d-fda0385cbd2e.png" width="500px" />

#### Compact player
```yaml
- type: custom:mini-media-player
  entity: media_player.spotify
  name: Spotify Player
  artwork: cover
  hide_power: true
  hide_volume: true
  show_source: true
```

<img src="https://user-images.githubusercontent.com/457678/46084911-0ad07b80-c1a5-11e8-895f-729886bdc5bc.png" width="500px" />

#### Grouping players
Use the card in a group together with other players or entities

```yaml
- type: entities
  title: Media
  entities:
  - entity: media_player.spotify
    type: "custom:mini-media-player"
    name: Spotify
    group: true
  - entity: media_player.samsung_tv
    type: "custom:mini-media-player"
    group: true
  - entity: media_player.google_home
    type: "custom:mini-media-player"
    group: true
```

<img src="https://user-images.githubusercontent.com/457678/46085589-a6aeb700-c1a6-11e8-87ce-011db2bc64fb.png" width="500px" />

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest version of `mini-media-player.js`.

If you have issues after updating the card, try clearing your browser cache.

## Inspiration
- [@ciotlosm](https://github.com/ciotlosm) - [custom-lovelace](https://github.com/ciotlosm/custom-lovelace)
- [@c727](https://github.com/c727) - [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135)

## License
This project is under the MIT license.
