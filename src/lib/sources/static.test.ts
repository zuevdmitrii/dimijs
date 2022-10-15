import {
  CrudAggregation,
  CrudErrorCodes,
  CrudEvents,
  CrudFilterFieldTypes,
  CrudFilterOperator,
  ICrudList,
} from './source';
import {Static} from './static';

interface ITestData {
  id: number;
  title: string;
  value?: string;
}
test('create static', async () => {
  const s = new Static<ITestData, number>('id', [
    {
      id: 1,
      title: 'test',
    },
  ]);
  const row = (await s.read(1)) as ITestData;
  expect(row).toBeTruthy();
  expect(row.title).toBe('test');
});

test('add to static source', async () => {
  const s = new Static<ITestData, number>('id', [
    {
      id: 1,
      title: 'test',
    },
  ]);
  await s.create([{id: 2, title: 'test2'}]);
  const row = (await s.read(2)) as ITestData;
  expect(row).toBeTruthy();
  expect(row.title).toBe('test2');
});

test('delete from static source', async () => {
  const s = new Static<ITestData, number>('id', [
    {
      id: 1,
      title: 'test',
    },
  ]);
  await s.delete(1);
  const row = await s.read(1);
  expect(row).toBeNull();
  const result = await s.delete(1);
  expect(result.errorCode).toBe(CrudErrorCodes.ERROR);
  expect(result.errorMessage).toContain('Not found by id');
});

test('update value in static', async () => {
  const s = new Static<ITestData, number>('id', [
    {
      id: 1,
      title: 'row 1',
    },
    {
      id: 2,
      title: 'row 2',
      value: 'data in row 2',
    },
  ]);
  await s.update({id: 1, value: 'data for row 1'});
  let row = (await s.read(1)) as ITestData;
  expect(row.title).toBe('row 1');
  expect(row.value).toBe('data for row 1');
  row = (await s.read(2)) as ITestData;
  expect(row.value).toBe('data in row 2');
  await s.update({id: 2, value: undefined});
  row = (await s.read(2)) as ITestData;
  expect(row.value).toBeUndefined();
  const result = await s.update({id: 25, title: 'no row'});
  expect(result.errorCode).toBe(CrudErrorCodes.ERROR);
  expect(result.errorMessage).toContain('Not found by id');
});

test('list methods', async () => {
  const s = new Static<ITestData, number>('id');
  await s.create(
    Array.from({length: 10}, (v, i) => {
      return {
        id: i,
        title: `row ${i}`,
        value: i % 2 ? `value ${i}` : undefined,
      };
    })
  );
  let list = (await s.list(
    [
      {
        field: 'title',
        operator: CrudFilterOperator.LIKE,
        value: 'row',
        type: CrudFilterFieldTypes.Field,
      },
    ],
    {page: 0, countOnPage: 100}
  )) as ICrudList<ITestData>;
  expect(list.data.length).toBe(10);
  list = (await s.list(
    [
      {
        field: 'value',
        operator: CrudFilterOperator.NOTEQ,
        value: undefined,
        type: CrudFilterFieldTypes.Field,
      },
    ],
    {page: 0, countOnPage: 100}
  )) as ICrudList<ITestData>;
  expect(list.data.length).toBe(5);
  list = (await s.list(
    [
      {
        type: CrudFilterFieldTypes.Aggregation,
        aggregation: CrudAggregation.OR,
        filter: [
          {
            field: 'value',
            operator: CrudFilterOperator.NOTEQ,
            value: undefined,
            type: CrudFilterFieldTypes.Field,
          },
          {
            field: 'id',
            operator: CrudFilterOperator.EQ,
            value: 8,
            type: CrudFilterFieldTypes.Field,
          },
        ],
      },
    ],
    {page: 0, countOnPage: 100}
  )) as ICrudList<ITestData>;
  expect(list.data.length).toBe(6);
  list = (await s.list(
    [
      {
        type: CrudFilterFieldTypes.Aggregation,
        aggregation: CrudAggregation.AND,
        filter: [
          {
            field: 'value',
            operator: CrudFilterOperator.NOTEQ,
            value: undefined,
            type: CrudFilterFieldTypes.Field,
          },
          {
            field: 'id',
            operator: CrudFilterOperator.EQ,
            value: 8,
            type: CrudFilterFieldTypes.Field,
          },
        ],
      },
    ],
    {page: 0, countOnPage: 100}
  )) as ICrudList<ITestData>;
  list = (await s.list(
    [],
    {page: 0, countOnPage: 5},
    [{field: 'id'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('0.1.2.3.4');
  list = (await s.list(
    [],
    {page: 0, countOnPage: 5},
    [{field: 'id', direction: 'DESC'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('9.8.7.6.5');
  list = (await s.list(
    [],
    {page: 0, countOnPage: 5},
    [{field: 'title'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('0.1.2.3.4');
  list = (await s.list(
    [],
    {page: 0, countOnPage: 5},
    [{field: 'title', direction: 'DESC'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('9.8.7.6.5');
  list = (await s.list(
    [{
      field: 'id',
      operator: CrudFilterOperator.LT,
      value: 8,
      type: CrudFilterFieldTypes.Field,
    }],
    {page: 0, countOnPage: 100},
    [{field: 'id'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('0.1.2.3.4.5.6.7');
  list = (await s.list(
    [{
      field: 'id',
      operator: CrudFilterOperator.LTE,
      value: 8,
      type: CrudFilterFieldTypes.Field,
    }],
    {page: 0, countOnPage: 100},
    [{field: 'id'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('0.1.2.3.4.5.6.7.8');
  list = (await s.list(
    [{
      field: 'id',
      operator: CrudFilterOperator.GT,
      value: 8,
      type: CrudFilterFieldTypes.Field,
    }],
    {page: 0, countOnPage: 100},
    [{field: 'id'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('9');
  list = (await s.list(
    [{
      field: 'id',
      operator: CrudFilterOperator.GTE,
      value: 8,
      type: CrudFilterFieldTypes.Field,
    }],
    {page: 0, countOnPage: 100},
    [{field: 'id'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('8.9');
  list = (await s.list(
    [{
      field: 'id',
      operator: CrudFilterOperator.LIKE,
      value: '1',
      type: CrudFilterFieldTypes.Field,
    }],
    {page: 0, countOnPage: 100},
    [{field: 'id'}]
  )) as ICrudList<ITestData>;
  expect(list.data.map(item=>item.id).join('.')).toBe('');
});

test('events static', async () => {
  const s = new Static<ITestData, number>('id', [
    {
      id: 1,
      title: 'test',
    },
  ]);
  let onCreate = '';
  let onUpdate = '';
  let onDelete = '';
  const unsubscribe = s.on(CrudEvents.onCreate, (event, data)=>{
    onCreate = `${event}_${data[0].title}`;
  });
  s.on(CrudEvents.onUpdate, (event, data)=>{
    onUpdate = `${event}_${data[0].title}`;
  });
  s.on(CrudEvents.onDelete, (event, deleted)=>{
    onDelete = `${event}_${deleted[0].title}`;
  })
  await s.create([{id: 2, title: 'created'}]);
  expect(onCreate).toBe('onCreate_created');
  await s.update({id: 2, title: 'newTitle'});
  expect(onUpdate).toBe('onUpdate_newTitle');
  await s.delete(2);
  expect(onDelete).toBe('onDelete_newTitle');
  await s.create([{id: 3, title: 'created_3'}]);
  expect(onCreate).toBe('onCreate_created_3');
  unsubscribe();
  onCreate = '';
  await s.create([{id: 4, title: 'created_4'}]);
  expect(onCreate).toBe('');
});
