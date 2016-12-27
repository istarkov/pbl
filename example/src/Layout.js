import React from 'react';
import { themr } from 'react-css-themr';
import compose from 'recompose/compose';
import { Link } from 'react-router';
import MatchWithProps from './enhancers/MatchWithProps';
import AsyncMatch from './enhancers/AsyncMatch';
import Container from './Container';
import Content from './Content';
// import Replay from './Replay';
import layoutStyles from './layout.sass';

async function loadReplayPage() {
  return new Promise((r) => {
    require.ensure([], () => {
      const Replay = require('./Replay').default; // eslint-disable-line
      r(Replay);
    });
  });
}


const layoutComponent = ({
  theme, state, dispatch,
}) => (
  <div className={theme.component}>
    <div className={theme.header}>
      <Container theme={theme} themeNamespace={'header'}>
        <div className={theme.headerLeft}>
          <Link to={'/'}><h1 className={theme.headerText}>PBL</h1></Link>
          <span>easy deployment tool</span>
        </div>
        <div className={theme.headerMenu}>
          <span>how it looks like:</span>
          <Link to={'/build'}>build</Link>
          <Link to={'/err'}>error</Link>
        </div>
      </Container>
    </div>
    <div className={theme.avatarLine}>
      <div className={theme.avatarHolder}>
        <div className={theme.avatar} />
      </div>
    </div>
    <Container>
      <MatchWithProps
        exactly
        pattern="/"
        component={Content}
        state={state}
        dispatch={dispatch}
      />
      <AsyncMatch
        pattern="/build"
        component={loadReplayPage}
        renderLoading={() => <div className={theme.loading}>Loading...</div>}
        replay={'build'}
      />
      <AsyncMatch
        pattern="/err"
        component={loadReplayPage}
        renderLoading={() => <div className={theme.loading}>Loading...</div>}
        replay={'err'}
      />
    </Container>
    <div className={theme.footer}>
      <Container theme={theme} themeNamespace={'footer'}>
        <span className={theme.team}>team</span> &nbsp;CecTPa yTky MHe
      </Container>
    </div>
  </div>
);

export const layoutHOC = compose(
  themr('layout', layoutStyles),
);

export default layoutHOC(layoutComponent);
