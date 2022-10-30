import React from 'react';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {useLocationSearch} from './locationSearch';
import {act} from 'react-dom/test-utils';

test('navigate with location search', () => {
  let params: any;
  const LocationSearchTest = () => {
    params = useLocationSearch();
    return <div>{params.getLinkWithParam('test', '123')}</div>;
  };
  render(
    <MemoryRouter initialEntries={['/test']}>
      <LocationSearchTest />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/\/test\?test=123/i);
  expect(linkElement).toBeInTheDocument();
  act(() => {
    params.set('test2', '234');
  });
  const linkElement2 = screen.getByText(/\/test\?test2=234&test=123/i);
  expect(linkElement2).toBeInTheDocument();
  act(() => {
    params.set('test2', undefined);
  });
  const linkElement3 = screen.getByText(/\/test\?test=123/i);
  expect(linkElement3).toBeInTheDocument();
});

test('navigate with location search', () => {
  let params: any;
  const LocationSearchTest = () => {
    params = useLocationSearch();
    return <div>{params.getLinkWithParam('test', undefined)}</div>;
  };
  render(
    <MemoryRouter initialEntries={['/test?test=123']}>
      <LocationSearchTest />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/\/test/i);
  expect(linkElement).toBeInTheDocument();
});
