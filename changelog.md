## v0.7
- Added: `show_source` option to display source and source select dropdown
- Added: `hide_power` option to hide power button
- Fixed: issue with `artwork: cover` displaying over optional card title

## v0.6
- Added: volume button option `volume_stateless`, useful for players without volume state information #3
- Added: `name` option to set/override the entities display name
- Fixed: `title` option now works again
- Fixed: issue with alignment of name when card is grouped and `artwork: cover` option is set #4
- Fixed: icon color when using default theme #4
- Changed media info text color to secondary text color

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
