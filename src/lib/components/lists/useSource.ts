import {useCallback, useEffect, useMemo, useState} from 'react';
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

export const useSource: <ItemType, KeyFieldType>(
  source: ISource<ItemType, KeyFieldType>,
  filter: ICrudFilter<ItemType>[] | undefined,
  pagination: ICrudPagination,
  sorting: ICrudSorting<ItemType>[] | undefined
) => {
  list: ItemType[];
  hasData: boolean;
  error: ICrudStatus;
  meta?: {hasNextPage?: boolean};
} = <ItemType, KeyFieldType>(
  source: ISource<ItemType, KeyFieldType>,
  filter: ICrudFilter<ItemType>[] | undefined,
  pagination: ICrudPagination,
  sorting: ICrudSorting<ItemType>[] | undefined
) => {
  const [loadedData, setLoadedData] = useState(
    source.getSerializationData(filter || [], pagination, sorting)
  );
  const list = (loadedData && (loadedData as ICrudList<ItemType>).data) || [];
  const meta = (loadedData && (loadedData as ICrudList<ItemType>).meta) || {};
  const hasData = !!(loadedData && (loadedData as ICrudList<ItemType>).data);
  const noError = useMemo(()=>({errorCode: CrudErrorCodes.OK}), []);
  const error =
    loadedData && (loadedData as ICrudStatus).errorCode
      ? (loadedData as ICrudStatus)
      : noError;
  const dataLoadingProcess = useMemo(() => {
    return {} as {[propname: string]: {active: boolean; actual: boolean}};
  }, []);
  const unmutableState = useMemo(()=>{
    return {isFirstRender: true};
  }, []);
  const upList = useCallback(async () => {
    const idProcess = JSON.stringify({filter, pagination, sorting});
    const process = dataLoadingProcess[idProcess];
    if (!process || !process.active) {
      Object.keys(dataLoadingProcess).forEach((key) => {
        dataLoadingProcess[key].actual = false;
      });
      dataLoadingProcess[idProcess] = {active: true, actual: true};
      const newList = await source.list(filter || [], pagination, sorting);
      dataLoadingProcess[idProcess].active = false;
      if (dataLoadingProcess[idProcess].actual) setLoadedData(newList);
    }
  }, [source, filter, pagination, sorting, dataLoadingProcess]);
  useEffect(() => {
    const unsubscribes = [
      source.on(CrudEvents.onCreate, upList),
      source.on(CrudEvents.onDelete, upList),
      source.on(CrudEvents.onUpdate, upList),
      source.on(CrudEvents.onChangeCustomQueryParams, upList),
    ];
    if (!unmutableState.isFirstRender) upList();
    return () => {
      unsubscribes.forEach((f) => f());
    };
  }, [source, upList, unmutableState, dataLoadingProcess]);
  useEffect(() => {
    if (unmutableState.isFirstRender) {
      if (!hasData && error.errorCode === CrudErrorCodes.OK) upList();
      unmutableState.isFirstRender = false;
    }
  }, [unmutableState, hasData, upList, error]);
  useEffect(() => {
    return () => {
      Object.keys(dataLoadingProcess).forEach((key) => {
        dataLoadingProcess[key].actual = false;
      });
    };
  }, [dataLoadingProcess]);
  return {
    list,
    meta,
    hasData,
    error,
  };
};
