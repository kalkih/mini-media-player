# Lovelace Mini Media Player
A minified version of the default lovelace media player card in [Home Assistant](https://github.com/home-assistant/home-assistant).

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

| Single player | Grouping players|
|:----:|:----:|
| <img src="https://user-images.githubusercontent.com/457678/45498746-0fe00480-b77b-11e8-8930-6b350877445d.png" alt="Preview 1" width="300"> | <img src="https://user-images.githubusercontent.com/457678/45498745-0fe00480-b77b-11e8-8a54-8946c535ac11.png" alt="Preview 2" width="300"> |

## Install

### Simple install

- Copy `mini-media-player.js` into your `config/www` folder.
- Add a reference to the `mini-media-player.js` inside your. `ui-lovelace.yaml`

```yaml
resources:
  - url: /local/mini-media-player.js
    type: js
```

### Install using git

- Clone this repository into your `config/www` folder using git.

```bash
git clone https://github.com/kalkih/lovelace-mini-media-player.git
```

- Add a reference to the card in your `ui-lovelace.yaml`.

```yaml
resources:
  - url: /local/mini-media-player/mini-media-player.js
    type: js
```

## Using the card

### Options

| Name | Type | Default | Description |
|------|:----:|:-------:|-------------|
| type | string | **required** | `custom:mini-media-player`
| entity | string | **required** | An entity_id from an entity within the `media_player` domain.
| title | string | optional | Set a card title.
| icon | string | optional | Specify a custom icon from any of the available mdi icons.
| group | boolean | false | Are you using this card inside another card, `entities` for example? Then set this option to true to avoid double paddings and the extra box-shadow.
| more_info | boolean | true | Set to `false` to disable the "more info" dialog when clicking on the card.
| show_tts | string | optional | If you want to show the TTS input directly on the media player card, specify your [TTS platform](https://www.home-assistant.io/components/tts/) here: `show_tts: google`, `show_tts: amazon_polly`, `show_tts: marytts` e.g.

### Example usage

#### Standalone card
```yaml
- type: custom:mini-media-player
  entity: media_player.spotify
  icon: 'mdi:cast'
```

#### Grouping several
Use the card in a group together with other players or entities

```yaml
- type: entities
  title: Media
  entities:
  - entity: media_player.spotify
    type: "custom:mini-media-player"
    group: true
  - entity: media_player.samsungtv
    type: "custom:mini-media-player"
    group: true
```

*Don't forget to set the group option to true.*

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest version of the code.

## Inspiration
- [@ciotlosm](https://github.com/ciotlosm) - [custom-lovelace](https://github.com/ciotlosm/custom-lovelace)
- [@c727](https://github.com/c727) - [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135)

## License
This project is under the MIT license.
