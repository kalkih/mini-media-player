import { css } from 'lit-element';

const style = css`
  :host {
    overflow: visible !important;
    display: block;
    --mmp-accent-color: var(--mini-media-player-accent-color, var(--accent-color, #f39c12));
    --mmp-base-color: var(--mini-media-player-base-color, var(--primary-text-color, #000));
    --mmp-overlay-color: var(--mini-media-player-overlay-color, rgba(0,0,0,0.5));
    --mmp-overlay-base-color: var(--mini-media-player-overlay-base-color, #fff);
    --mmp-text-color: var(--mmp-base-color, --primary-text-color);
    --mmp-media-cover-info-color: var(--mini-media-player-media-cover-info-color, --mmp-text-color);
    --mmp-text-color-inverted: var(--disabled-text-color);
    --mmp-active-color: var(--mmp-accent-color);
    --mmp-icon-color: var(--mmp-base-color, var(--paper-item-icon-color, #44739e));
    --mmp-info-opacity: 1;
    --mdc-theme-primary: var(--mmp-text-color);
    --mdc-theme-on-primary: var(--mmp-text-color);
    --paper-checkbox-unchecked-color: var(--mmp-text-color);
    --paper-checkbox-label-color: var(--mmp-text-color);
    color: var(--mmp-text-color);
  }
  ha-card.--bg {
    --mmp-info-opacity: .75;
  }
  ha-card.--has-artwork[artwork*='cover'] {
    --mmp-text-color: var(--mmp-overlay-base-color);
    --mmp-text-color-inverted: #000;
    --mmp-active-color: rgba(255,255,255,.5);
    --mmp-icon-color: var(--mmp-text-color);
    --mmp-info-opacity: .75;
    --paper-slider-container-color: var(--mini-media-player-overlay-color, rgba(255,255,255,.75));
    --mdc-theme-primary: var(--mmp-text-color);
    --mdc-theme-on-primary: var(--mmp-text-color);
    --paper-checkbox-unchecked-color: var(--mmp-text-color);
    --paper-checkbox-label-color: var(--mmp-text-color);
    color: var(--mmp-text-color);
  }
  ha-card {
    cursor: default;
    display: flex;
    background: transparent;
    overflow: hidden;
    padding: 0;
    position: relative;
    color: inherit;
  }
  ha-card.--group {
    box-shadow: none;
  }
  ha-card.--more-info {
    cursor: pointer;
  }
  ha-card.--collapse {
    overflow: visible;
  }
  .mmp__bg, .mmp__player, .mmp__container {
    border-radius: var(--ha-card-border-radius, 0);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  .mmp__container {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: absolute;
    pointer-events: none;
  }
  ha-card:before {
    content: '';
    padding-top: 0px;
    transition: padding-top .5s cubic-bezier(.21,.61,.35,1);
    will-change: padding-top;
  }
  ha-card.--initial .entity__artwork,
  ha-card.--initial .entity__icon {
    animation-duration: .001s;
  }
  ha-card.--initial:before,
  ha-card.--initial .mmp-player {
    transition: none;
  }
  header {
    display: none;
  }
  ha-card[artwork='full-cover'].--has-artwork:before {
    padding-top: 56%;
  }
  ha-card[artwork='full-cover'].--has-artwork[content='music']:before,
  ha-card[artwork='full-cover-fit'].--has-artwork:before {
    padding-top: 100%;
  }
  .mmp__bg {
    background: var(--paper-card-background-color, white);
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    overflow: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  ha-card.--group .mmp__bg {
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
    background: var(--mmp-overlay-color);
    content: '';
  }
  ha-card[artwork*='full-cover'].--has-artwork .mmp-player {
    background: linear-gradient(to top, var(--mmp-overlay-color) 25%, transparent 100%);
    border-bottom-left-radius: var(--ha-card-border-radius, 0);
    border-bottom-right-radius: var(--ha-card-border-radius, 0);
  }
  ha-card.--has-artwork .cover,
  ha-card.--has-artwork[artwork='cover'] .cover:before,
  ha-card.--bg .cover {
    opacity: .999;
  }
  ha-card[artwork='default'] .cover {
    display: none;
  }
  ha-card.--bg .cover {
    display: block;
  }
  ha-card[artwork='full-cover-fit'].--has-artwork .cover {
    background-color: black;
    background-size: contain;
  }
  .mmp-player {
    align-self: flex-end;
    box-sizing: border-box;
    position: relative;
    padding: 16px;
    transition: padding .25s ease-out;
    width: 100%;
    will-change: padding;
  }
  ha-card.--group .mmp-player {
    padding: 2px 0;
  }
  .flex {
    display: flex;
    display: -ms-flexbox;
    display: -webkit-flex;
    flex-direction: row;
  }
  .mmp-player__core {
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
  ha-card.--rtl .entity__info {
    margin-left: auto;
    margin-right: 8px;
  }
  ha-card[content='movie'] .attr__media_season,
  ha-card[content='movie'] .attr__media_episode {
    display: none;
  }
  .entity__icon {
    color: var(--mmp-icon-color);
  }
  .entity__artwork, .entity__icon {
    animation: fade-in .25s ease-out;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 100%;
    height: 40px;
    width: 40px;
    min-width: 40px;
    line-height: 40px;
    margin-right: 8px;
    position: relative;
    text-align: center;
    will-change: border-color;
    transition: border-color .25s ease-out;
  }
  ha-card.--rtl .entity__artwork,
  ha-card.--rtl .entity__icon {
    margin-right: auto;
  }
  .entity__artwork[border] {
    border: 2px solid var(--primary-text-color);
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
  .entity__artwork[border][state='playing'] {
    border-color: var(--mmp-accent-color);
  }
  .entity__info__name,
  .entity__info__media[short] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .entity__info__name {
    line-height: 20px;
    color: var(--mmp-text-color);
  }
  .entity__info__media {
    color: var(--secondary-text-color);
    max-height: 6em;
    word-break: break-word;
    opacity: var(--mmp-info-opacity);
    transition: color .5s;
  }
  .entity__info__media[short] {
    max-height: 20px;
    overflow: hidden;
  }
  .attr__app_name {
    display: none;
  }
  .attr__app_name:first-child,
  .attr__app_name:first-of-type {
    display: inline;
  }
  .mmp-player__core[inactive] .entity__info__media {
    color: var(--mmp-text-color);
    max-width: 200px;
    opacity: .5;
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
  ha-card[artwork*='cover'].--has-artwork .entity__info__media,
  ha-card.--bg .entity__info__media {
    color: var(--mmp-media-cover-info-color);
  }
  .entity__info__media span:before {
    content: ' - ';
  }
  .entity__info__media span:first-of-type:before {
    content: '';
  }
  .entity__info__media span:empty {
    display: none;
  }
  .mmp-player__adds {
    margin-left: 48px;
    position: relative;
  }
  ha-card.--rtl .mmp-player__adds {
    margin-left: auto;
    margin-right: 48px;
  }
  .mmp-player__adds > *:nth-child(2) {
    margin-top: 0px;
  }
  mmp-powerstrip {
    flex: 1;
    justify-content: flex-end;
    margin-right: 0;
    margin-left: auto;
    width: auto;
    max-width: 100%;
  }
  mmp-media-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  ha-card.--flow mmp-powerstrip {
    justify-content: space-between;
    margin-left: auto;
  }
  ha-card.--flow.--rtl mmp-powerstrip {
    margin-right: auto;
  }
  ha-card.--flow .entity__info {
    display: none;
  }
  ha-card.--responsive .mmp-player__adds {
    margin-left: 0;
  }
  ha-card.--responsive.--rtl .mmp-player__adds {
    margin-right: 0;
  }
  ha-card.--responsive .mmp-player__adds > mmp-media-controls {
    padding: 0;
  }
  ha-card.--runtime .mmp-player {
    padding-bottom: calc(16px + 8px);
  }
  ha-card.--runtime.--group .mmp-player {
    padding-bottom: calc(16px + 8px);
  }
  .mmp-player div:empty {
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
`;

export default style;
