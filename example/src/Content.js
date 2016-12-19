import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import markdown from 'markdown-in-js';
import Carusel from './Carusel';
import contentStyles from './content.sass';

const Data = () => markdown`
**Pbl** allows you to make fast and easy deployment of your
Docker powered applications and services.
Any directory that contains a Dockerfile can be deployed with one command \`pbl\`

Every time you deploy a project, **pbl** (by default) will provide you
immediately with a new unique URL. Until build process will be finished,
full-featured view-only terminal with all the build
process output will be available at provided URL.

If build process was finished successfully the app
itself will be available at same URL,
otherwise terminal with build process output and error will be available.

*More information available [here](https://github.com/istarkov/pbl)*
`;

export const content = ({ theme }) => (
  <div className={theme.main}>
    <div className={theme.avatar} />
    <div className={theme.data}>
      <Data />
    </div>
    <Carusel />
  </div>
);

export const contentHOC = compose(
  themr('content', contentStyles)
);

export default contentHOC(content);
