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
  type: CrudFilterFieldTypes.Aggregation,
  aggregation: CrudAggregation;
  filter: ICrudFilter<ItemType>[];
}
export type ICrudFilter<ItemType> = 
  ICrudAggregationFilterField<ItemType> | ICrudFilterField<ItemType, keyof ItemType>;

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
  meta: {
    hasNextPage?: boolean;
  };
}
export enum CrudEvents {
  onCreate = 'onCreate',
  onDelete = 'onDelete',
  onUpdate = 'onUpdate',
}

export interface ISource<ItemType, KeyFieldType> {
  create: (items: ItemType[]) => Promise<ICrudStatus>;
  read: (id: KeyFieldType) => Promise<ItemType | ICrudStatus | null>;
  update: (data: {
    [Property in keyof ItemType]+?: ItemType[Property];
  }) => Promise<ICrudStatus>;
  delete: (id: KeyFieldType) => Promise<ICrudStatus>;
  list: (
    filter: ICrudFilter<ItemType>[],
    pagination: ICrudPagination,
    sorting?: ICrudSorting<ItemType>[],
  ) => Promise<ICrudList<ItemType> | ICrudStatus>;
  on: (
    event: CrudEvents,
    callback: (
      event: CrudEvents,
      data: ItemType[]
    ) => void
  ) => () => void;
}
