import React from 'react';
import { Base64 } from 'js-base64';
import { Observable } from 'rxjs';
import mapPropsStream from 'recompose/mapPropsStream';
import createEventHandler from 'recompose/createEventHandler';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import replayStyles from './replay.sass';
import defaultConfig from './utils/defaultConfig';
import buildReplayData from '../assets/replays/build.txt';
import errReplayData from '../assets/replays/err.txt';
import Term from './Term';

export const replay = ({ theme, setRef }) => (
  <div className={theme.main}>
    <Term
      {...defaultConfig}
      ref_={setRef}
      onResize={() => {}}
      onActive={() => {}}
      // replay={replays[replay]}
    />
  </div>
);

const HAVE_NO_IDEA_WHY_TERM_BREAKS_WITHOUT_DELAY = 300;

export const replayHOC = compose(
  themr('replay', replayStyles),
  mapPropsStream((props$) => {
    const { handler: setRef, stream: ref$ } = createEventHandler();
    const replayData = {
      build: buildReplayData,
      err: errReplayData,
    };

    const replayDelays = {
      build: 5,
      err: 50,
    };

    const term$ = ref$
      .filter(ref => ref !== null)
      .withLatestFrom(props$, (ref, props) => ({
        ref,
        props,
      }))
      .delay(HAVE_NO_IDEA_WHY_TERM_BREAKS_WITHOUT_DELAY)
      .switchMap(({ ref, props: { replay: replayKey = 'build' } }) => {
        const arr = replayData[replayKey].split('\n');
        return Observable.concat(
            ...arr
            .map(v => Observable.of(v).delay(replayDelays[replayKey]))
        )
        // .do(line => console.log(Base64.decode(line)))
        .do(line => ref.write(Base64.decode(line)));
      })
      .filter(() => false);


    return props$.combineLatest(term$.startWith(undefined), props => ({
      ...props,
      setRef,
    }));
  }),
);

export default replayHOC(replay);
