import {Http} from './http';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {CrudErrorCodes, CrudEvents, ICrudList, ICrudStatus} from './source';

interface ITestData {
  id: number;
  title: string;
  value?: string;
}

const server = setupServer(
  rest.post('/crud/create', async (req, res, ctx) => {
    const body = JSON.parse(decodeURIComponent(await req.text()));
    if (body[0].id === 2) return res(ctx.status(500, 'duplicate id'));
    return res(ctx.json([{...body[0], value: `${body[0].title}_calculated`}]));
  }),
  rest.post('/crud/update', async (req, res, ctx) => {
    const body = JSON.parse(decodeURIComponent(await req.text()));
    if (body.id === 2) return res(ctx.status(500, 'update error'));
    return res(ctx.json({...body, value: `${body.title}_calculated`}));
  }),
  rest.post('/crud/delete', async (req, res, ctx) => {
    const body = JSON.parse(decodeURIComponent(await req.text()));
    if (body.id === 2) return res(ctx.status(500, 'row not found'));
    if (body.id === 3)
      return res(ctx.json({errorCode: 1, errorMessage: 'err msg with 200'}));
    return res(ctx.json({id: 1, title: 'test'}));
  }),
  rest.get('/crud/list', async (req, res, ctx) => {
    const params = JSON.parse(
      decodeURIComponent(String(req.url.searchParams.get('params')))
    );
    if (params.pagination.page == 1) return res(ctx.status(500, 'error list'));
    const result: ICrudList<ITestData> = {
      data: [{id: 100, title: 'test'}],
      meta: {hasNextPage: params.pagination.page === 0},
    };
    return res(ctx.json(result));
  }),
  rest.get('/crud/read', async (req, res, ctx) => {
    const id = Number(req.url.searchParams.get('id'));
    if (id === 2) return res(ctx.status(500, 'error'));
    if (id === 3) return res(ctx.json(null));
    return res(ctx.json({id: 1, title: 'test'}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('create row', async () => {
  const s = new Http<ITestData, number>('id');
  let created: any;
  s.on(CrudEvents.onCreate, (event, data) => {
    created = data[0];
  });
  const res = await s.create([{id: 1, title: 'test'}]);
  expect(res.errorCode).toBe(CrudErrorCodes.OK);
  expect(created.id).toBe(1);
  expect(created.value).toBe('test_calculated');
});

test('create row error', async () => {
  const s = new Http<ITestData, number>('id');
  let created: any;
  s.on(CrudEvents.onCreate, (event, data) => {
    created = data[0];
  });
  const res = await s.create([{id: 2, title: 'test'}]);
  expect(res.errorCode).toBe(CrudErrorCodes.ERROR);
  expect(res.errorMessage).toBe('duplicate id');
  expect(created).toBe(undefined);
});

test('delete row', async () => {
  const s = new Http<ITestData, number>('id');
  let deleted: any;
  s.on(CrudEvents.onDelete, (event, data) => {
    deleted = data[0];
  });
  const res = await s.delete(1);
  expect(res.errorCode).toBe(CrudErrorCodes.OK);
  expect(deleted.id).toBe(1);
  expect(deleted.title).toBe('test');
});

test('delete row error', async () => {
  const s = new Http<ITestData, number>('id');
  let deleted: any;
  s.on(CrudEvents.onDelete, (event, data) => {
    deleted = data[0];
  });
  const res = await s.delete(2);
  expect(res.errorCode).toBe(CrudErrorCodes.ERROR);
  expect(res.errorMessage).toBe('row not found');
  expect(deleted).toBe(undefined);
  const res2 = await s.delete(3);
  expect(res2.errorCode).toBe(CrudErrorCodes.ERROR);
  expect(res2.errorMessage).toBe('err msg with 200');
  expect(deleted).toBe(undefined);
});

test('read row', async () => {
  const s = new Http<ITestData, number>('id');
  const res = await s.read(1);
  expect((res as ITestData).id).toBe(1);
  expect((res as ITestData).title).toBe('test');
});

test('read null row', async () => {
  const s = new Http<ITestData, number>('id');
  const res = await s.read(3);
  expect(res).toBeNull();
});

test('error read row', async () => {
  const s = new Http<ITestData, number>('id');
  const res = await s.read(2);
  expect((res as ICrudStatus).errorMessage).toBe('error');
});

test('update row', async () => {
  const s = new Http<ITestData, number>('id');
  let updated: any;
  s.on(CrudEvents.onUpdate, (event, data) => {
    updated = data[0];
  });
  const res = await s.update({id: 1, title: 'test'});
  expect(res.errorCode).toBe(CrudErrorCodes.OK);
  expect(updated.id).toBe(1);
  expect(updated.value).toBe('test_calculated');
});

test('update row error', async () => {
  const s = new Http<ITestData, number>('id');
  let updated: any;
  s.on(CrudEvents.onUpdate, (event, data) => {
    updated = data[0];
  });
  const res = await s.update({id: 2, title: 'test'});
  expect(res.errorCode).toBe(CrudErrorCodes.ERROR);
  expect(res.errorMessage).toBe('update error');
  expect(updated).toBe(undefined);
});

test('list', async () => {
  const s = new Http<ITestData, number>('id');
  const res = await s.list([], {page: 0, countOnPage: 10});
  expect((res as ICrudStatus).errorCode).toBe(undefined);
  expect((res as ICrudList<ITestData>).meta?.hasNextPage).toBe(true);
  expect((res as ICrudList<ITestData>).data[0].id).toBe(100);
});

test('list error', async () => {
  const s = new Http<ITestData, number>('id');
  const res = await s.list([], {page: 1, countOnPage: 10});
  expect((res as ICrudStatus).errorCode).toBe(CrudErrorCodes.ERROR);
  expect((res as ICrudStatus).errorMessage).toBe('error list');
});
