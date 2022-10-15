import React from 'react';
import {getPxFromSize, IconButton} from './IconButton';
import {render} from '@testing-library/react';

test('icon size', () => {
  expect(getPxFromSize('sm').width).toBe(12);
  expect(getPxFromSize('sm').height).toBe(12);
  expect(getPxFromSize('lg').height).toBe(24);
  expect(getPxFromSize('lg').height).toBe(24);
  expect(getPxFromSize().height).toBe(16);
  expect(getPxFromSize().height).toBe(16);
});

test('render icon button', () => {
  const {container} = render(
    <IconButton
      caption="my caption"
      size="sm"
      iconSetName="navigation"
      iconId="expandMore"
    />
  );
  const svgUse = container.querySelector('svg > use');
  expect(svgUse?.attributes.getNamedItem('xlink:href')?.value).toBe(
    '/icons/navigation.svg#expandMore'
  );
});
