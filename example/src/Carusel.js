import React from 'react';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import { themr } from 'react-css-themr';
import Slider from 'react-slick';
import caruselStyles from './carusel.sass';
import img0 from '../assets/images/0.jpg';
import img1 from '../assets/images/1.jpg';
import img2 from '../assets/images/2.jpg';
import img3 from '../assets/images/3.jpg';

const images = [img0, img1, img2, img3];
const description = [
  'Enter your project and run pbl',
  'Get unique url',
  'View the build process in the browser',
  'Your app is ready',
];

export const carusel = ({ theme, settings }) => (
  <div className={theme.main}>
    <Slider {...settings}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={theme.card}>
          <div className={theme.aspectRatioContent}>
            <div
              className={theme.innerCard}
              style={{ backgroundImage: `url(${images[i]})` }}
            >
              <div className={theme.description}>
                {i + 1} - {description[i]}
              </div>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  </div>
);

export const caruselHOC = compose(
  themr('carusel', caruselStyles),
  withProps(({ theme }) => ({
    settings: {
      className: theme.holder,
      centerMode: true,
      infinite: true,
      slidesToShow: 3,
      speed: 500
    },
  }))
);

export default caruselHOC(carusel);
