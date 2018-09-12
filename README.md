# Lovelace Mini Media Player
A minified version of the default lovelace media player card in [Home Assistant](https://github.com/home-assistant/home-assistant).

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

<img src="https://user-images.githubusercontent.com/457678/45425521-e7340e00-b699-11e8-8a91-6ff3f3f5b4d5.png" width="750px" alt="Preview">

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

## Inspiration
- [@ciotlosm](https://github.com/ciotlosm) - [custom-lovelace](https://github.com/ciotlosm/custom-lovelace)
- [@c727](https://github.com/c727) - [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135)

## License
This project is under the MIT license.
