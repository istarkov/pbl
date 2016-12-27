import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import markdown from 'markdown-in-js';
import { Link } from 'react-router';
import Carusel from './Carusel';
import contentStyles from './content.sass';

const Data = ({ theme }) => markdown({
  a: ({ href, children }) => (
    <a href={href} target={'_blank'}>{children}</a>
  ),
})`
[**Pbl**](https://github.com/istarkov/pbl) gives users the ability to make fast and easy deployment of their
Docker powered applications and services onto their server.
Any directory that contains a Dockerfile can be deployed with just one command: \`pbl\`

Every time a user deploys a project, [**pbl**](https://github.com/istarkov/pbl) (by default),
will immediately
provide a new unique URL. While the build process runs,
a full-featured, view-only terminal with all
the ${<Link className={theme.link} to={'/build'}>build process output</Link>} will
be available at the provided URL.

If the build process is successful, the app
itself will become available at the same URL,
otherwise the terminal with
the ${<Link className={theme.link} to={'/err'}>build process output and error(s)</Link>} will
remain available.

*More information available [here](https://github.com/istarkov/pbl)*
`;

export const content = ({ theme }) => (
  <div className={theme.main}>
    <div className={theme.data}>
      <Data theme={theme} />
    </div>
    <Carusel />
  </div>
);

export const contentHOC = compose(
  themr('content', contentStyles)
);

export default contentHOC(content);
