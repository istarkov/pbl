import React from 'react';
import { themr } from 'react-css-themr';
import compose from 'recompose/compose';
import layoutStyles from './layout.sass';
import MatchWithProps from './enhancers/MatchWithProps';

const layoutComponent = ({
  theme, state, dispatch
}) => (
  <div className={theme.component}>
    <div className={theme.header}>
      Example project
    </div>
    <div className={theme.content}>
      <MatchWithProps
        exactly
        pattern="/"
        component={() => <div>lalla world</div>}
        state={state}
        dispatch={dispatch}
      />
      <MatchWithProps
        pattern="/:id"
        component={() => <div>Lallla</div>}
        state={state}
        dispatch={dispatch}
      />
    </div>
    <div className={theme.footer}>
      CecTPa yTky mHe
    </div>
  </div>
);

export const layoutHOC = compose(
  the mr('layout', layoutStyles),
);

export default layoutHOC(layoutComponent);
