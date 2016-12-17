import React from 'react';
import { themr } from 'react-css-themr';
import compose from 'recompose/compose';
import MatchWithProps from './enhancers/MatchWithProps';
import Content from './Content';
import layoutStyles from './layout.sass';

const layoutComponent = ({
  theme, state, dispatch,
}) => (
  <div className={theme.component}>
    <div className={theme.header}>
      Example project
    </div>
    <div className={theme.content}>
      <MatchWithProps
        exactly
        pattern="/"
        component={Content}
        state={state}
        dispatch={dispatch}
      />
      {/*
      <MatchWithProps
        pattern="/:id"
        component={() => <div>Lallla</div>}
        state={state}
        dispatch={dispatch}
      />
      */}
    </div>
    <div className={theme.footer}>
      <span className={theme.team}>team</span> &nbsp;CecTPa yTky mHe
    </div>
  </div>
);

export const layoutHOC = compose(
  themr('layout', layoutStyles),
);

export default layoutHOC(layoutComponent);
