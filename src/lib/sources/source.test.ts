import { Source } from "./source";

test('create source', () => {
  const s = new Source('id');
  expect(()=>s.create([])).toThrow();
  expect(()=>s.read(1)).toThrow();
  expect(()=>s.update({})).toThrow();
  expect(()=>s.delete(1)).toThrow();
  expect(()=>s.list([], {page: 0, countOnPage: 10})).toThrow();
});
