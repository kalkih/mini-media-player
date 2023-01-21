# Mini Media Player

[![](https://img.shields.io/github/release/kalkih/mini-media-player.svg?style=flat-square)](https://github.com/kalkih/mini-media-player/releases/latest)
[![](https://img.shields.io/travis/com/kalkih/mini-media-player?style=flat-square)](https://travis-ci.org/kalkih/mini-media-player)

A minimalistic yet customizable media player card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

Inspired by [Custom UI: Mini media player](https://community.home-assistant.io/t/custom-ui-mini-media-player/40135) and [custom-lovelace](https://github.com/ciotlosm/custom-lovelace).

![Preview Image](https://user-images.githubusercontent.com/457678/47517460-9282d600-d888-11e8-9705-cf9ec3698c3c.png)


## Installation

### HACS (recommended)

This card is available in [HACS](https://github.com/hacs/integration) (Home Assistant Community Store).

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend" section
4. Click button with "+" icon
5. Search for "Mini Media Player"

### Manual install

#### UI mode

1. Download and copy `mini-media-player-bundle.js` from the [latest release](https://github.com/kalkih/mini-media-player/releases/latest) into your `config/www` directory.
2. Go to Sidebar -> Settings -> Dashboards -> Menu (top right corner) -> Resources.
3. Click on `+ ADD RESOURCE`.
4. Type `/local/mini-media-player-bundle.js?v=1.16.9` below URL.
5. Choose `JavaScript Module` below Resource Type.
6. Accept.

#### YAML mode

1. Download and copy `mini-media-player-bundle.js` from the [latest release](https://github.com/kalkih/mini-media-player/releases/latest) into your `config/www` directory.
2. Add a reference to `mini-media-player-bundle.js` inside your `configuration.yaml` or through the Home Assistant UI from the resource tab.

```yaml
lovelace:
  resources:
    - url: /local/mini-media-player-bundle.js?v=1.16.9
      type: module
```

*To update the card to a new version after manual installation, update `mini-media-player-bundle.js` file from [latest release](https://github.com/kalkih/mini-media-player/releases/latest) and edit version of the card in your resources. You may need to empty the browsers cache if you have problems loading the updated card.*

## Using the card

### Options

#### Card options
| Name | Type | Default | Since | Description |
|------|------|---------|-------|-------------|
| type | string | **required** | v0.1 | `custom:mini-media-player`
| entity | string | **required** | v0.1 | An entity_id from an entity within the `media_player` domain.
| name | string | optional | v0.6 | Override the entities friendly name.
| icon | string | optional | v0.1 | Specify a custom icon from any of the available mdi icons.
| icon_image | string | optional | v1.16.2 | Override icon with an image url
| tap_action | [action object](#action-object-options) | true | v0.7.0 | Action on click/tap.
| group | boolean | optional | v0.1 | Removes paddings, background color and box-shadow.
| hide | object | optional | v1.0.0 | Manage visible UI elements, see [hide object](#hide-object) for available options.
| artwork | string | default | v0.4 | `cover` to display current artwork in the card background, `full-cover` to display full artwork, `material` for alternate artwork display with dynamic colors, `full-material` to display full artwork with dynamic colors, `none` to hide artwork, `full-cover-fit` for full cover without cropping. `square` will always display a rectangular card, even when nothing is being played. `square-material` does the same, but adds the dynamic colors also found in the other `-material` options.
| tts | object | optional | v1.0.0 | Show Text-To-Speech input, see [TTS object](#tts-object) for available options.
| source | string | optional | v0.7 | Change source select appearance, `icon` for just an icon, `full` for the full source name.
| sound_mode | string | optional | v1.1.2 | Change sound mode select appearance, `icon` for just an icon, `full` for the full sound mode name.
| info | string | optional | v1.0.0 | Change how the media information is displayed, `short` to limit media information to one row, `scroll` to scroll overflowing media info.
| volume_stateless | boolean | false | v0.6 | Swap out the volume slider for volume up & down buttons.
| volume_step | number | optional | v1.9.0 | Change the volume step size of the volume buttons and the volume slider (number between 1 - 100)<sup>[1](#option_foot1)</sup>.
| max_volume | number | optional | v0.8.2 | Specify the max vol limit of the volume slider (number between 1 - 100).
| min_volume | number | optional | v1.1.2 | Specify the min vol limit of the volume slider (number between 1 - 100).
| replace_mute | string | optional | v0.9.8 | Replace the mute button, available options are `play_pause` (previously `play`), `stop`, `play_stop`, `next`.
| jump_amount | number | 10 | v0.14.0 | Configure amount of seconds to skip/rewind for jump buttons.
| toggle_power | boolean | true | v0.8.9 | Set to `false` to change the power button behaviour to `media_player.turn_on`/`media_player.turn_off`.
| idle_view | object | optional | v1.0.0 | Display a less cluttered view when idle, See [Idle object](#idle-object) for available options.
| background | string | optional | v0.8.6 | Background image, specify the image url `"/local/background-img.png"` e.g.
| speaker_group | object | optional | v1.0.0 | Speaker group management/multiroom, see [Speaker group object](#speaker-group-object) for available options.
| shortcuts | object | optional | v1.0.0 | Media shortcuts in a list or as buttons, see [Shortcut object](#shortcuts-object) for available options.
| scale | number | optional | v1.5.0 | UI scale modifier, default is `1`.

<a name="option_foot1"><sup>1</sup></a> Only supported on entities with `volume_level` attribute.

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
| platform | string | **required** | Specify [TTS platform](https://www.home-assistant.io/components/tts/), e.g. `google_translate` or `amazon_polly`, `cloud` for Nabu Casa, `alexa`<sup>[1](#tts_foot1)</sup> for ["Alexa as Media Player"](https://community.home-assistant.io/t/echo-devices-alexa-as-media-player-testers-needed/58639), `ga`<sup>[2](#tts_foot2)</sup><sup>[3](#tts_foot3)</sup> for use with [Google Assistant Webserver](https://community.home-assistant.io/t/community-hass-io-add-on-google-assistant-webserver-broadcast-messages-without-interrupting-music/37274) or [Assistant Relay](https://github.com/greghesp/assistant-relay), `sonos`<sup>[2](#tts_foot2)</sup> for use with modified [sonos_say script](https://github.com/kalkih/mini-media-player/issues/86#issuecomment-465541825), `webos`<sup>[4](#tts_foot4)</sup>, `service`<sup>[5](#tts_foot5)</sup>.
| language | string | optional | The output language.
| entity_id | string/list | optional | The *entity_id* of the desired output entity or a list of *entity_id's*, can also be `all` to broadcast to all entities or `group` to target currently grouped speakers.
| volume | float | optional | Volume level of tts output (0 - 1), only supported by platform `sonos`.
| type | string | optional | `tts`, `announce` or `push`, defaults to `tts`, only supported by platform `alexa`, more info [here](https://github.com/custom-components/alexa_media_player/wiki/Configuration%3A-Notification-Component).
| data | object | optional | Any additional data to pass with the notify command.

<a name="tts_foot1"><sup>1</sup></a> Does not support the `language` option.

<a name="tts_foot2"><sup>2</sup></a> Does not support `language` & `entity_id` options.

<a name="tts_foot3"><sup>3</sup></a> Requires a custom notify service named `ga_broadcast`, see example below.

```yaml
# configuration.yaml
notify:
  - name: ga_broadcast
    platform: rest
    resource: http://[xxx.x.x.xxx]:5000/broadcast_message
```

<a name="tts_foot4"><sup>4</sup></a> Requires the card entity name to match the notify service name, if they don't match please specify the notify service name in the `entity_id` option.

<a name="tts_foot5"><sup>5</sup></a> Specify `service` & `service_data` under the `data` option, specify `message_field` to use `message` for the service.

```yaml
type: custom:mini-media-player
entity: media_player.xiaoai_speaker
tts:
  platform: service
  data:
    service: xiaomi_miot.intelligent_speaker
    service_data:
      execute: true
      silent: true
    message_field: text
```

#### Speaker group object
See [Speaker group management](#speaker-group-management) for example usage.

**Supported platforms**
- sonos
- soundtouch
- musiccast
- squeezebox<sup>[1](#speaker_foot1)</sup>
- bluesound<sup>[1](#speaker_foot1)</sup>
- snapcast<sup>[1](#speaker_foot1)</sup>
- linkplay<sup>[2](#speaker_foot2)</sup>
- media_player<sup>[3](#speaker_foot3)</sup>
- heos

| Name | Type | Default | Description |
|------|------|---------|-------------|
| entities | list | **required** | A list containing [speaker entities](#speaker-entity-object) of one of supported platforms, to enable group management of those speakers.
| platform | string | 'sonos' | Any supported multiroom platform e.g. `sonos`, `soundtouch`, `bluesound`, see **supported platforms** above.
| sync_volume | boolean | optional | Keep volume Synchronize between grouped speakers.
| expanded | boolean | optional | Make the speaker group list expanded by default.
| show_group_count | boolean | true | Have the number of grouped speakers displayed (if any) in the card name.
| icon | string | optional | Override default group button icon *(any mdi icon)*.
| group_mgmt_entity | string | optional | Override the player entity for the group management (Useful if you use a universal media_player as your entity but still want to use the grouping feature)
| supports_master | boolean | optional | Set to false if your multiroom system does not define one of the media players as master. Defaults to `true` and has not to be set to false for `squeezebox` for backward compatibility.

<a name="speaker_foot1"><sup>1</sup></a> All features are not yet supported.

<a name="speaker_foot2"><sup>2</sup></a> Requires [custom component](https://github.com/nagyrobi/home-assistant-custom-components-linkplay#multiroom) for sound devices based on Linkplay chipset, available in HACS.

<a name="speaker_foot3"><sup>3</sup></a> HomeAssistant added join/unjoin services to the media_player. Future official integrations will implement these services (which are slightly different from the ones, which are already supported by this card) instead of implementing them in their own domain.

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
| image | string | optional | A display image.
| cover | string | optional | A cover image (only supported for button shortcuts).
| type | string | **required** | Type of shortcut. A media type: `music`, `tvshow`, `video`, `episode`, `channel`, `playlist` e.g. or an action type: `source`, `sound_mode`, `script` or `service`.
| id | string | **required** | The media identifier. The format of this is component dependent. For example, you can provide URLs to Sonos & Cast but only a playlist ID to iTunes & Spotify. A source/(sound mode) name can also be specified to change source/(sound mode), use together with type `source`/`sound_mode`. If type `script` specify the script name here or `service` specify the `<domain>.<service>`.
| data | list | optional | Extra service payload<sup>[1](#shortcut_foot1)</sup>.

<a name="shortcut_foot1"><sup>1</sup></a> Only compatible with `script` & `service` shortcuts, useful for sending variables to script.

#### Action object options
| Name | Type | Default | Options | Description |
|------|:----:|:-------:|:-----------:|-------------|
| action | string | `more-info` | `more-info` / `navigate` / `call-service`  / `url` / `fire-dom-event` / `none` | Action to perform.
| entity | string |  | Any entity id | Override default entity of `more-info`, when  `action` is defined as `more-info`.
| service | string |  | Any service | Service to call (e.g. `media_player.toggle`) when `action` is defined as `call-service`.
| service_data | object |  | Any service data | Service data to include with the service call (e.g. `entity_id: media_player.office`).
| navigation_path | string |  | Any path | Path to navigate to (e.g. `/lovelace/0/`) when `action` is defined as `navigate`.
| url | string |  | Any URL | URL to open when `action` is defined as `url`.
| new_tab | boolean | `false` | `true` / `false` | Open URL in new tab when `action` is defined as `url`.
| haptic | string |  | `success`, `warning`, `failure`, `light`, `medium`, `heavy`, `selection` | Haptic feedback for the IOS app.

#### Hide object
| Name | Type | Default | Description |
|------|------|---------|-------------|
| name | boolean | false | The name.
| icon | boolean | false | The entity icon.
| info | boolean | false | The media information.
| power | boolean | false | The power button.
| source | boolean | false | The source select.
| sound_mode | boolean | true | The sound_mode select.
| group_button | boolean | false | The group button.
| controls | boolean | false | The media playback controls.
| prev | boolean | false | The "previous" playback control button.
| next | boolean | false | The "next" playback control button.
| play_pause | boolean | false | The play/pause button in media playback controls.
| play_stop | boolean | true | The play/stop button in media playback controls.
| jump | boolean | true | The jump backwards/forwards buttons (entity needs to support progress).
| volume | boolean | false | The volume controls.
| volume_level | boolean | true | The current volume level in percentage.
| mute | boolean | false | The mute button.
| progress | boolean | false | The progress bar.
| runtime | boolean | true | The media runtime indicators.
| runtime_remaining | boolean | true | The media remaining runtime (requires `runtime` option to be visible).
| artwork_border | boolean | true | The border of the `default` artwork picture.
| power_state | boolean | true | Dynamic color of the power button to indicate on/off.
| icon_state | boolean | true | Dynamic color of the entity icon to indicate entity state.
| shuffle | boolean | true | The shuffle button (only for players with `shuffle_set` support).
| repeat | boolean | true | The repeat button (only for players with `repeat_set` support).
| state_label | boolean | false | State labels such as `Unavailable` & `Idle`.


### Theme variables
The following variables are available and can be set in your theme to change the appearence of the card.
Can be specified by color name, hexadecimal, rgb, rgba, hsl, hsla, basically anything supported by CSS.

| name | Default | Description |
|------|---------|-------------|
| mini-media-player-base-color | var(--primary-text-color) & var(--paper-item-icon-color) | The color of base text & buttons
| mini-media-player-accent-color | var(--accent-color) | The accent color of UI elements
| mini-media-player-icon-color | --mini-media-player-base-color, var(--paper-item-icon-color, #44739e) | The color for icons
| mini-media-player-button-color | rgba(255,255,255,0.25) | The background color of shortcut and group buttons.
| mini-media-player-overlay-color | rgba(0,0,0,0.5) | The color of the background overlay
| mini-media-player-overlay-color-stop | 25% | The gradient stop of the background overlay
| mini-media-player-overlay-base-color | white | The color of base text, icons & buttons while artwork cover is present
| mini-media-player-overlay-accent-color | white | The accent color of UI elements while artwork cover is present
| mini-media-player-media-cover-info-color | white | Color of the media information text while artwork cover is present
| mini-media-player-background-opacity | 1 | Opacity of the background
| mini-media-player-artwork-opacity | 1 | Opacity of cover artwork
| mini-media-player-progress-height | 6px | Progressbar height
| mini-media-player-scale | 1 | Scale of the card
| mini-media-player-name-font-weight | 400 | Font weight of the entity name


### Example usage

#### Basic card
<img src="https://user-images.githubusercontent.com/457678/52081816-771c1b00-259b-11e9-8c1e-cfd93ac3e66d.png" width="500px" alt="Basic card example" />

```yaml
type: custom:mini-media-player
entity: media_player.kitchen_speakers
```

#### Compact card
Setting either `volume` and/or `controls` to `true` in the `hide` option object will render the player as a single row.

<img src="https://user-images.githubusercontent.com/457678/53042774-569efc80-3487-11e9-8242-03d388d40c34.png" width="500px" alt="Compact card example" />

```yaml
type: custom:mini-media-player
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
        id: spotify:user:XXXXXXX:playlist:37i9dQZF1DZ06evO2O09Hg # Where XXXXXXX is your User ID
      # Change the source to bathroom
      - icon: mdi:dog
        type: source
        id: Bathroom
      # Trigger script
      - icon: mdi:dog
        type: script
        id: script.script_name
      # Trigger custom service
      - name: Crooners Playlist
        type: service
        id: spotcast.start
        data:
          entity_id: media_player.googlehome1234
          uri: spotify:playlist:37i9dQZF1DX9XiAcF7t1s5

      ... # etc.
```
**Tip**:
If you don't have Sonos, but want just a bit more control over playlists and so, a simple solution is to use the `type: service`-option, to trigger the`spotcast.start`-service.

Remember to add the [required data](https://github.com/fondberg/spotcast#call-the-service), for spotcast to work. Also, kindly note that the [spotcast](https://github.com/fondberg/spotcast) custom component is required, for this to work. It's available in HACS.

#### Grouped cards
Set the `group` option to `true` when nesting mini media player cards inside other cards that already have margins/paddings.

<img src="https://user-images.githubusercontent.com/457678/52081831-800cec80-259b-11e9-9b35-63b23805c879.png" width="500px" alt="Grouped cards example" />

```yaml
type: entities
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
type: custom:mini-media-player
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
