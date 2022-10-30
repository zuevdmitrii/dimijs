import React from 'react';
import {
  ICrudStatus,
  ISource,
} from '../../sources/source';

export interface IBaseViewProps<ItemType, KeyFieldType> {
  source: ISource<ItemType, KeyFieldType>;
  list: ItemType[];
  hasData: boolean;
  error: ICrudStatus;
  RowTemplate: (props: {
    item: ItemType;
    source: ISource<ItemType, KeyFieldType>;
  }) => JSX.Element;
  PreloadTemplate?: () => JSX.Element;
  ErrorTemplate?: (props: {error: ICrudStatus}) => JSX.Element;
}
export const BaseView: <ItemType, KeyFieldType>(
  props: IBaseViewProps<ItemType, KeyFieldType>
) => JSX.Element = <ItemType, KeyFieldType>(
  props: IBaseViewProps<ItemType, KeyFieldType>
) => {
  const {
    source,
    list,
    hasData,
    error,
    RowTemplate,
    ErrorTemplate,
    PreloadTemplate,
  } = props;
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
