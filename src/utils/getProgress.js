export default (duration) => {
  let seconds = Math.abs(parseInt(duration % 60, 10));
  let minutes = Math.abs(parseInt((duration / 60) % 60, 10));
  let hours = Math.abs(parseInt((duration / (60 * 60)) % 24, 10));

  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  seconds = (seconds < 10) ? `0${seconds}` : seconds;

  return `${hours !== '00' ? `${hours}:` : ''}${minutes}:${seconds}`;
};
