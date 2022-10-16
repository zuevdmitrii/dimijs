import {EventEmitter} from './eventEmitter';
import {
  CrudAggregation,
  CrudErrorCodes,
  CrudEvents,
  CrudFilterFieldTypes,
  CrudFilterOperator,
  ICrudFilter,
  ICrudList,
  ICrudPagination,
  ICrudSorting,
  ICrudStatus,
  ISource,
} from './source';

export class Static<ItemType, KeyFieldType>
  implements ISource<ItemType, KeyFieldType>
{
  private data = [] as ItemType[];
  private cache = {} as {[propname: string]: ICrudList<ItemType> | ICrudStatus};
  public keyField: keyof ItemType;
  private eventEmitter = new EventEmitter<{
    [Property in CrudEvents]: Property;
  }>();
  public delay: number = 0;
  constructor(
    keyField: keyof ItemType,
    deserializedData?: {
      data: ICrudList<ItemType> | ICrudStatus;
      filter?: ICrudFilter<ItemType>[];
      pagination?: ICrudPagination;
      sorting?: ICrudSorting<ItemType>[];
    }
  ) {
    if (
      deserializedData?.data &&
      (deserializedData?.data as ICrudList<ItemType>).data
    ) {
      this.data = (deserializedData.data as ICrudList<ItemType>).data.slice();
    } else {
      this.data = [];
    }
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
  create: (items: ItemType[]) => Promise<ICrudStatus> = (items) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.data = this.data.concat(items);
        this.eventEmitter.fire(CrudEvents.onCreate, items);
        resolve({
          errorCode: CrudErrorCodes.OK,
        });
      }, this.delay);
    });
  };
  read: (id: KeyFieldType) => Promise<ItemType | ICrudStatus | null> = (id) => {
    return new Promise((resolve) => {
      const row = this.data.find((item) => item[this.keyField] === id);
      resolve(row || null);
    });
  };
  update: (data: {
    [Property in keyof ItemType]+?: ItemType[Property] | undefined;
  }) => Promise<ICrudStatus> = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rowIndex = this.data.findIndex(
          (item) => item[this.keyField] === data[this.keyField]
        );
        if (rowIndex === -1) {
          resolve({
            errorCode: CrudErrorCodes.ERROR,
            errorMessage: `Not found by ${this.keyField.toString()}`,
          });
        } else {
          this.data[rowIndex] = {
            ...this.data[rowIndex],
            ...data,
          };
          this.eventEmitter.fire(CrudEvents.onUpdate, [this.data[rowIndex]]);
          resolve({errorCode: CrudErrorCodes.OK});
        }
      }, this.delay);
    });
  };
  delete: (id: KeyFieldType) => Promise<ICrudStatus> = (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rowIndex = this.data.findIndex(
          (item) => item[this.keyField] === id
        );
        if (rowIndex === -1) {
          resolve({
            errorCode: CrudErrorCodes.ERROR,
            errorMessage: `Not found by ${this.keyField.toString()}`,
          });
        } else {
          const deleted = this.data.splice(rowIndex, 1);
          this.eventEmitter.fire(CrudEvents.onDelete, deleted);
          resolve({errorCode: CrudErrorCodes.OK});
        }
      }, this.delay);
    });
  };
  list: (
    filter: ICrudFilter<ItemType>[],
    pagination: ICrudPagination,
    sorting?: ICrudSorting<ItemType>[]
  ) => Promise<ICrudStatus | ICrudList<ItemType>> = (
    filter,
    pagination,
    sorting
  ) => {
    const generateFilterFunction: (
      filter: ICrudFilter<ItemType>[],
      agg: CrudAggregation
    ) => (item: ItemType) => boolean = (filter, agg) => {
      const conditions = [] as ((item: ItemType) => boolean)[];
      filter.forEach((p) => {
        if (p.type === CrudFilterFieldTypes.Aggregation) {
          conditions.push(generateFilterFunction(p.filter, p.aggregation));
        } else {
          conditions.push((item: ItemType) => {
            switch (p.operator) {
              case CrudFilterOperator.GT:
                return item[p.field] > p.value;
              case CrudFilterOperator.GTE:
                return item[p.field] >= p.value;
              case CrudFilterOperator.LT:
                return item[p.field] < p.value;
              case CrudFilterOperator.LTE:
                return item[p.field] <= p.value;
              case CrudFilterOperator.NOTEQ:
                return item[p.field] !== p.value;
              case CrudFilterOperator.LIKE: {
                if (typeof item[p.field] === 'string')
                  return (item[p.field] as string).indexOf(`${p.value}`) > -1;
                return false;
              }
              case CrudFilterOperator.EQ:
              default:
                return item[p.field] === p.value;
            }
          });
        }
      });
      return (item) => {
        if (agg === CrudAggregation.AND)
          return conditions.every((fn) => fn(item));
        return conditions.some((fn) => fn(item));
      };
    };
    const filterFunction = generateFilterFunction(filter, CrudAggregation.AND);
    return new Promise((resolve) => {
      const filtered = this.data.filter(filterFunction);
      if (sorting) {
        sorting.forEach((sortField) => {
          filtered.sort((itemA, itemB) => {
            const isNum =
              typeof itemA[sortField.field] === 'number' ||
              typeof itemB[sortField.field] === 'number';
            if (isNum) {
              return sortField.direction === 'DESC'
                ? (itemB[sortField.field] as number) -
                    (itemA[sortField.field] as number)
                : (itemA[sortField.field] as number) -
                    (itemB[sortField.field] as number);
            }
            return sortField.direction === 'DESC'
              ? (itemB[sortField.field] as string).localeCompare(
                  itemA[sortField.field] as string
                )
              : (itemA[sortField.field] as string).localeCompare(
                  itemB[sortField.field] as string
                );
          });
        });
      }
      const startIndex = pagination.page * pagination.countOnPage;
      const result = filtered.slice(
        startIndex,
        startIndex + pagination.countOnPage
      );
      setTimeout(() => {
        const forReturn = {
          data: result,
          meta: {
            hasNextPage: !!filtered[startIndex + pagination.countOnPage],
          },
        };
        this.cache[JSON.stringify({filter, pagination, sorting})] = forReturn;
        resolve(forReturn);
      }, this.delay);
    });
  };
}
