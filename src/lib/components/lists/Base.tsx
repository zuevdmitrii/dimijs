import React, {useEffect, useMemo, useState} from 'react';
import {
  CrudErrorCodes,
  CrudEvents,
  ICrudFilter,
  ICrudList,
  ICrudPagination,
  ICrudSorting,
  ICrudStatus,
  ISource,
} from '../../sources/source';

interface IBaseProps<ItemType, KeyFieldType> {
  source: ISource<ItemType, KeyFieldType>;
  filter?: ICrudFilter<ItemType>[];
  pagination: ICrudPagination;
  sorting?: ICrudSorting<ItemType>[];
  RowTemplate: (props: {
    item: ItemType;
    source: ISource<ItemType, KeyFieldType>;
  }) => JSX.Element;
  PreloadTemplate?: () => JSX.Element;
  ErrorTemplate?: (props: {error: ICrudStatus}) => JSX.Element;
}
export const Base: <ItemType, KeyFieldType>(
  props: IBaseProps<ItemType, KeyFieldType>
) => JSX.Element = <ItemType, KeyFieldType>(
  props: IBaseProps<ItemType, KeyFieldType>
) => {
  const {
    source,
    pagination,
    filter,
    sorting,
    RowTemplate,
    ErrorTemplate,
    PreloadTemplate,
  } = props;
  const initData = useMemo(() => {
    return source.getSerializationData(filter || [], pagination, sorting);
  }, [source, filter, pagination, sorting]);
  const [list, setList] = useState<ItemType[]>(
    initData && (initData as ICrudList<ItemType>).data
      ? (initData as ICrudList<ItemType>).data
      : []
  );
  const [hasData, setHasData] = useState(
    !!(initData && (initData as ICrudList<ItemType>).data)
  );
  const [error, setError] = useState(
    initData && (initData as ICrudStatus).errorCode
      ? (initData as ICrudStatus)
      : {errorCode: CrudErrorCodes.OK}
  );
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    const upList = async () => {
      const newList = await source.list(filter || [], pagination, sorting);
      if ((newList as ICrudStatus).errorCode) {
        setList([]);
        setError(newList as ICrudStatus);
      } else {
        setError({errorCode: CrudErrorCodes.OK});
        setList((newList as ICrudList<ItemType>).data);
        setHasData(true);
      }
    };
    const unsubscribes = [
      source.on(CrudEvents.onCreate, upList),
      source.on(CrudEvents.onDelete, upList),
      source.on(CrudEvents.onUpdate, upList),
    ];
    if (isFirstRender && !hasData) {
      setIsFirstRender(false);
      upList();
    }
    return () => void unsubscribes.forEach((f) => f());
  }, [source, filter, pagination, sorting, hasData, isFirstRender]);
  if (error.errorCode) {
    return <>{ErrorTemplate ? <ErrorTemplate error={error} /> : null}</>;
  }
  if (!hasData) {
    return <>{PreloadTemplate ? <PreloadTemplate /> : null}</>;
  }
  return (
    <>
      {list.map((row) => {
        return (
          <RowTemplate
            item={row}
            key={String(row[source.keyField])}
            source={source}
          />
        );
      })}
    </>
  );
};
