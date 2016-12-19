import React from 'react';
import { themr } from 'react-css-themr';
import compose from 'recompose/compose';
import MatchWithProps from './enhancers/MatchWithProps';
import Container from './Container';
import Tmp from './Tmp';
import InnerScroll from './InnerScroll';
import Content from './Content';
import layoutStyles from './layout.sass';


const layoutComponent = ({
  theme, state, dispatch,
}) => (
  <div className={theme.component}>
    <div className={theme.header}>
      <Container theme={theme} themeNamespace={'header'}>
        <h1 className={theme.headerText}>PBL</h1>
        <span>easy deployment tool</span>
      </Container>
    </div>
    <Container>
      <MatchWithProps
        exactly
        pattern="/"
        component={Content}
        state={state}
        dispatch={dispatch}
      />

      <MatchWithProps
        pattern="/scroll"
        component={Tmp}
        state={state}
        dispatch={dispatch}
      />

      <MatchWithProps
        pattern="/inner"
        component={InnerScroll}
        state={state}
        dispatch={dispatch}
      />
    </Container>
    <div className={theme.footer}>
      <Container theme={theme} themeNamespace={'footer'}>
        <span className={theme.team}>team</span> &nbsp;CecTPa yTky mHe
      </Container>
    </div>
  </div>
);

export const layoutHOC = compose(
  themr('layout', layoutStyles),
);

export default layoutHOC(layoutComponent);
