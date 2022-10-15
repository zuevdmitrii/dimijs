import React, {Fragment, useEffect, useMemo, useState} from 'react';
import {Button} from '../lib/components/Button';
import {IconButton} from '../lib/components/IconButton';
import {Input} from '../lib/components/Input';
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
  const source = useMemo(() => {
    const listSource = new Static<IDemoData, number>('id');
    // non SOLID, only for test UI
    listSource.delay = 2000;
    return listSource;
  }, []);
  const [value, setValue] = useState('');
  const [uiDisabled, setUiDisabled] = useState(false);
  const [lastId, setLastId] = useState(0);
  const [list, setList] = useState<IDemoData[]>([]);
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
        <h2>Simple list with 2s delay</h2>
        <div className={styles.listDemo}>
          <form onSubmit={ev=>ev.preventDefault()}>
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
                    onClick={()=>source.delete(row.id)}
                  />
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </>
    </Template>
  );
};
