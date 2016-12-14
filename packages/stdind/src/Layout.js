import React from 'react';
import { themr } from 'react-css-themr';
import compose from 'recompose/compose';
import { Base64 } from 'js-base64';
import { Observable } from 'rxjs';
import mapPropsStream from 'recompose/mapPropsStream';
import layoutStyles from './layout.sass';
// import MatchWithProps from './enhancers/MatchWithProps';
import Term from './Term';
import defaultConfig from './utils/defaultConfig';

const layoutComponent = ({
  theme, setRef,
}) => (
  <div className={theme.component}>
    <div className={theme.header}>
      BUILD
    </div>
    <div className={theme.content}>
      {/*
      <MatchWithProps
        exactly
        pattern="/"
        component={() => <div>Hello A Big World</div>}
        state={state}
        dispatch={dispatch}
      />
      <MatchWithProps
        pattern="/:id"
        component={() => <div>Lala</div>}
        state={state}
        dispatch={dispatch}
      />
      */}
      <Term
        {...defaultConfig}
        ref_={setRef}
        onResize={() => {}}
      />
    </div>
    <div className={theme.footer}>
      created by AShain and IStarkov
    </div>
  </div>
);

export const layoutHOC = compose(
  themr('layout', layoutStyles),
  // Mini redux + redux-observable
  mapPropsStream((props$) => {
    const DEBOUNCE_TIME = 100;
    const RECONNECT_TIMEOUT = 3000;
    const RECONNECT_ATTEMPTS = 50;

    let ref;

    const setRef = (v) => {
      ref = v;
    };

    const { hostname, port } = window.location;

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
        Observable
        .webSocket(`ws://${hostname}:${port}/ws`)
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

    const buffered$ = subject$
      .buffer(subject$.debounce(() => Observable.interval(DEBOUNCE_TIME)))
      .do(v => console.log('v', v.map(x => Base64.decode(x))))
      .delay(ref ? 0 : 100)
      .do(v => v.map(x => ref.write(Base64.decode(x))))
      .startWith(undefined);

    return props$.combineLatest(buffered$, (props, buffered) => ({
      ...props,
      buffered,
      setRef,
    }));
  }),
);

export default layoutHOC(layoutComponent);
