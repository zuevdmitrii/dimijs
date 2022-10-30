import React, {useEffect, useMemo, useState} from 'react';
import {ICrudFilter, ICrudSorting, ISource} from '../../sources/source';
import {useLocationSearch} from '../../utils/locationSearch';
import {BaseView, IBaseViewProps} from './BaseView';
import {Pagination} from './Pagination';
import {useSource} from './useSource';
import styles from './Grid.module.scss';
import {GridBaseRow, IGridColumn} from './GridBaseRow';

interface IGridProps<ItemType, KeyFieldType>
  extends Pick<
    IBaseViewProps<ItemType, KeyFieldType>,
    'ErrorTemplate' | 'source' | 'PreloadTemplate'
  > {
  columns: IGridColumn<ItemType, KeyFieldType>[];
  pagination: {
    queryParamPage?: string;
    queryParamCountOnPage?: string;
    defaultCountPage: number;
    defaultPage?: number;
  };
}

export const Grid = <ItemType, KeyFieldType>({
  columns,
  pagination,
  ...props
}: IGridProps<ItemType, KeyFieldType>) => {
  const {params} = useLocationSearch();
  const queryParamPage =
    pagination.queryParamPage && Number(params[pagination.queryParamPage]);
  const queryParamCountOnPage =
    pagination.queryParamCountOnPage &&
    Number(params[pagination.queryParamCountOnPage]);
  const [paginationState, setPaginationState] = useState({
    page: queryParamPage || pagination.defaultPage || 0,
    countOnPage: queryParamCountOnPage || pagination.defaultCountPage,
  });
  const [filter, setFilter] = useState([] as ICrudFilter<ItemType>[]);
  const [sorting, setSorting] = useState([] as ICrudSorting<ItemType>[]);
  // TODO:: add filter processing
  // TODO:: add sorting processing
  console.log(setFilter, setSorting); // for linter :)
  const {list, hasData, error, meta} = useSource(
    props.source,
    filter,
    paginationState,
    sorting
  );
  useEffect(() => {
    let newPage = pagination.queryParamPage ? Number(queryParamPage) : -1;
    let newCountOnPage = pagination.queryParamCountOnPage
      ? Number(queryParamCountOnPage) || pagination.defaultCountPage
      : -1;
    setPaginationState((oldState) => {
      return {
        page: newPage > -1 ? newPage : oldState.page,
        countOnPage:
          newCountOnPage > -1 ? newCountOnPage : oldState.countOnPage,
      };
    });
  }, [queryParamPage, pagination, queryParamCountOnPage]);
  const cssVars: any = useMemo(() => {
    return {
      '--columnCount': columns.length,
    };
  }, [columns]);
  const RowTemplateWithColumns = useMemo(() => {
    return (props: {
      item: ItemType;
      source: ISource<ItemType, KeyFieldType>;
    }) => {
      return <GridBaseRow {...props} columns={columns} />;
    };
  }, [columns]);
  return (
    <div className={styles.root} style={cssVars}>
      <div className={styles.grid}>
        <BaseView
          list={list}
          hasData={hasData}
          error={error}
          {...props}
          RowTemplate={RowTemplateWithColumns}
        />
      </div>
      <Pagination
        page={paginationState.page}
        countOnPage={paginationState.countOnPage}
        hasNextPage={meta?.hasNextPage || false}
        queryParamPage={pagination.queryParamPage}
        onChangePage={page=>{
          if (!pagination.queryParamPage) {
            setPaginationState((oldState) => {
              return {
                page: page,
                countOnPage: oldState.countOnPage,
              };
            });
          }
        }}
      />
    </div>
  );
};
