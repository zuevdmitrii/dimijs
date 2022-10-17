import {EventEmitter} from './eventEmitter';

export enum CrudErrorCodes {
  OK = 0,
  ERROR = 1,
}
export interface ICrudStatus {
  errorCode: CrudErrorCodes;
  errorMessage?: string;
}
export enum CrudFilterOperator {
  EQ,
  GT,
  GTE,
  LT,
  LTE,
  NOTEQ,
  LIKE,
}
export enum CrudAggregation {
  AND,
  OR,
}
export enum CrudFilterFieldTypes {
  Aggregation,
  Field,
}
export type ICrudFilterField<ItemType, T extends keyof ItemType> = {
  operator?: CrudFilterOperator;
  field: T;
  value: ItemType[T];
  type: CrudFilterFieldTypes.Field;
};

export interface ICrudAggregationFilterField<ItemType> {
  type: CrudFilterFieldTypes.Aggregation;
  aggregation: CrudAggregation;
  filter: ICrudFilter<ItemType>[];
}
export type ICrudFilter<ItemType> =
  | ICrudAggregationFilterField<ItemType>
  | ICrudFilterField<ItemType, keyof ItemType>;

export interface ICrudPagination {
  page: number;
  countOnPage: number;
}
export interface ICrudSorting<ItemType> {
  field: keyof ItemType;
  direction?: 'DESC' | 'ASC';
}
export interface ICrudList<ItemType> {
  data: ItemType[];
  meta?: {
    hasNextPage?: boolean;
  };
}
export enum CrudEvents {
  onCreate = 'onCreate',
  onDelete = 'onDelete',
  onUpdate = 'onUpdate',
}

export interface ISource<ItemType, KeyFieldType> {
  keyField: keyof ItemType;
  create: (items: ItemType[]) => Promise<ICrudStatus>;
  read: (id: KeyFieldType) => Promise<ItemType | ICrudStatus | null>;
  update: (data: {
    [Property in keyof ItemType]+?: ItemType[Property];
  }) => Promise<ICrudStatus>;
  delete: (id: KeyFieldType) => Promise<ICrudStatus>;
  list: (
    filter: ICrudFilter<ItemType>[],
    pagination: ICrudPagination,
    sorting?: ICrudSorting<ItemType>[]
  ) => Promise<ICrudList<ItemType> | ICrudStatus>;
  // return data from local cache syncroniously for using in component render
  getSerializationData: (
    filter: ICrudFilter<ItemType>[],
    pagination: ICrudPagination,
    sorting?: ICrudSorting<ItemType>[]
  ) => ICrudList<ItemType> | ICrudStatus | null;
  on: (
    event: CrudEvents,
    callback: (event: CrudEvents, data: ItemType[]) => void
  ) => () => void;
}

export class Source<ItemType, KeyFieldType>
  implements ISource<ItemType, KeyFieldType>
{
  protected cache = {} as {
    [propname: string]: ICrudList<ItemType> | ICrudStatus;
  };
  protected eventEmitter = new EventEmitter<{
    [Property in CrudEvents]: Property;
  }>();

  public keyField: keyof ItemType;
  constructor(
    keyField: keyof ItemType,
    deserializedData?: {
      data: ICrudList<ItemType> | ICrudStatus;
      filter?: ICrudFilter<ItemType>[];
      pagination?: ICrudPagination;
      sorting?: ICrudSorting<ItemType>[];
    }
  ) {
    this.keyField = keyField;
    if (
      deserializedData &&
      deserializedData.pagination &&
      deserializedData.filter
    ) {
      const {filter, pagination, sorting} = deserializedData;
      this.cache[JSON.stringify({filter, pagination, sorting})] =
        deserializedData.data;
    }
  }
  getSerializationData: (
    filter: ICrudFilter<ItemType>[],
    pagination: ICrudPagination,
    sorting?: ICrudSorting<ItemType>[]
  ) => ICrudList<ItemType> | ICrudStatus | null = (
    filter,
    pagination,
    sorting
  ) => {
    return this.cache[JSON.stringify({filter, pagination, sorting})] || null;
  };
  on: (
    event: CrudEvents,
    callback: (event: CrudEvents, data: ItemType[]) => void
  ) => () => void = (event, callback) => {
    return this.eventEmitter.on(event, callback);
  };
  create: (items: ItemType[]) => Promise<ICrudStatus> = () => {
    throw new Error('Not implemeted');
  };
  read: (id: KeyFieldType) => Promise<ItemType | ICrudStatus | null> = () => {
    throw new Error('Not implemeted');
  };
  update: (data: {
    [Property in keyof ItemType]+?: ItemType[Property] | undefined;
  }) => Promise<ICrudStatus> = () => {
    throw new Error('Not implemeted');
  };
  delete: (id: KeyFieldType) => Promise<ICrudStatus> = () => {
    throw new Error('Not implemeted');
  };
  list: (
    filter: ICrudFilter<ItemType>[],
    pagination: ICrudPagination,
    sorting?: ICrudSorting<ItemType>[]
  ) => Promise<ICrudStatus | ICrudList<ItemType>> = () => {
    throw new Error('Not implemeted');
  };
}
