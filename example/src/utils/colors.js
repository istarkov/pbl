// ----------------------------------------------------------------
// MIT Licence, Copyright (c) 2016 Zeit, Inc.
// ----------------------------------------------------------------

const colorList = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'lightBlack',
  'lightRed',
  'lightGreen',
  'lightYellow',
  'lightBlue',
  'lightMagenta',
  'lightCyan',
  'lightWhite',
  'colorCubes',
  'grayscale',
];

export default function getColorList(colors) {
  // For backwards compatibility, return early if it's already an array
  if (Array.isArray(colors)) {
    return colors;
  }

  return colorList.map(colorName => colors[colorName]);
}
