import React from 'react';
import {render, screen} from '@testing-library/react';
import {Button} from './Button';
import {StaticRouter} from 'react-router-dom/server';

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
  render(<Button caption="my caption" onClick={()=>temp++}/>);
  const linkElement = screen.getByText(/my caption/i);
  linkElement.click();
  expect(temp>0).toBeTruthy();
});

test('process button click', () => {
  let temp = 0;
  let divClick = 0;
  render(<div onClick={()=>{
    divClick++;
  }}>
    <Button caption="my caption" onClick={()=>temp++}/>
  </div>);
  const linkElement = screen.getByText(/my caption/i);
  linkElement.click();
  expect(temp>0).toBeTruthy();
  expect(divClick).toBe(0);
});
