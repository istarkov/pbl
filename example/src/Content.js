import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import markdown from 'markdown-in-js';
import Carusel from './Carusel';
import contentStyles from './content.sass';

const Data = () => markdown`
**Pbl** gives users the ability to make fast and easy deployment of their
Docker powered applications and services onto their server.
Any directory that contains a Dockerfile can be deployed with just one command: \`pbl\`

Every time a user deploys a project, **pbl** (by default), will immediately
provide a new unique URL. While the build process runs,
a full-featured, view-only terminal with all the build
process output will be available at the provided URL.

If the build process is successful, the app
itself will become available at the same URL,
otherwise the terminal with the build process output and error(s) will remain available.

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
