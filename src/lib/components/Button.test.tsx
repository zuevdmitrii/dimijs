import React from 'react';
import {render, screen} from '@testing-library/react';
import {Button} from './Button';
import styles from './Button.module.scss';
import {StaticRouter} from 'react-router-dom/server';
import {act} from 'react-dom/test-utils';

test('render button', () => {
  render(<Button caption="my caption" />);
  const linkElement = screen.getByText(/my caption/i);
  expect(linkElement).toBeInTheDocument();
});

test('render link', () => {
  render(
    <StaticRouter location="/test">
      <Button caption="my caption" href="/someLink" />
    </StaticRouter>
  );
  const linkElement = screen.getByText(/my caption/i);
  expect(linkElement).toBeInTheDocument();
});

test('process button click', () => {
  let temp = 0;
  render(<Button caption="my caption" onClick={() => void temp++} />);
  const linkElement = screen.getByText(/my caption/i);
  linkElement.click();
  expect(temp > 0).toBeTruthy();
});

test('process button click 2', () => {
  let temp = 0;
  let divClick = 0;
  render(
    <div
      onClick={() => {
        divClick++;
      }}
    >
      <Button caption="my caption" onClick={() => void temp++} />
    </div>
  );
  const linkElement = screen.getByText(/my caption/i);
  linkElement.click();
  expect(temp > 0).toBeTruthy();
  expect(divClick).toBe(0);
});

test('process button click promise', async () => {
  let promiseResolve: any;
  const {container} = render(
    <Button
      caption="my caption"
      onClick={() => {
        return new Promise((resolve) => {
          promiseResolve = resolve;
        });
      }}
    />
  );
  const linkElement = screen.getByText(/my caption/i);
  const btnComponent = container.firstChild;
  expect(btnComponent).toBeEnabled();
  act(() => {
    linkElement.click();
  });
  expect(btnComponent).toBeDisabled();
  await act(async () => {
    await promiseResolve();
  });
  expect(btnComponent).toBeEnabled();
});

test('render button size', () => {
  const {container} = render(<Button caption="my caption" size="sm"/>);
  const btnComponent = container.firstChild;
  expect(btnComponent).toHaveClass(styles['btn--sm']);
});

test('render button color', () => {
  const {container} = render(<Button caption="my caption" color="primary"/>);
  const btnComponent = container.firstChild;
  expect(btnComponent).toHaveClass(styles['btn--primary']);
});
