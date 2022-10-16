import React from 'react';
import {act, render, screen, waitFor} from '@testing-library/react';
import {Base} from './Base';
import {Static} from '../../sources/static';
import {CrudErrorCodes} from '../../sources/source';
import {resolve} from 'node:path/win32';

interface IDemoData {
  id: number;
  value: string;
}
test('render empty list', async () => {
  const source = new Static<IDemoData, number>('id');
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
        PreloadTemplate={() => <span>Loading...</span>}
      />
    </div>
  );
  expect(container.firstChild).toContainHTML('Loading');
  await act(async () => {
    await source.create([{id: 1, value: 'test'}]);
  });
  await waitFor(() => screen.getByText('1'));
  expect(container.firstChild).toContainHTML('1');
  const forSerialization = source.getSerializationData([], pagination);
  expect(forSerialization).toMatchSnapshot();
});

test('render empty list with empty preload', async () => {
  const source = new Static<IDemoData, number>('id');
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
      />
    </div>
  );
  expect(container.firstChild).toBeEmptyDOMElement();
});

test('render deserialized list', async () => {
  const serverData = {
    data: [{id: 1, value: 'test'}],
    meta: {hasNextPage: false},
  };
  const source = new Static<IDemoData, number>('id', {
    data: serverData,
    filter: [],
    pagination: {page: 0, countOnPage: 10},
  });
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
        PreloadTemplate={() => <span>Loading...</span>}
      />
    </div>
  );
  expect(container.firstChild).toContainHTML('1');
  const forSerialization = source.getSerializationData([], pagination);
  expect(forSerialization).toMatchObject(serverData);
});

test('render error template', async () => {
  const serverData = {
    errorCode: CrudErrorCodes.ERROR,
    errorMessage: 'Demo error',
  };
  const source = new Static<IDemoData, number>('id', {
    data: serverData,
    filter: [],
    pagination: {page: 0, countOnPage: 10},
  });
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
        ErrorTemplate={({error}) => <span>Err: {error.errorMessage}...</span>}
      />
    </div>
  );
  expect(container.firstChild).toContainHTML('Err: Demo error...');
  const forSerialization = source.getSerializationData([], pagination);
  expect(forSerialization).toMatchObject(serverData);
});

test('render empty error template', async () => {
  const serverData = {
    errorCode: CrudErrorCodes.ERROR,
    errorMessage: 'Demo error',
  };
  const source = new Static<IDemoData, number>('id', {
    data: serverData,
    filter: [],
    pagination: {page: 0, countOnPage: 10},
  });
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
      />
    </div>
  );
  expect(container.firstChild).toBeEmptyDOMElement();
});

test('render error tmpl after list method', async () => {
  const source = new Static<IDemoData, number>('id');
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
        PreloadTemplate={() => <span>Loading...</span>}
        ErrorTemplate={({error}) => <span>Err: {error.errorMessage}...</span>}
      />
    </div>
  );
  // @ts-ignore
  source.list = () => {
    return new Promise((resolve) => {
      resolve({errorCode: CrudErrorCodes.ERROR, errorMessage: 'Runtime error'});
    });
  };
  expect(container.firstChild).toContainHTML('Loading');
  await act(async () => {
    await source.create([{id: 1, value: 'test'}]);
  });
  await waitFor(() => screen.getByText('Err: Runtime error...'));
  expect(container.firstChild).toContainHTML('Err: Runtime error...');
});

test('render empty error tmpl after list method', async () => {
  const source = new Static<IDemoData, number>('id');
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
        PreloadTemplate={() => <span>Loading...</span>}
        ErrorTemplate={({error}) => (
          <span>Err: {error.errorMessage || 'unknown'}...</span>
        )}
      />
    </div>
  );
  // @ts-ignore
  source.list = () => {
    return new Promise((resolve) => {
      resolve({errorCode: CrudErrorCodes.ERROR, errorMessage: ''});
    });
  };
  expect(container.firstChild).toContainHTML('Loading');
  await act(async () => {
    await source.create([{id: 1, value: 'test'}]);
  });
  await waitFor(() => screen.getByText('Err: unknown...'));
  expect(container.firstChild).toContainHTML('Err: unknown...');
});

test('render deserialized list after first request', async () => {
  const serverData = {
    data: [{id: 1, value: 'test'}],
    meta: {hasNextPage: false},
  };
  const source = new Static<IDemoData, number>('id', {
    data: serverData,
  });
  const pagination = {page: 0, countOnPage: 10};
  const {container} = render(
    <div>
      <Base
        source={source}
        pagination={pagination}
        RowTemplate={({item}) => {
          return <span>{item.id}</span>;
        }}
        PreloadTemplate={() => <span>Loading...</span>}
      />
    </div>
  );
  expect(container.firstChild).toContainHTML('Loading');
  await waitFor(() => screen.getByText('1'));
  expect(container.firstChild).toContainHTML('1');
});