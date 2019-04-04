import { css } from 'lit-element';

const style = css`
  ha-card {
    --mmp-accent-color: var(--mini-media-player-accent-color, var(--accent-color, #f39c12));
    cursor: default;
    display: flex;
    background: transparent;
    overflow: hidden;
    padding: 0;
    position: relative;
  }
  ha-card[group] {
    box-shadow: none;
  }
  ha-card[more-info] {
    cursor: pointer;
  }
  ha-card[collapse] {
    overflow: visible;
  }
  ha-card:before {
    content: '';
    padding-top: 0px;
    transition: padding-top .5s cubic-bezier(.21,.61,.35,1);
    will-change: padding-top;
  }
  ha-card[initial] .entity__artwork,
  ha-card[initial] .entity__icon {
    animation-duration: .001s;
  }
  ha-card[initial]:before,
  ha-card[initial] .player {
    transition: none;
  }
  header {
    display: none;
  }
  mwc-button {
    --mdc-theme-primary: var(--primary-text-color);
  }
  mwc-button[raised] {
    --mdc-theme-on-primary: var(--primary-text-color);
    --mdc-theme-primary: transparent;
    background: rgba(255,255,255,.25);
  }
  mwc-button[dense] {
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0,0,0,.12);
  }
  ha-card[has-title] header {
    display: block;
    font-size: var(--paper-font-headline_-_font-size);
    font-weight: var(--paper-font-headline_-_font-weight);
    letter-spacing: var(--paper-font-headline_-_letter-spacing);
    line-height: var(--paper-font-headline_-_line-height);
    padding: 24px 16px 16px;
    position: relative;
  }
  ha-card[artwork='full-cover'][has-artwork]:before {
    padding-top: 56%;
  }
  ha-card[artwork='full-cover'][has-artwork][content='music']:before,
  ha-card[artwork='full-cover-fit'][has-artwork]:before {
    padding-top: 100%;
  }
  .bg {
    background: var(--paper-card-background-color, white);
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
  }
  ha-card[group] .bg {
    background: transparent;
  }
  .cover,
  .cover:before {
    display: block;
    opacity: 0;
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    transition: opacity .75s cubic-bezier(.21,.61,.35,1);
    will-change: opacity;
  }
  .cover {
    animation: fade-in .5s cubic-bezier(.21,.61,.35,1);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
  .cover:before {
    background: rgba(0,0,0,.5);
    content: '';
  }
  ha-card[artwork*='full-cover'][has-artwork] .player {
    background: rgba(0,0,0,.75);
    background: linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.5) 50%, transparent 100%);
  }
  ha-card[has-artwork] .cover,
  ha-card[has-artwork][artwork='cover'] .cover:before,
  ha-card[bg] .cover {
    opacity: .999;
  }
  ha-card[artwork='default'] .cover {
    display: none;
  }
  ha-card[bg] .cover {
    display: block;
  }
  ha-card[artwork='full-cover-fit'][has-artwork] .cover {
    background-color: black;
    background-size: contain;
  }
  .player {
    align-self: flex-end;
    box-sizing: border-box;
    position: relative;
    padding: 16px;
    transition: padding .25s ease-out;
    width: 100%;
    will-change: padding;
  }
  ha-card[group] .player {
    padding: 2px 0;
  }
  ha-card[has-title] .player {
    padding-top: 0;
  }
  ha-card[artwork*='cover'][has-artwork] paper-icon-button,
  ha-card[artwork*='cover'][has-artwork] ha-icon,
  ha-card[artwork*='cover'][has-artwork] .entity__info,
  ha-card[artwork*='cover'][has-artwork] .entity__info__name,
  ha-card[artwork*='cover'][has-artwork] mwc-button,
  ha-card[artwork*='cover'][has-artwork] header,
  ha-card[artwork*='cover'][has-artwork] .speaker-select > span,
  ha-card[artwork*='cover'][has-artwork] paper-menu-button mwc-button:focus iron-icon {
    color: #FFFFFF;
    border-color: #FFFFFF;
  }
  ha-card[artwork*='cover'][has-artwork] paper-slider {
    --paper-slider-container-color: rgba(255,255,255,.75);
  }
  ha-card[artwork*='cover'][has-artwork] mwc-button {
    --mdc-theme-primary: #FFFFFF;
    --mdc-theme-on-primary: #FFFFFF;
  }
  ha-card[artwork*='cover'][has-artwork] paper-input {
    --paper-input-container-focus-color: #FFFFFF;
  }
  ha-card[artwork*='cover'][has-artwork] paper-checkbox[disabled] {
    --paper-checkbox-checkmark-color: rgba(0,0,0,.5);
  }
  ha-card[artwork*='cover'][has-artwork] paper-checkbox {
    --paper-checkbox-unchecked-color: #FFFFFF;
    --paper-checkbox-label-color: #FFFFFF;
  }
  ha-card[artwork*='cover'][has-artwork] .media-buttons__button,
  ha-card[artwork*='cover'][has-artwork] .speaker-select__button {
    background-color: rgba(255,255,255,.25);
  }
  ha-card[artwork*='cover'][has-artwork] mwc-button[raised] {
    --mdc-theme-primary: transparent;
    --mdc-theme-on-primary: #FFFFFF;
  }
  ha-card[artwork*='cover'][has-artwork] paper-input {
    --paper-input-container-color: #FFFFFF;
    --paper-input-container-input-color: #FFFFFF;
  }
  .flex {
    display: flex;
    display: -ms-flexbox;
    display: -webkit-flex;
    flex-direction: row;
  }
  .justify {
    -webkit-justify-content: space-between;
    justify-content: space-between;
  }
  .hidden {
    display: none;
  }
  .entity {
    position: relative;
  }
  .entity__info {
    justify-content: center;
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    position: relative;
    overflow: hidden;
    user-select: none;
  }
  ha-card[rtl] .entity__info {
    margin-left: auto;
    margin-right: 8px;
  }
  .rows {
    margin-left: 56px;
    position: relative;
  }
  ha-card[rtl] .rows {
    margin-left: auto;
    margin-right: 56px;
  }
  .rows > *:nth-child(2) {
    margin-top: 0px;
  }
  .entity__info__media[short] {
    max-height: 20px;
    overflow: hidden;
  }
  ha-card[content='movie'] .attr__media_season,
  ha-card[content='movie'] .attr__media_episode {
    display: none;
  }
  .entity__icon {
    color: var(--paper-item-icon-color, #44739e);
  }
  .entity__artwork, .entity__icon {
    animation: fade-in .25s ease-out;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 100%;
    height: 40px;
    line-height: 40px;
    margin-right: 8px;
    min-width: 40px;
    position: relative;
    text-align: center;
    width: 40px;
    will-change: border-color;
    transition: border-color .25s ease-out;
  }
  ha-card[rtl] .entity__artwork, ha-card[rtl] .entity__icon {
    margin-right: auto;
    margin-left: 8px;
  }
  .entity__artwork[border] {
    border: 2px solid var(--primary-text-color);
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
  .entity__artwork[state='playing'] {
    border-color: var(--mmp-accent-color);
  }
  .entity__info__name,
  .entity__info__media[short],
  .source-menu__source,
  .media-dropdown__label,
  .media-label,
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .entity__info__name {
    line-height: 20px;
  }
  .control-row--top {
    line-height: 40px;
  }
  .entity[inactive] .entity__info__media,
  .entity__info__name,
  paper-icon-button,
  mwc-button {
    color: var(--primary-text-color);
    position: relative;
  }
  .entity__info__media {
    color: var(--secondary-text-color);
    max-height: 6em;
    word-break: break-word;
  }
  .attr__app_name {
    display: none;
  }
  .attr__app_name:first-child,
  .attr__app_name:first-of-type {
    display: inline;
  }
  .entity[inactive] .entity__info__media {
    opacity: .5;
  }
  .entity[inactive] .entity__info__media {
    max-width: 200px;
  }
  .entity__info__media[short-scroll] {
    max-height: 20px;
    white-space: nowrap;
  }
  .entity__info__media[scroll] > span {
    visibility: hidden;
  }
  .entity__info__media[scroll] > div {
    animation: move linear infinite;
  }
  .entity__info__media[scroll] .marquee {
    animation: slide linear infinite;
  }
  .entity__info__media[scroll] .marquee,
  .entity__info__media[scroll] > div {
    animation-duration: inherit;
    visibility: visible;
  }
  .entity__info__media[scroll] {
    animation-duration: 10s;
    mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
  }
  .marquee {
    visibility: hidden;
    position: absolute;
    white-space: nowrap;
  }
  paper-icon-button[color],
  ha-icon[color] {
    color: var(--mmp-accent-color) !important;
  }
  ha-card[artwork*='cover'][has-artwork] .entity__info__media {
    color: var(--mini-media-player-media-cover-info-color, #FFFFFF);
    opacity: .85;
  }
  paper-icon-button {
    transition: color .15s ease-in-out;
    will-change: color;
  }
  .entity__info__media span:before {
    content: ' - ';
  }
  .entity__info__media span:first-of-type:before {
    content: '';
  }
  .entity__info__media span:empty,
  .source-menu span:empty {
    display: none;
  }
  .tts {
    align-items: center;
    margin-top: 8px;
  }
  .tts__input {
    cursor: text;
    flex: 1;
    margin-right: 8px;
    --paper-input-container-input: {
      font-size: 1em;
    };
  }
  ha-card[rtl] .tts__input {
    margin-right: auto;
    margin-left: 8px;
  }
  .tts__button {
    margin: 0;
    padding: .4em;
  }
  .media-dropdown {
    box-sizing: border-box;
    width: 100%;
    padding: 8px 8px 0 0;
  }
  .media-dropdown__button {
    display: flex;
    font-size: 1em;
    justify-content: space-between;
    margin: 0;
    border-bottom: 1px solid var(--primary-text-color);
    opacity: .8;
  }
  .media-dropdown__button > div {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
  }
  .media-dropdown__label {
    padding: .2em .2em .2em 0;
    text-align: left;
    text-transform: none;
  }
  .media-dropdown__icon {
    height: 24px;
    width: 24px;
  }
  .media-buttons {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .media-buttons__button {
    background-color: rgba(255,255,255,.1);
    box-sizing: border-box;
    margin: 8px 8px 0 0;
    min-width: 0;
    min-width: calc(50% - 8px);
    flex: 1;
    overflow: hidden;
  }
  .media-buttons__button[columns='0'] {
    min-width: calc(100% - 8px);
  }
  .media-buttons__button[columns='3'] {
    min-width: calc(33.33% - 8px);
  }
  .media-buttons__button[columns='4'] {
    min-width: calc(25% - 8px);
  }
  .media-buttons__button > span {
    line-height: 24px;
    text-transform: initial;
  }
  .media-buttons__button > *:nth-child(2),
  .media-dropdown paper-item > *:nth-child(2) {
    margin-left: 4px;
  }
  ha-card[rtl] .media-buttons__button > *:nth-child(2),
  ha-card[rtl] .media-dropdown paper-item > *:nth-child(2) {
    margin-left: auto;
    margin-right: 4px;
  }
  .control-row--top .vol-control {
    max-width: 200px;
  }
  .control-row--top {
    flex: 1;
    justify-content: flex-end;
    margin-right: 0;
    margin-left: auto;
    width: auto;
    max-width: 100%;
  }
  ha-card[rtl] .control-row--top {
    margin-right: auto;
    margin-left: 0;
  }
  .control-row--top ha-slider {
    flex: 1;
    height: 40px;
    line-height: initial;
  }
  .control-row {
    flex-wrap: wrap;
    justify-content: center;
  }
  .control-row > .flex {
    flex: 1;
    justify-content: space-between;
  }
  .control-row > .shuffle {
    flex: 3;
    flex-shrink: 200;
    justify-content: center;
  }
  .control-row > .vol-control {
    flex: 100;
  }
  .vol-control {
    flex: 1;
    max-height: 40px;
  }
  .group-button {
    height: 85%;
    margin: auto;
  }
  .speaker-select {
    display: flex;
    flex-direction: column;
  }
  .speaker-select > span {
    font-weight: 500;
    margin-top: 12px;
    text-transform: uppercase;
  }
  .speaker-select paper-checkbox {
    padding: 8px 0;
  }
  .speaker-select .buttons {
    display: flex;
  }
  .speaker-select__button {
    background-color: rgba(255,255,255,.1);
    margin: 8px 8px 0 0;
    min-width: 0;
    text-transform: uppercase;
    text-align: center;
    width: 50%;
  }
  .speaker-select > paper-checkbox > span {
    font-weight: 600;
  }
  ha-slider {
    max-width: none;
    min-width: 100px;
    width: 100%;
  }
  paper-input {
    opacity: .75;
    --paper-input-container-color: var(--primary-text-color);
    --paper-input-container-focus-color: var(--primary-text-color);
    --paper-input-container: {
      padding: 0;
    };
  }
  .source-menu {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 20px;
    padding: 0;
  }
  paper-menu-button[focused] mwc-button > iron-icon,
  paper-menu-button[focused] mwc-button > div > iron-icon,
  paper-menu-button[focused] paper-icon-button,
  ha-card[artwork*='cover'][has-artwork] paper-menu-button[focused] paper-icon-button {
    color: var(--mmp-accent-color);
    transform: rotate(180deg);
  }
  paper-menu-button mwc-button:focus iron-icon,
  paper-menu-button mwc-button:focus > div iron-icon,
  paper-menu-button mwc-button[focused] iron-icon,
  paper-menu-button[focused] paper-icon-button[focused],
  ha-card[artwork*='cover'][has-artwork] paper-menu-button[focused] paper-icon-button[focused] {
    color: var(--primary-text-color);
    transform: rotate(0deg);
  }
  ha-card[has-artwork][artwork*='cover'] paper-menu-button[focused] paper-icon-button[focused] {
    color: #FFFFFF;
  }
  .source-menu__button {
    height: 36px;
    line-height: 20px;
    margin: 0;
    min-width: 0;
  }
  .source-menu__source {
    display: block;
    max-width: 60px;
    position: relative;
    width: auto;
    text-transform: initial;
  }
  .source-menu__source[display="icon"] {
    display: none;
  }
  .source-menu__source[display="full"] {
    max-width: none;
  }
  .progress {
    height: 12px;
    cursor: pointer;
    left: 0; right: 0; bottom: 0;
    position: absolute;
  }
  ha-card[group][collapse] .progress {
    bottom: -2px;
    height: 5px;
  }
  ha-card[group] paper-progress {
    height: var(--paper-progress-height, 2px);
  }
  paper-progress {
    height: var(--paper-progress-height, 4px);
    bottom: 0;
    position: absolute;
    width: 100%;
    --paper-progress-active-color: var(--mmp-accent-color);
    --paper-progress-container-color: rgba(100,100,100,.15);
    --paper-progress-transition-duration: 1s;
    --paper-progress-transition-timing-function: linear;
    --paper-progress-transition-delay: 0s;
  }
  ha-card[state='paused'] paper-progress {
    --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
  }
  .label {
    margin: 0 8px;
  }
  .media-dropdown[focused] mwc-button,
  paper-icon-button[color][opaque],
  paper-input[focused] {
    opacity: 1;
  }
  .media-dropdown[focused] mwc-button:focus {
    opacity: .75;
  }
  paper-icon-button[opaque],
  .speaker-select mwc-button[disabled] {
    opacity: .5;
  }
  ha-card[flow] .control-row--top {
    justify-content: space-between;
  }
  ha-card[flow] .power-row {
    margin-left: auto;
  }
  ha-card[flow][rtl] .power-row {
    margin-right: auto;
  }
  ha-card[flow] .entity__info {
    display: none;
  }
  ha-card[flow] ha-slider,
  ha-card[flow] .vol-control {
    width: 100%;
    max-width: none;
  }
  ha-card[break*="break"] .rows {
    margin-left: 0;
  }
  ha-card[break*="break"][rtl] .rows {
    margin-right: 0;
  }
  ha-card[break*="break"] .rows > * {
    padding-left: 8px;
  }
  ha-card[break*="break"][rtl] .rows > * {
    padding-right: 8px;
  }
  ha-card[break*="break"] .rows > .control-row {
    padding: 0;
  }
  ha-card[break*="break"] .media-dropdown__button {
    padding-right: 0;
  }
  ha-card[break*="break"][rtl] .media-dropdown__button {
    padding-left: 0;
  }
  .player div:empty,
  ha-card[break="break-width"] .source-menu__source,
  .entity[inactive] .source-menu__source {
    display: none;
  }
  @keyframes slide {
    100% { transform: translateX(-100%); }
  }
  @keyframes move {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .media-controls {
    direction: ltr;
  }`;

export default style;
