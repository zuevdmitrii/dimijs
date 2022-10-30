import React from 'react';
import {ISource} from '../../sources/source';

export interface IGridColumn<ItemType, KeyFieldType> {
  name: string;
  Template?: (props: {
    item: ItemType;
    name: string;
    source: ISource<ItemType, KeyFieldType>;
  }) => JSX.Element;
}

interface IGridBaseRowProps<ItemType, KeyFieldType> {
  item: ItemType;
  columns: IGridColumn<ItemType, KeyFieldType>[];
  source: ISource<ItemType, KeyFieldType>;
}

export const GridBaseRow = <ItemType, KeyFieldType>(
  props: IGridBaseRowProps<ItemType, KeyFieldType>
) => {
  return (
    <>
      {props.columns.map((column) => {
        const Template = column.Template;
        if (Template)
          return (
            <Template
              item={props.item}
              name={column.name}
              key={column.name}
              source={props.source}
            />
          );
        return (
          <div key={column.name}>
            {String(props.item[column.name as keyof ItemType])}
          </div>
        );
      })}
    </>
  );
};
