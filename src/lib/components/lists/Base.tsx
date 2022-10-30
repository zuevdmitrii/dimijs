import React from 'react';
import {
  ICrudFilter,
  ICrudPagination,
  ICrudSorting,
} from '../../sources/source';
import {BaseView, IBaseViewProps} from './BaseView';
import {useSource} from './useSource';

export interface IBaseProps<ItemType, KeyFieldType>
  extends Pick<
    IBaseViewProps<ItemType, KeyFieldType>,
    'source' | 'RowTemplate' | 'ErrorTemplate' | 'PreloadTemplate'
  > {
  filter?: ICrudFilter<ItemType>[];
  pagination: ICrudPagination;
  sorting?: ICrudSorting<ItemType>[];
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
  const {list, hasData, error} = useSource(source, filter, pagination, sorting);
  return (
    <BaseView
      source={source}
      list={list}
      hasData={hasData}
      error={error}
      RowTemplate={RowTemplate}
      ErrorTemplate={ErrorTemplate}
      PreloadTemplate={PreloadTemplate}
    />
  );
};
