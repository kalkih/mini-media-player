## v0.8
- Added: `hide_controls` option to hide media control buttons #6
- Added: `hide_volume` option to hide volume control #6 & #8
- Added: `short_info` option to limit the media information to one line
- Added: `scroll_info` option to limit the media information to one line and scroll through potential overflowing text.
- Changed: source select dropdown button changed from icon to source text + icon to make it easier to click.
- Fixed: source select dropdown no longer expands outside of the screen area
- Fixed: elements like title and source becoming hard to see with `artwork: cover` and dark backgrounds.
- Fixed: wrong url in readme #9

   <img src="https://user-images.githubusercontent.com/457678/46086928-80d6e180-c1a9-11e8-8bbf-5105bd5ae640.gif" width="500" alt="v0.8 example 1" />

   <img src="https://user-images.githubusercontent.com/457678/46086935-846a6880-c1a9-11e8-9fa9-68097dd50980.png" width="500" alt="v0.8 example 2" />

    <img src="https://user-images.githubusercontent.com/457678/46087158-078bbe80-c1aa-11e8-97e3-7d35b58375b3.png" width="500" alt="v0.8 example 3" />

## v0.7
- Added: `show_source` option to display source and source select dropdown
- Added: `hide_power` option to hide power button
- Added: check before render to only render if necessary
- Changed: previous and next buttons to the proper ones `mdi:forward` & `mdi:backward` to `mdi:next` & `mdi:previous`
- Fixed: issue with `artwork: cover` displaying over optional card title

## v0.6
- Added: volume button option `volume_stateless`, useful for players without volume state information #3
- Added: `name` option to set/override the entities display name
- Fixed: `title` option now works again
- Fixed: issue with alignment of name when card is grouped and `artwork: cover` option is set #4
- Fixed: icon color when using default theme #4
- Changed: media info text color to secondary text color

## v0.5
- Fixed browser incompatibility
- Fixed black buttons on black artwork cover -> white buttons
- Implemented lit-html for quicker re-rendering.

## v0.4.1
- Fixed bug where attributes did not update when device state changed to `off` or `unavailable`

## v0.4
- Major code rewrite with much improved rendering performance

- Added new `artwork` option **cover** to display artwork as the cards background image

- Added new option `power_color` for colored on/off button depending on power state

- Added translation for unavailable string

- Fixed bug with Text-To-Speech not working

- Fixed duplicate top padding when `title` option was set

  <img src="https://user-images.githubusercontent.com/457678/45644999-7f2d5f80-babf-11e8-816c-c97c70581b28.png" width="400" alt="v0.4 example" />

## v0.3
- Added new option `artwork_border` to show a border around the artwork, border color changes depending on players state
- Added translation support
- Text-To-Speech input placeholder is now translated to the language of your Home Assistant instance
- Minor style changes, Text-To-Speech input is now slightly transparent while not focused

## v0.2
- Added support to show Text-To-Speech input with the `show_tts` option

## v0.1
- Initial release
