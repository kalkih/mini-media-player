## v1.7.0
### ADDED
- Support for Soundtouch multiroom (#165)

### FIXED
- Removed usage of deprecated thumbnail/artwork api endpoint #244 (#253)
- Fixed button theme variable not sticking to speaker group buttons


## v1.6.0
### ADDED
- Allow master speaker to leave speaker group #213
- New theme variable for raised buttons #212
- New theme variable for name font weight

### CHANGED
- Increased font weight of buttons

### FIXED
- Broken leave button for group management
- Disabled buttons are now properly disabled


## v1.5.2
### ADDED
- New icon state option, change entity icon color depending on state, disabled by default, see `icon_state` in `hide` option #186 #144

### CHANGED
- Reduced card paddings when using group option #210

### FIXED
- Broken dropdown menus in latest iOS #207

## v1.5.1
### ADDED
- Dynamic alignment of dropdown lists (#201)

### FIXED
- Broken dropdown lists (#201)
- Invisible icons (maybe?)

## v1.5.0
### ADDED
- Option to display image in shortcut #146 (#192) - (@tcarlsen)
- Tap action option #174 (#191) - (@darkkatarsis)
- Option for card UI scale #156 (#187)
- Theme variable for card UI scale #156 (#187)
- Theme variable for card background opacity #189
- Shortcut example with service call (#196) - (@exetico)

### FIXED
- Source dropdown not updating with backend #184
- Invalid icon color
- Clipped/Cut off volume pin #185

## v1.4.2
### ADDED
- Optional stop / play_stop button #167 (#177) - (@guillaumelamirand)
- Theme variable for linear color stop in `full-cover` mode (#178) - (@guillaumelamirand)

### FIXED
- Fixed responsive spacing of media controls
- Prevent the extra card padding when there's no progressbar present
- Fixed overflowing artwork

## v1.4.1
### FIXED
- Fixed invalid progress bar seek position in multi column card setups

## v1.4.0
### ADDED
- Drag/swipe support on the progress bar to make fine adjustments easier.
- New progress bar height theme variable `mini-media-player-progress-height`
- Increased max columns of shortcut buttons to `6` (from `5`) (#163)

### CHANGED
- Changed progress bar height to `6px`, and `4px` with group option (from `4px`)
- Increased top/bottom card padding with group option to `10px`
- Progress bar will now move isntantly to the new position on user seek, instead of 1 sec of animation

### FIXED
- Misplaced volume knob text in certain configurations (#166)

## v1.3.1
### FIXED
- Duplicate controls with certain card configurations (#169)

## v1.3.0
### ADDED
- New independent icon color theme variable (#142)
- New theme variable to adjust artwork opacity
- New option to change speaker group button icon (#150)
- Speaker group management/multiroom support for Snapcast & Bluesound platforms (#161) (@lyghtnox)

### CHANGED
- Allow dropdown text for source/sound mode if both controls and volume is hidden (#149) (#152) (@bernimoses)

### FIXED
- Overlapping progress-bar (#143)
- No longer sending `entity_id` parameter by default with shortcut service calls (#164)

## v1.2.2
### CHANGED
- Adjusted tts text input color
- Adjustements to active button color

### FIXED
- Fixed invisible progress bars (#138)
- Preserve state-icon color on entity icon unless overridden

## v1.2.1
### ADDED
- New base-color (`mini-media-player-base-color`) theme variable (#130)
- New overlay-accent-color (`mini-media-player-overlay-accent-color`) theme variable (#118)
- New `align_text` option to shortcuts object, to specify alignment of button content (text/icon) (#87)
- Added support for `webos` notify as tts platform (#136)

### CHANGED
- Updated HACS readme

### FIXED
- Fixed `Cannot convert undefined` errors (#127)
- Updated README with new default google tts name (#134) (@ngreis)
- Prevent cut off volume pin when used in entities card (#131)
- Respecting ha-card-background theme variable (if set)
- Fixed alignment of playback buttons if limited card space

## v1.2.0
### ADDED
- Added support for service calls through shortcuts (#121)
- Added column height option to shortcuts object (#129)
- Added the option parameter `5` to shortcuts column option
- Added documentation for use with [HACS](https://github.com/custom-components/hacs)

### CHANGED
- Changed button component

### FIXED
- Fixed runtime misplacement (#119)
- Fixed shortcuts not hiding properly
- Fixed controls not hiding propertly if config changed in runtime
- Fixed repeat popup-card issue (#122) (@iantrich)

## v1.1.3
Sonos group management is now compatible with HA > 0.93.
Sonos group management is no longer compatible with HA < 0.93.

### BREAKING CHANGES
- Adopted the [new](https://www.home-assistant.io/blog/2019/05/16/release-93/#sonos) Sonos join/unjoin service calls ([home-assistant#23670](https://github.com/home-assistant/home-assistant/pull/23670))

### ADDED
- New `mini-media-player-overlay-color` theme variable, artwork cover overlay color (#118)
- New `mini-media-player-overlay-base-color` theme variable, artwork cover base UI color (#118)

### CHANGED
- Adjusted clickable/touchable seek area of the progress bar

### FIXED
- Fixed progress bar and full-cover artwork incompatibility
- Added guard if hass is undefined

## v1.1.2
### ADDED
- Sound mode select, similar to source select (only for devices with support for sound_mode)
- Optional progress/runtime indicators
- New `min_volume` option (#116)
- New `sound_mode` option, to change the appearance of sound select
- New `sound_mode` option in `hide` option object, to set visibility of the sound_menu, hidden by default
- New `runtime` option in `hide` option object, to set visibility of the runtime indicators, hidden by default

### FIXED
- Fixed background not displaying (#115)
- Fixed alignment and button spacing of power button & media controls when (icon, name & info) are all hidden

## v1.1.1
### FIXED
- Incorrect spacing between media buttons
- Incorrect spacing between volume buttons (#114)
- Border-radius not applying when card was collapsed
- Icon colors not changing correctly with icon state

## v1.1.0
### ADDED
- New option `attribute` for shortcut object, to determine & display active/selected shortcut from an attribute, see [README](https://github.com/kalkih/mini-media-player#shortcuts-object)
- New option `label` for shortcuts object, specify a custom shortcut list dropdown label
- New parameter `sound_mode` for shortcut type option
- New option `data` for shortcut object, specify extra service data (useful for script variables)

### FIXED
- Various layout & alignment fixes

### CHANGED
- Shortcut list dropdown is now aligned to the right (instead of left)
- Removed the underline from the shortcut dropdown
- Changed default shortcut list dropdown label from `Select Media...` to `Shortcuts...`
- Mute button is now only visible if supported by the media player, `replace_mute` option will override this and can still be utilized
- Major refactoring of the source code

### REMOVED
- `icon_state` option
- `title` option (wasn't really working anyways 🤷‍)

## v1.0.4
### ADDED
- Added new option `type` for the `tts` object, type of tts method, only for alexa atm (#99)
- Option `speaker_group` replaces `sonos` option (#102) @hcoohb
- Option `platform` in the `speaker_group` option object (#102) @hcoohb
- Speaker group management support for the *yamaha_musiccast* platform (#102) @hcoohb

### FIXED
- `volume_offset` not working as expected (#88)
- RTL layout (#103) @yosilevy
- Got rid of jerky UI movement after initial render
- Missaligned speaker group button

### CHANGED
- Removed max width limit of the volume slider in normal view
- Removed slight opacity of media info text while cover artwork is present
- TTS service method for custom alexa component (old method is getting [deprecated](https://github.com/keatontaylor/alexa_media_player/wiki#text-to-speech)) (#96)
- Updated dependencies

### DEPRECATED
- Deprecating `sonos` option replaced by `speaker_group` option (#102) @hcoohb

## v1.0.3
- NEW: Option `volume_offset` for sonos entity object for use with synced volume (#88)
- NEW: Icon for speaker group button (#92)
- NEW: TTS Support for modified sonos_say script (#86)
- CHANGE: Volume slider color when cover artwork is present
- FIXED: Shortcut list throwing errors
- FIXED: Shortcut list dropdown button design for new mwc-button
- FIXED: Minor flaws with scrolling media info (#93)
- FIXED: Prevent unsupported tts parameters from being sent to alexa_tts (would cause errors in backend)

## v1.0.2
- NEW: Added two theme variables
- NEW: Option `columns` for shortcut buttons, to specify max amount of buttons per row (#78)
- FIXED: Buttons to work with HA > v0.88.0 (#82)
- CHANGE: Removed enforced uppercase for shortcut buttons (#74)
- CHANGE: Changed color of media info when `artwork` is set to `cover` / `full-cover`

## v1.0.1
- NEW: Support for Standby state in idle view, see `idle_view` -> `when_standby` (#73)
- NEW: Option `icon_state`, change icon color depending on entity state (#77)
- NEW: Shortcut items can now trigger scripts (#76)
- NEW: TTS Support for hass.io addon: Google Assistant Webserver and similar solutions
- CHANGE: Artwork border is now hidden by default
- FIXED: Sonos `sync_volume` not working as expected (#72)
- FIXED: Progress not visible with `group` option and not collapsed (#71)
- FIXED: Hide season and episode information if current media is a movie
- UPDATE: LitElement dependency to v2.0.1

## v1.0.0
- NEW: Ability to seek through media by pressing on the progress bar
- NEW: Option `hide` (#50)
- NEW: `source`, `name`, `progress`, `artwork_border`, `power_state` `mute` & `shuffle` parameters to `hide` option object (#50)
- NEW: Option `shortcuts`, replaces `media_list` & `media_buttons`
- NEW: Ability to switch source through `shortcuts` list/buttons (#47)
- NEW: Option `hide_when_off` added to the `shortcuts` option to specify visibility when entity is off (#49)
- NEW: Option `source` to modify how source & source select is displayed
- NEW: Option `info` to modify how media info is displayed (#51)
- NEW: Option `tts` (#61) (@Devqon)
- NEW: Two optional TTS options `language` & `entity_id` options for TTS (#61) (@Devqon)
- NEW: Option `sync_volume` option to `sonos` object to sync volume across grouped Sonos speakers (#48)
- NEW: Option `show_group_count` added to `sonos` option object to display the number of grouped speakers (if any) in the name
- NEW: Option `expanded` to `sonos` option object to specify default state of the list
- CHANGE: Responsive design breakpoint changed from 350px to 390px
- CHANGE: Improved responsive design
- CHANGE: Icons inside `shortcuts` list items & buttons is now displayed to the left
- CHANGE: Progress bar background color is now slightly more transparent
- CHANGE: Source & source select is now visible by default (if supported & available)
- CHANGE: Progress bar is now visible by default (if supported & available)
- CHANGE: Artwork border is now visible by default
- CHANGE: Renamed and reworked `sonos_grouping` option to `sonos` **(BREAKING CHANGE)**
- CHANGE: The `idle_view` option now takes an object **(BREAKING CHANGE)**
- FIXED: Progress bar layout when used with group option (#56)
- FIXED: Issue where `consider_idle_after` (now `idle_view` -> `after`) option would not always work properly
- FIXED: Inconsistent height of card while using group option and artwork cover (#54)
- REMOVED: The following options were removed `hide_info`, `hide_power`, `hide_icon`, `hide_media_info`, `hide_volume`, `hide_controls` & `hide_mute` options (#50) **(BREAKING CHANGE)**
- REMOVED: `consider_idle_after` & `consider_pause_idle` options were removed, see new `idle_view` option **(BREAKING CHANGE)**
- REMOVED: `artwork_border` option, see new `hide` option **(BREAKING CHANGE)**
- REMOVED: `power_color` option, see new `hide` option **(BREAKING CHANGE)**
- REMOVED: `show_source` option, see new `hide` & `source` option (#50) **(BREAKING CHANGE)**
- REMOVED: `show_progress` option, see new `hide` option (#50) **(BREAKING CHANGE)**
- REMOVED: `show_shuffle` option, see new `hide` option (#50) **(BREAKING CHANGE)**
- REMOVED: `show_tts` option, see new `tts` option **(BREAKING CHANGE)**
- REMOVED: `media_list` & `media_buttons` options were removed, see new `shortcuts` option **(BREAKING CHANGE)**
- REMOVED: `scroll_info` & `short_info` options were removed, see new `info` option (#51) **(BREAKING CHANGE)**
- REMOVED: Ability to run the source directly was removed, if you haven't migrated to the built bundle yet, it's time to do it now **(BREAKING CHANGE)**

## v0.9.8
- Added: `replace_mute` option #43
- Added: `icon` option to media object (media buttons/list)
- Changed: made `name` option for media object (media buttons/list) optional
- Changed: renamed media item object `url` option to `id` (you can still use url for now)
- Changed: new shuffle icon style
- Fixed: `more_info` not working when using card inside entities card #44
- Fixed: animation improvements
- Fixed: cleaned up & removed redundant code
- Fixed: bumped dependencies

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
