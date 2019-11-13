import { css } from 'lit-element';

const sharedStyle = css`
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label {
    margin: 0 8px;
  }
  ha-icon {
    width: calc(var(--mmp-unit) * .6);
    height: calc(var(--mmp-unit) * .6);
  }
  paper-icon-button {
    width: var(--mmp-unit);
    height: var(--mmp-unit);
    color: var(--mmp-text-color);
    transition: color .25s;
  }
  paper-icon-button[color] {
    color: var(--mmp-accent-color) !important;
    opacity: 1 !important;
  }
  paper-icon-button[inactive] {
    opacity: .5;
  }
`;

export default sharedStyle;
