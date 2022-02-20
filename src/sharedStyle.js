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
  mmp-icon-button {
    width: var(--mmp-unit);
    height: var(--mmp-unit);
    color: var(--mmp-text-color, var(--primary-text-color));
    transition: color .25s;
  }
  mmp-icon-button[color] {
    color: var(--mmp-accent-color, var(--accent-color)) !important;
    opacity: 1 !important;
  }
  mmp-icon-button[inactive] {
    opacity: .5;
  }
  mmp-icon-button ha-icon {
    display: flex;
  }
`;

export default sharedStyle;
