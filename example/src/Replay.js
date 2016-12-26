import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import replayStyles from './replay.sass';
import defaultConfig from './utils/defaultConfig';
import Term from './Term';

export const replay = ({ theme }) => (
  <div className={theme.main}>
    <Term
      {...defaultConfig}
      ref_={() => {}}
      onResize={() => {}}
      onActive={() => {}}
      // replay={replays[replay]}
    />
  </div>
);

export const replayHOC = compose(
  themr('replay', replayStyles)
);

export default replayHOC(replay);
