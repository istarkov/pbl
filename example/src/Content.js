import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import contentStyles from './content.sass';

export const content = ({ theme }) => (
  <div className={theme.main}>
    <h1 className={theme.header}>PBL</h1>
    <div className={theme.para}>
      <span className={theme.pbl}>pbl</span> allows you to make fast and easy deployment of your
      Docker powered applications and services.
      Any directory that contains a Dockerfile can be deployed with one command:&nbsp;
      <span className={theme.pbl}>pbl</span>.
    </div>
    <div className={theme.para}>
      Every time you deploy a project,&nbsp;
      <span className={theme.pbl}>pbl</span> (by default) will provide you
      immediately with a new unique URL.
      Until build process will be finished,
      full-featured view-only terminal with all the build
      process output will be available at provided URL.
    </div>
    <div className={theme.para}>
      If build process was finished successfully the app
      itself will be available at same URL,
      otherwise terminal with build process output and error will be available.
    </div>
  </div>
);

export const contentHOC = compose(
  themr('content', contentStyles)
);

export default contentHOC(content);
