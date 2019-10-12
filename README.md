# Mini Media Player

[![](https://img.shields.io/github/release/kalkih/mini-media-player.svg?style=flat-square)](https://github.com/kalkih/mini-media-player/releases/latest)
[![](https://img.shields.io/travis/kalkih/mini-media-player.svg?style=flat-square)](https://travis-ci.org/kalkih/mini-media-player)

A minimalistic yet customizable media player card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

![Preview Image](https://user-images.githubusercontent.com/457678/47517460-9282d600-d888-11e8-9705-cf9ec3698c3c.png)

## Install

*This card is available in [HACS](https://github.com/custom-components/hacs) (Home Assistant Community Store)*

### Simple install

1. Download and copy `mini-media-player-bundle.js` from the [latest release](https://github.com/kalkih/mini-media-player/releases/latest) into your `config/www` directory.

2. Add a reference to `mini-media-player-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-media-player-bundle.js?v=1.4.1
      type: module
  ```

### CLI install

1. Move into your `config/www` directory

2. Grab `mini-media-player-bundle.js`

  ```console
  $ wget https://github.com/kalkih/mini-media-player/releases/download/v1.4.1/mini-media-player-bundle.js
  ```

3. Add a reference to `mini-media-player-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-media-player-bundle.js?v=1.4.1
      type: module
  ```

### *(Optional)* Add to custom updater

1. Make sure you've the [custom_updater](https://github.com/custom-components/custom_updater) component installed and working.

2. Add a new reference under `card_urls` in your `custom_updater` configuration in `configuration.yaml`.

  ```yaml
  custom_updater:
    card_urls:
      - https://raw.githubusercontent.com/kalkih/mini-media-player/master/tracker.json
  ```

## Updating
1. Find your `mini-media-player-bundle.js` file in `config/www` or wherever you ended up storing it.

2. Replace the local file with the latest one attached in the [latest release](https://github.com/kalkih/mini-media-player/releases/latest).

3. Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

  ```yaml
  resources:
    - url: /local/mini-media-player-bundle.js?v=1.4.1
      type: module
  ```

*You may need to empty the browsers cache if you have problems loading the updated card.*

## Using the card

### Options

#### Card options
| Name | Type | Default | Since | Description |
|------|------|---------|-------|-------------|
| type | string | **required** | v0.1 | `custom:mini-media-player`
| entity | string | **required** | v0.1 | An entity_id from an entity within the `media_player` domain.
| name | string | optional | v0.6 | Override the entities friendly name.
| icon | string | optional | v0.1 | Specify a custom icon from any of the available mdi icons.
| more_info | boolean | true | v0.1 | Enable the "more info" popup dialog when pressing on the card.
| group | boolean | optional | v0.1 | Removes paddings, background color and box-shadow.
| hide | object | optional | v1.0.0 | Manage visible UI elements, see [hide object](#hide-object) for available options.
| artwork | string | default | v0.4 | `cover` to display current artwork in the card background, `full-cover` to display full artwork, `none` to hide artwork, `full-cover-fit` for full cover without cropping.
| tts | object | optional | v1.0.0 | Show Text-To-Speech input, see [TTS object](#tts-object) for available options.
| source | string | optional | v0.7 | Change source select appearance, `icon` for just an icon, `full` for the full source name.
| sound_mode | string | optional | v1.1.2 | Change sound mode select appearance, `icon` for just an icon, `full` for the full sound mode name.
| info | string | optional | v1.0.0 | Change how the media information is displayed, `short` to limit media information to one row, `scroll` to scroll overflowing media info.
| volume_stateless | boolean | false | v0.6 | Swap out the volume slider for volume up & down buttons.
| max_volume | number | optional | v0.8.2 | Specify the max vol limit of the volume slider (number between 1 - 100).
| min_volume | number | optional | v1.1.2 | Specify the min vol limit of the volume slider (number between 1 - 100).
| replace_mute | string | optional | v0.9.8 | Replace the mute button, available options are `play_pause` (previously `play`), `stop`, `play_stop`, `next`.
| toggle_power | boolean | true | v0.8.9 | Set to `false` to change the power button behaviour to `media_player.turn_on`/`media_player.turn_off`.
| idle_view | object | optional | v1.0.0 | Display a less cluttered view when idle, See [Idle object](#idle-object) for available options.
| background | string | optional | v0.8.6 | Background image, specify the image url `"/local/background-img.png"` e.g.
| speaker_group | object | optional | v1.0.0 | Speaker group management/multiroom, see [Speaker group object](#speaker-group-object) for available options.
| shortcuts | object | optional | v1.0.0 | Media shortcuts in a list or as buttons, see [Shortcut object](#shortcuts-object) for available options.

#### Idle object
| Name | Type | Default | Description |
|------|------|---------|-------------|
| when_idle | boolean | optional | Render the idle view when player state is `idle`.
| when_paused | boolean | optional | Render the idle view when player state is `paused`
| when_standby | boolean | optional | Render the idle view when player state is `standby`
| after | string | optional | Specify a number (minutes) after which the card renders as idle *(only supported on platforms exposing `media_position_updated_at`)*.

#### TTS object
| Name | Type | Default | Description |
|------|------|---------|-------------|
| platform | string | **required** | Specify [TTS platform](https://www.home-assistant.io/components/tts/), e.g. `google_translate` or `amazon_polly`, `alexa`<sup>[1](#tts_foot1)</sup> for ["Alexa as Media Player"](https://community.home-assistant.io/t/echo-devices-alexa-as-media-player-testers-needed/58639), `ga`<sup>[2](#tts_foot2)</sup><sup>[3](#tts_foot3)</sup> for use with [Google Assistant Webserver](https://community.home-assistant.io/t/community-hass-io-add-on-google-assistant-webserver-broadcast-messages-without-interrupting-music/37274) or [Assistant Relay](https://github.com/greghesp/assistant-relay), `sonos`<sup>[2](#tts_foot2)</sup> for use with modified [sonos_say script](https://github.com/kalkih/mini-media-player/issues/86#issuecomment-465541825), `webos`<sup>[4](#tts_foot4)</sup>.
| language | string | optional | The output language.
| entity_id | string/list | optional | The *entity_id* of the desired output entity or a list of *entity_id's*, can also be `all` to broadcast to all entities.
| volume | float | optional | Volume level of tts output (0 - 1), only supported by platform `sonos`.
| type | string | optional | `tts`, `announce` or `push`, defaults to `tts`, only supported by platform `alexa`, more info [here](https://github.com/keatontaylor/alexa_media_player/wiki/Notification-Component#functionality).

<a name="tts_foot1"><sup>1</sup></a> Does not support the `language` option.

<a name="tts_foot2"><sup>2</sup></a> Does not support `language` & `entity_id` options.

<a name="tts_foot3"><sup>3</sup></a> Requires a custom notify service named `ga_broadcast`, see example below.

<a name="tts_foot4"><sup>4</sup></a> Requires the card entity name to match the notify service name, if they don't match please specify the notify service name in the `entity_id` option.

```yaml
# configuration.yaml
notify:
  - name: ga_broadcast
    platform: rest
    resource: http://[xxx.x.x.xxx]:5000/broadcast_message
```

#### Speaker group object
See [Speaker group management](#speaker-group-management) for example usage.

**Supported platforms**
- sonos
- bluesound
- snapcast

| Name | Type | Default | Description |
|------|------|---------|-------------|
| entities | list | **required** | A list containing [speaker entities](#speaker-entity-object) of one of supported platforms, to enable group management of those speakers.
| platform | string | 'sonos' | The media_player platform to control. `sonos`, `snapcast`, `bluesound` or `yamaha_musiccast`<sup>[1](#speaker_foot1)</sup>.
| sync_volume | boolean | optional | Keep volume Synchronize between grouped speakers.
| expanded | boolean | optional | Make the speaker group list expanded by default.
| show_group_count | boolean | true | Have the number of grouped speakers displayed (if any) in the card name.
| icon | string | optional | Override default group button icon *(any mdi icon)*.

<a name="speaker_foot1"><sup>1</sup></a> Currently not yet supported in Home Assistant, *soon™*

#### Speaker entity object
| Name | Type | Default | Description |
|------|------|---------|-------------|
| entity_id | string | **required** | The *entity_id* for the speaker entity.
| name | string | **required** | A display name.
| volume_offset | number | optional | Volume offset *(0-100)* when used with `sync_volume`.

#### Shortcuts object
See [card with media shortcuts](#card-with-media-shortcuts) for example usage.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| list | list | optional | A list of [shortcut items](#shortcut-item-object) to be presented as a list, see shortcut item object.
| buttons | list | optional | A list of [shortcut items](#shortcut-item-object) to be presented as buttons.
| hide_when_off | boolean | false | Hide the shortcuts while the entity is off.
| columns | integer (1-6) | 2 | Specify the max number of buttons per row.
| column_height | number | optional | Specify the column height in pixels.
| label | string | `shortcuts...` | Specify a custom default label for the shortcut dropdown.
| attribute | string | optional | Specify any attribute exposed by the media player entity. The attribute value (if exists) is compared with shortcut `id`'s to distinguish selected/active shortcut<sup>[1](#shortcuts_foot1)</sup>.
| align_text | string | optional | Specify alignment of button icon/text `left`, `right`, `center`.

<a name="shortcuts_foot1"><sup>1</sup></a> Examples, `source` for active source or `sound_mode` for active sound mode.

#### Shortcut item object
| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | string | optional | A display name.
| icon | string | optional | A display icon *(any mdi icon)*.
| type | string | **required** | Type of shortcut. A media type: `music`, `tvshow`, `video`, `episode`, `channel`, `playlist` e.g. or an action type: `source`, `sound_mode`, `script` or `service`.
| id | string | **required** | The media identifier. The format of this is component dependent. For example, you can provide URLs to Sonos & Cast but only a playlist ID to iTunes & Spotify. A source/(sound mode) name can also be specified to change source/(sound mode), use together with type `source`/`sound_mode`. If type `script` specify the script name here or `service` specify the `<domain>.<service>`.
| data | list | optional | Extra service payload<sup>[1](#shortcut_foot1)</sup>.

<a name="shortcut_foot1"><sup>1</sup></a> Only compatible with `script` & `service` shortcuts, useful for sending variables to script.

#### Hide object
| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | boolean | false | The name.
| icon | boolean | false | The entity icon.
| info | boolean | false | The media information.
| power | boolean | false | The power button.
| source | boolean | false | The source select.
| sound_mode | boolean | true | The sound_mode select.
| controls | boolean | false | The media playback controls.
| play_pause | boolean | false | The play/pause button in media playback controls.
| play_stop | boolean | true | The play/stop button in media playback controls.
| volume | boolean | false | The volume controls.
| mute | boolean | false | The mute button.
| progress | boolean | false | The progress bar.
| runtime | boolean | true | The media runtime indicators.
| artwork_border | boolean | true | The border of the `default` artwork picture.
| power_state | boolean | true | Dynamic color of the power button to indicate on/off.
| shuffle | boolean | true | The shuffle button (only for players with `shuffle_set` support).


### Theme variables
The following variables are available and can be set in your theme to change the appearence of the card.
Can be specified by color name, hexadecimal, rgb, rgba, hsl, hsla, basically anything supported by CSS.

| name | Default | Description |
|------|---------|-------------|
| mini-media-player-base-color | var(--primary-text-color) & var(--paper-item-icon-color) | The color of base text & buttons
| mini-media-player-accent-color | var(--accent-color) | The accent color of UI elements
| mini-media-player-icon-color |  --mini-media-player-base-color, var(--paper-item-icon-color, #44739e) | The color for icons
| mini-media-player-overlay-color | rgba(0,0,0,0.5) | The color of the background overlay
| mini-media-player-overlay-base-color | white | The color of base text, icons & buttons while artwork cover is present
| mini-media-player-overlay-accent-color | white | The accent color of UI elements while artwork cover is present
| mini-media-player-media-cover-info-color | white | Color of the media information text while artwork cover is present
| mini-media-player-artwork-opacity | 1 | Opacity of cover artwork
| mini-media-player-artwork-opacity | 1 | Opacity of cover artwork
| mini-media-player-progress-height | 6px | Progressbar height


### Example usage

#### Basic card
<img src="https://user-images.githubusercontent.com/457678/52081816-771c1b00-259b-11e9-8c1e-cfd93ac3e66d.png" width="500px" alt="Basic card example" />

```yaml
- type: custom:mini-media-player
  entity: media_player.kitchen_speakers
```

#### Compact card
Setting either `volume` and/or `controls` to `true` in the `hide` option object will render the player as a single row.

<img src="https://user-images.githubusercontent.com/457678/53042774-569efc80-3487-11e9-8242-03d388d40c34.png" width="500px" alt="Compact card example" />

```yaml
- type: custom:mini-media-player
  entity: media_player.example
  icon: mdi:spotify
  artwork: cover
  hide:
    volume: true
    source: true
    power_state: false
```

#### Card with media shortcuts
You can specify media shortcuts through the `shortcuts` option, either as a list or as buttons or why not both?

<img src="https://user-images.githubusercontent.com/457678/53040712-5e0fd700-3482-11e9-9990-6ca13b871f50.png" width="500px" alt="Card with media shortcuts example">

```yaml
- entity: media_player.spotify
  type: custom:mini-media-player
  artwork: cover
  source: icon
  hide:
    volume: true
  shortcuts:
    columns: 4 # Max buttons per row
    buttons:
      # Start predefined playlist
      - icon: mdi:cat
        type: playlist
        id: spotify:user:spotify:playlist:37i9dQZF1DZ06evO2O09Hg
      # Change the source to bathroom
      - icon: mdi:dog
        type: source
        id: Bathroom
      # Trigger script
      - icon: mdi:dog
        type: script
        id: script.script_name
      ... # etc.
```

#### Grouped cards
Set the `group` option to `true` when nesting mini media player cards inside other cards that already have margins/paddings.

<img src="https://user-images.githubusercontent.com/457678/52081831-800cec80-259b-11e9-9b35-63b23805c879.png" width="500px" alt="Grouped cards example" />

```yaml
- type: entities
  entities:
    - type: custom:mini-media-player
      entity: media_player.multiroom_player
      group: true
      source: icon
      info: short
      hide:
        volume: true
        power: true
    - type: custom:mini-media-player
      entity: media_player.kitchen_speakers
      group: true
      hide:
        controls: true
    - type: custom:mini-media-player
      entity: media_player.bathroom_speakers
      group: true
      hide:
        controls: true
    - type: custom:mini-media-player
      entity: media_player.bedroom_speakers
      group: true
      hide:
        controls: true
    - type: custom:mini-media-player
      entity: media_player.patio_speakers
      group: true
      hide:
        controls: true
```

#### Stacked cards
By using vertical and horizontal stacks, you can achieve many different setups.

<img src="https://user-images.githubusercontent.com/457678/52081830-800cec80-259b-11e9-9a77-0e8585c3f71c.png" width="500px" alt="Stacked cards example" />

```yaml
- type: horizontal-stack
  cards:
    - entity: media_player.tv_livingroom
      type: custom:mini-media-player
      info: short
      artwork: cover
      hide:
        mute: true
        icon: true
        power_state: false
    - entity: media_player.tv_bedroom
      type: custom:mini-media-player
      info: short
      artwork: cover
      hide:
        mute: true
        icon: true
        power_state: false
- type: horizontal-stack
  cards:
    - entity: media_player.cc_patio
      type: custom:mini-media-player
      hide:
        icon: true
    - entity: media_player.cc_kitchen
      type: custom:mini-media-player
      hide:
        icon: true
    - entity: media_player.cc_bath
      type: custom:mini-media-player
      hide:
        icon: true
```

#### Speaker group management
Specify all your speaker entities in a list under the option `speaker_group` -> `entities`. They obviously need to be of the same platform.

* The card does only allow changes to be made to groups where the entity of the card is the coordinator/master speaker.
* Checking a speakers in the list will make it join the group of the card entity. (*`media_player.sonos_office`* in the example below).
* Unchecking a speaker in the list will remove it from any group it's a part of.

<img src="https://user-images.githubusercontent.com/457678/52181170-53511300-27ef-11e9-9d54-aa9c84a96168.gif" width="500px" alt="sonos group management example">

```yaml
- type: custom:mini-media-player
  entity: media_player.sonos_office
  hide:
    power: true
    icon: true
    source: true
  speaker_group:
    platform: sonos
    show_group_count: true
    entities:
      - entity_id: media_player.sonos_office
        name: Sonos Office
      - entity_id: media_player.sonos_livingroom
        name: Sonos Livingroom
      - entity_id: media_player.sonos_kitchen
        name: Sonos Kitchen
      - entity_id: media_player.sonos_bathroom
        name: Sonos Bathroom
      - entity_id: media_player.sonos_bedroom
        name: Sonos Bedroom
```

If you are planning to use the `speaker_group` option in several cards, creating a separate yaml file for the list is highly recommended, this will result in a less cluttered `ui-lovelace.yaml` and also make the list easier to manage and maintain.
You then simply reference the file containing the list using `entities: !include filename.yaml` for every occurrence of `entities` in your `ui-lovelace.yaml`.

This is however only possible when you have lovelace mode set to yaml in your HA configuration, see [Lovelace YAML mode](https://www.home-assistant.io/lovelace/yaml-mode/) for more info.

## Development
*If you plan to contribute back to this repo, please fork & create the PR against the [dev](https://github.com/kalkih/mini-media-player/tree/dev) branch.*

**Clone this repository into your `config/www` folder using git.**

 ```console
$ git clone https://github.com/kalkih/mini-media-player.git
```

**Add a reference to the card in your `ui-lovelace.yaml`.**

```yaml
resources:
  - url: /local/mini-media-player/dist/mini-media-player-bundle.js
    type: module
```

### Instructions

*Requires `nodejs` & `npm`*

1. Move into the `mini-media-player` repo, checkout the *dev* branch & install dependencies.
```console
$ cd mini-media-player && git checkout dev && npm install
```

2. Make changes to the source

3. Build the source by running
```console
$ npm run build
```

4. Refresh the browser to see changes

    *Make sure cache is cleared or disabled*

5. *(Optional)* Watch the source and automatically rebuild on save
```console
$ npm run watch
```

*The new `mini-media-player-bundle.js` will be build and ready inside `/dist`.*


## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest version of `mini-media-player-bundle.js`.

If you have issues after updating the card, try clearing your browsers cache or restart Home Assistant.

If you are getting "Custom element doesn't exist: mini-media-player" or running older browsers try replacing `type: module` with `type: js` in your resource reference, like below.

```yaml
resources:
  - url: ...
    type: js
```

## Inspiration
- [@ciotlosm](https://github.com/ciotlosm) - [custom-lovelace](https://github.com/ciotlosm/custom-lovelace)
- [@c727](https://github.com/c727) - [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135)

## License
This project is under the MIT license.
