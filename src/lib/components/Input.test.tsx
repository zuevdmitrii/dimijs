import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {Input} from './Input';
import {act} from 'react-dom/test-utils';
import styles from './Input.module.scss';


test('enabled input', () => {
  const {container} = render(
    <Input
      value={''}
      placeholder={'placeholder'}
      onChange={() => {}}
      className={'testInput'}
    />
  );
  const input = container.firstChild;
  expect(input).toBeInTheDocument();
  expect(input).toHaveClass('testInput');
  const inputTag = container.querySelector('input');
  expect(inputTag).toBeInTheDocument();
  expect(inputTag).toBeEnabled();
});

test('disabled input', () => {
  const {container} = render(
    <Input
      value={''}
      placeholder={'placeholder'}
      onChange={() => {}}
      disabled
      className={'testInput'}
    />
  );
  const inputTag = container.querySelector('input');
  expect(inputTag).toBeInTheDocument();
  expect(inputTag).toBeDisabled();
});

test('onchange event', () => {
  let data = '';
  const {container} = render(
    <Input
      value={''}
      placeholder={'placeholder'}
      onChange={(value) => {
        data = value;
      }}
      className={'testInput'}
    />
  );
  const inputTag = container.querySelector('input');
  expect(inputTag?.value).toBe('');
  act(() => {
    if (inputTag)
      fireEvent.change(inputTag, {target: {value: '123'}})
  });
  expect(data).toBe('123');
});

test('input size', () => {
  const {container} = render(
    <Input
      value={''}
      size={'lg'}
      placeholder={'placeholder'}
      onChange={() => {}}
      disabled
      className={'testInput'}
    />
  );
  const input = container.firstChild;
  expect(input).toHaveClass(styles['input--lg']);
});

test('input with label', () => {
  const {container} = render(
    <Input
      value={''}
      label={'Some text before input'}
      placeholder={'placeholder'}
      onChange={() => {}}
      disabled
      className={'testInput'}
    />
  );
  const label = container.querySelector('label');
  expect(label).toBeInTheDocument();
});
