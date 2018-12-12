## v0.9.7
- Fixed: card will now grow taller instead of clipping content if more space is needed when using `artwork: full-cover`
- Fixed: height issue while using `group` option

## v0.9.6
- Added: `sonos_grouping` option for Sonos group management
- Added: showing `app_name` if no other media information is available #38
- Changed: artwork images renders in base64, should result in faster rendering
- Fixed: improvements to artwork logic, should result in smoother transitions
- Fixed: `artwork: full-cover` now displays *"non music"* artwork in a 16:9 aspect ratio
- Fixed: paper slider pin now displays correctly even in collapsed view

  <img src="https://user-images.githubusercontent.com/457678/49844296-a778e180-fdc2-11e8-911f-97533b680605.gif" width="500px" alt="V0.9.6 example 1">

## v0.9.5
- Added: `media_list` option to display a dropdown list with items to quickly play specified media
- Added: `media_buttons` option to display buttons to quickly play specified media
- Added: `full-cover-fit` option parameter for the `artwork` option, this option does not crop/zoom the artwork like `full-cover` #36
- Added: tts support for the "Alexa as Media Player" custom_component #37 (@Rocka84)
- Changed: removed animations on initial page load
- Fixed: less re-rendering -> better performance
- Fixed: made card background transparent if `group: true` is set
- Fixed: setting `hide_info` to `true` now make the cards content fill the entire width
- Fixed: text labels not cutting off when no space is available

  <img src="https://user-images.githubusercontent.com/457678/49184546-f9038400-f35f-11e8-979d-2a8d745229e2.png" width="500px" alt="V0.9.5 example 1">

  <img src="https://user-images.githubusercontent.com/457678/49185197-97441980-f361-11e8-988c-07ade1d128ae.png" width="500px" alt="V0.9.5 example 2">

## v0.9.4
- Fixed: card not resizing properly in some browsers #33

## v0.9.3
- Added: `artwork: full-cover` option to display the full artwork #31
- Added: `idle_view` option to render an alternate view while player state is `idle`
- Fixed: issue where power button color would not display correctly in idle view and `power_color` enabled
- Fixed: responsive design improvements #30

## v0.9.2
- Changed: volume button icons, to not confuse with mute #26
- Changed: adjusted scroll speed for *(scroll_info)*
- Fixed: improved browser compatibility by removing object spread syntax #25 #27
- Fixed: alignment of shuffle button while `volume_stateless` set to `true`
- Fixed: alignment of source button in HA > 0.81.6

## v0.9.1
- Added: hide_media_info option #23
- Added: consider_pause_idle option, to render the player idle while it's paused
- Added: parameter `full` for `show_source`, to display full source name
- Added: *(scroll_info)* dynamic scroll speed, based on media information length
- Changed: made shuffle button slightly larger
- Fixed: alignment issue when `group` was set to true and artwork cover was present

## v0.9.0
- Added: bundle version, to avoid externally loaded dependency #21
- Updated: instructions to include bundle instead of source #21
- Updated: tracker.json with bundle version #21

## v0.8.9
- Added: `toggle_power` option, to be able to change power button behaviour

- Added: `show_shuffle` option, to display a shuffle button

  <img src="https://user-images.githubusercontent.com/457678/47924787-ddba6b80-debc-11e8-9398-602fc80cc230.png" width="500" alt="v0.8.9 example 1" />

- Added: `consider_idle_after` option, to display player as idle after x amount of time

  <img src="https://user-images.githubusercontent.com/457678/47925288-1c045a80-debe-11e8-8178-1bab32c9773e.gif" width="500" alt="v0.8.9 example 2" />

- Fixed: error when sending tts message after v0.8.8 update
- Removed: cleaned up redundant code

## v0.8.8
- Added: `hide_icon` option to optionally hide the entity icon
- Added: ellipsis instead of clipping the entity name if text overflows
- Added: fade in/out effect for media info text when `scroll_info` is enabled
- Added: various minimalistic transitions
- Fixed: made ellipsis for media info or entity name text overflow work in more browsers
- Fixed: Improved responsive design for small screens
- Fixed: minor alignment issue of the mute button while using `hide_controls`
- Removed: source select dropdown animation

  <img src="https://user-images.githubusercontent.com/457678/47514724-61eb6e00-d881-11e8-88ce-94a8f0a3b540.gif" width="500" alt="v0.8.8 example 1" />

  <img src="https://user-images.githubusercontent.com/457678/47515109-4339a700-d882-11e8-99e5-1bc9931c796a.png" width="500" alt="v0.8.8 example 2" />


## v0.8.7
- Fixed: unexpected syntax error #18

## v0.8.6
- Added: `artwork:` `none` option, to not show artwork
- Added: `background` option to set a custom background image

## v0.8.5
- Fixed: Prev/Play/Next buttons misaligned with certain configs #16

## v0.8.4
- Added: `hide_info` option to optionally hide entity icon, entity name & media information #15

  <img src="https://user-images.githubusercontent.com/5662298/46736241-d4acf480-cc98-11e8-9332-e27bd931e306.png" width="500" alt="v0.8.4 example 1" />

- Fixed: issue where volume slider would send double `volume_set` commands on change and glitch back
- Updated: lit-element dependency to 0.6.2

## v0.8.3
- Added: `show_progress` option to show a progress bar when media progress information is available
- Added: support to display media_series_title, media_season & media_episode information when available #13

  <img src="https://user-images.githubusercontent.com/457678/46318413-abc09b80-c5d6-11e8-8892-724b93d0c06d.gif" width="500" alt="v0.8 example 1" />

  <img src="https://user-images.githubusercontent.com/457678/46318419-b11de600-c5d6-11e8-9327-eea239e9db7c.png" width="500" alt="v0.8 example 2" />

## v0.8.2
- Added: `max_volume` option to set a max volume value (between 1 & 100) for the volume slider #12
- Added: `tracker.json` file for custom_updater support #7
- Fixed: issue where text would wrap outside the card

## v0.8.1
- Added: parameter `small` for `show_source`. Hides the current source name and only displays the source button
- Added: `hide_mute` option to hide the mute button
- Changed: `hide_controls: true` does not hide the mute button by default, use new `hide_mute` option
- Changed: switched place of the media controls with source in the UI when `hide_volume` & `show_source` is enabled, for more consistency
- Fixed: TTS not working after v0.8
- Fixed: UI will now shrinks more to fit (instead of overflow) when no more horizontal space is available

  <img src="https://user-images.githubusercontent.com/457678/46220899-dc40d500-c34b-11e8-927d-ee9e8b1ee85f.png" width="500" alt="v0.8 example 1" />

## v0.8
- Added: `hide_controls` option to hide media control buttons #6
- Added: `hide_volume` option to hide volume control #6 & #8
- Added: `short_info` option to limit the media information to one line
- Added: `scroll_info` option to limit the media information to one line and scroll through potential overflowing text
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
- Added: check before rende2r to only render if necessary
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
