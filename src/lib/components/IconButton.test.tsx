import React from 'react';
import { getPxFromSize } from './IconButton';

test('icon size', () => {
  expect(getPxFromSize('sm').width).toBe(12);
  expect(getPxFromSize('sm').height).toBe(12);
  expect(getPxFromSize('lg').height).toBe(24);
  expect(getPxFromSize('lg').height).toBe(24);
  expect(getPxFromSize().height).toBe(16);
  expect(getPxFromSize().height).toBe(16);
});

