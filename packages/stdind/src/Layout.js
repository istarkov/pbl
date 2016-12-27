import React from 'react';
import { themr } from 'react-css-themr';
import compose from 'recompose/compose';
import { Base64 } from 'js-base64';
import { Observable } from 'rxjs';
import mapPropsStream from 'recompose/mapPropsStream';
import layoutStyles from './layout.sass';
import Container from './Container';
import Term from './Term';
import defaultConfig from './utils/defaultConfig';

const layoutComponent = ({
  theme, setRef,
}) => (
  <div className={theme.component}>
    <div className={theme.header}>
      <Container theme={theme} themeNamespace={'header'}>
        <h1 className={theme.headerText}>PBL</h1>
        <span>easy deployment tool</span>
      </Container>
    </div>
    <div className={theme.avatarLine}>
      <div className={theme.avatarHolder}>
        <div className={theme.avatar} />
      </div>
    </div>
    <Container>
      <div className={theme.termMain}>
        <div className={theme.term}>
          <Term
            {...defaultConfig}
            ref_={setRef}
            onResize={() => {}}
            onActive={() => {}}
          />
        </div>
      </div>
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
  mapPropsStream((props$) => {
    const DEBOUNCE_TIME = 10;
    const RECONNECT_TIMEOUT = 3000;
    const RECONNECT_ATTEMPTS = 50;
    const PING_INTERVAL = 30000;

    let ref;

    const setRef = (v) => {
      ref = v;
    };

    const { hostname, port } = window.location;

    const socket$ = Observable.webSocket(`ws://${hostname}:${port}/ws`);

    const subject$ =
      Observable.concat(...[
        ...(
          // For Unknow reason sometimes websocket proxy does not work without
          // initial GET http request, as proxy is not used in production build,
          // we add GET request only for dev
          process.NODE_ENV !== 'production'
            ? [
              Observable
                .ajax({ method: 'GET', url: `http://${hostname}:${port}/ws` })
                .catch(() => Observable.empty())
                .skip(1),
            ]
            : []
        ),
        socket$
        .retryWhen(error =>
          Observable
            .from(error)
            .delay(RECONNECT_TIMEOUT)
            .take(RECONNECT_ATTEMPTS)
            .concat(
              Observable.of({})
                .map(() => {
                  throw new Error('socket Error');
                }),
            ),
        ),
      ])
      .share();

    // to avoid socket gateway timeouts
    Observable
      .interval(PING_INTERVAL)
      .subscribe(() => {
        socket$.next('ping');
      });

    const buffered$ = subject$
      .buffer(subject$.debounce(() => Observable.interval(DEBOUNCE_TIME)))
      .delay(ref ? 0 : 100)
      .scan(
        ({ maxIndex }, values) => ({
          values: values.filter(v => v.index > maxIndex),
          maxIndex: Math.max(
            values.length > 0 ? values[values.length - 1].index : -1,
            maxIndex
          ),
        }),
        { maxIndex: -1 }
      )
      .do(({ values }) => values.map(x => ref.write(Base64.decode(x.chunk))))
      .startWith(undefined);

    return props$.combineLatest(buffered$, (props, buffered) => ({
      ...props,
      buffered,
      setRef,
    }));
  }),
);

export default layoutHOC(layoutComponent);
