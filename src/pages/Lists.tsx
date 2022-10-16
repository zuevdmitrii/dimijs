import React, {Fragment, useEffect, useMemo, useState} from 'react';
import {Button} from '../lib/components/Button';
import {IconButton} from '../lib/components/IconButton';
import {Input} from '../lib/components/Input';
import {Base} from '../lib/components/lists/Base';
import {
  CrudErrorCodes,
  CrudEvents,
  ICrudList,
  ICrudStatus,
} from '../lib/sources/source';
import {Static} from '../lib/sources/static';
import styles from './Lists.module.scss';
import {Template} from './Template';

interface IDemoData {
  id: number;
  value: string;
}

export const Lists = () => {
  const staticPagination = useMemo(() => ({page: 0, countOnPage: 20}), []);
  const source = useMemo(() => {
    const listSource = new Static<IDemoData, number>('id');
    // non SOLID, only for test UI
    listSource.delay = 1000;
    return listSource;
  }, []);
  const source2 = useMemo(() => {
    const listSource = new Static<IDemoData, number>('id', {
      data: {
        data: [{id: 1, value: 'test'}, {id: 2, value: 'test2'}],
      }
    });
    // non SOLID, only for test UI
    listSource.delay = 1000;
    return listSource;
  }, []);
  const source3 = useMemo(() => {
    const listSource = new Static<IDemoData, number>('id', {
      data: {
        data: [{id: 1, value: 'test'}, {id: 2, value: 'test2'}],
      },
      pagination: staticPagination,
      filter: [],
    });
    // non SOLID, only for test UI
    listSource.delay = 1000;
    return listSource;
  }, [staticPagination]);
  const [value, setValue] = useState('');
  const [uiDisabled, setUiDisabled] = useState(false);
  const [lastId, setLastId] = useState(0);
  const [list, setList] = useState<IDemoData[]>([]);
  const RowTemplate = useMemo(
    () =>
      ({item}: {item: IDemoData}) =>
        (
          <>
            <div>{item.id}</div>
            <div>{item.value}</div>
            <div>
              <IconButton
                size="sm"
                iconSetName="action"
                iconId="delete"
                caption=""
                onClick={() => source.delete(item.id)}
              />
            </div>
          </>
        ),
    [source]
  );
  useEffect(() => {
    const upList = async () => {
      const newList = await source.list([], {page: 0, countOnPage: 100});
      if ((newList as ICrudStatus).errorCode) {
        setList([]);
      } else {
        setList((newList as ICrudList<IDemoData>).data);
      }
    };
    const unsubscribes = [
      source.on(CrudEvents.onCreate, upList),
      source.on(CrudEvents.onDelete, upList),
      source.on(CrudEvents.onUpdate, upList),
    ];
    return () => void unsubscribes.forEach((f) => f());
  }, [source]);
  return (
    <Template>
      <>
        <h1>Lists</h1>
        <h2>Simple list with 1s delay</h2>
        <div className={styles.listDemo}>
          <form onSubmit={(ev) => ev.preventDefault()}>
            <Input value={value} onChange={setValue} disabled={uiDisabled} />
            <Button
              type="submit"
              caption="Add"
              onClick={() => {
                const data = {id: lastId, value};
                setLastId((id) => id + 1);
                setUiDisabled(true);
                return source.create([data]).then((result) => {
                  if (result.errorCode === CrudErrorCodes.OK) {
                    setValue('');
                    setUiDisabled(false);
                  }
                });
              }}
            />
          </form>
          <div className={styles.simpleGrid}>
            {list.map((row) => (
              <Fragment key={row.id}>
                <div>{row.id}</div>
                <div>{row.value}</div>
                <div>
                  <IconButton
                    size="sm"
                    iconSetName="action"
                    iconId="delete"
                    caption=""
                    onClick={() => source.delete(row.id)}
                  />
                </div>
              </Fragment>
            ))}
          </div>
          <h3>The same source but with lists/Base</h3>
          <div className={styles.simpleGrid}>
            <Base
              source={source}
              RowTemplate={RowTemplate}
              pagination={staticPagination}
            />
          </div>
          <h3>lists/Base with predefined data</h3>
          <div className={styles.simpleGrid}>
            <Base
              source={source2}
              RowTemplate={RowTemplate}
              pagination={staticPagination}
            />
          </div>
          <h3>lists/Base with predefined data and deserialized state</h3>
          <div className={styles.simpleGrid}>
            <Base
              source={source3}
              RowTemplate={RowTemplate}
              pagination={staticPagination}
            />
          </div>
        </div>
      </>
    </Template>
  );
};
