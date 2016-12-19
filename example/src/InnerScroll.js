import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import innerScrollStyles from './innerScroll.sass';

export const innerScroll = ({ theme }) => (
  <div className={theme.overflow}>
    <div className={theme.block}>1</div>
    <div className={theme.block}>2</div>
    <div className={theme.block}>3</div>
    <div className={theme.block}>4</div>
    <div className={theme.block}>5</div>
    <div className={theme.block}>6</div>
    <div className={theme.block}>7</div>
    <div className={theme.block}>8</div>
  </div>
);

export const innerScrollHOC = compose(
  themr('innerScroll', innerScrollStyles)
);

export default innerScrollHOC(innerScroll);
