import React from 'react';
import {act, render, screen, waitFor} from '@testing-library/react';
import {Static} from '../../sources/static';
import {Grid} from './Grid';
import {MemoryRouter} from 'react-router-dom';
import {IGridColumn} from './GridBaseRow';

interface IDemoData {
  id: number;
  value: string;
}
test('render list', async () => {
  const source = new Static<IDemoData, number>('id');
  const pagination = {defaultCountPage: 10, queryParamPage: 'page'};
  const columns: IGridColumn<IDemoData, number>[] = [
    {name: 'id'},
    {
      name: 'title',
      Template: (props) => {
        return <div>{props.item.value}</div>;
      },
    },
  ];
  const {container} = render(
    <MemoryRouter initialEntries={['/test?page=0']}>
      <Grid source={source} columns={columns} pagination={pagination} />
    </MemoryRouter>
  );
  let paginationContainer = container.querySelector('.grid-pagination__root');
  expect(paginationContainer).toBeEmptyDOMElement();
  await act(async () => {
    source.create(
      Array.from({length: 30}).map((val, i) => {
        return {
          id: i,
          value: `temp ${i}`,
        };
      })
    );
  });
  await waitFor(() => screen.getByText('temp 9'));
  paginationContainer = container.querySelector('.grid-pagination__root');
  expect(paginationContainer?.children[0]).toBeInTheDocument();
  expect(paginationContainer?.children.length).toBe(1);
});

test('render predefined list', async () => {
  const source = new Static<IDemoData, number>('id', {
    data: {
      data: Array.from({length: 30}).map((val, i) => {
        return {
          id: i,
          value: `temp ${i}`,
        };
      }),
      meta: {
        hasNextPage: true,
      }
    },
    filter: [],
    pagination: {page: 1, countOnPage: 5},
    sorting: [],
  });
  const pagination = {defaultCountPage: 5, queryParamPage: 'page'};
  const columns: IGridColumn<IDemoData, number>[] = [
    {name: 'id'},
    {
      name: 'title',
      Template: (props) => {
        return <div className='local-title-class'>{props.item.value}</div>;
      },
    },
  ];
  const {container} = render(
    <MemoryRouter initialEntries={['/test?page=1']}>
      <Grid source={source} columns={columns} pagination={pagination} />
    </MemoryRouter>
  );
  const paginationContainer = container.querySelector('.grid-pagination__root');
  expect(paginationContainer?.children.length).toBe(2);
  act(()=>{
    const btn = paginationContainer?.children[0] as HTMLElement;
    btn.click();
  });
  await waitFor(() => screen.getByText('temp 0'));
  const row0 = screen.getByText('temp 0');
  expect(row0).toBeInTheDocument();
});

test('render predefined list without url binding', async () => {
  const source = new Static<IDemoData, number>('id', {
    data: {
      data: Array.from({length: 30}).map((val, i) => {
        return {
          id: i,
          value: `temp ${i}`,
        };
      }),
      meta: {
        hasNextPage: true,
      }
    },
    filter: [],
    pagination: {page: 1, countOnPage: 5},
    sorting: [],
  });
  const pagination = {defaultCountPage: 5, defaultPage: 1};
  const columns: IGridColumn<IDemoData, number>[] = [
    {name: 'id'},
    {
      name: 'title',
      Template: (props) => {
        return <div className='local-title-class'>{props.item.value}</div>;
      },
    },
  ];
  const {container} = render(
    <MemoryRouter initialEntries={['/test']}>
      <Grid source={source} columns={columns} pagination={pagination} />
    </MemoryRouter>
  );
  const paginationContainer = container.querySelector('.grid-pagination__root');
  expect(paginationContainer?.children.length).toBe(2);
  act(()=>{
    const btn = paginationContainer?.children[0] as HTMLElement;
    btn.click();
  });
  await waitFor(() => screen.getByText('temp 0'));
  let row0 = screen.getByText('temp 0');
  expect(row0).toBeInTheDocument();
  act(()=>{
    const btn = paginationContainer?.children[0] as HTMLElement;
    btn.click();
  });
  await waitFor(() => screen.getByText('temp 5'));
  row0 = screen.getByText('temp 5');
  expect(row0).toBeInTheDocument();
});
