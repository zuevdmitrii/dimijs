import {
  CrudErrorCodes,
  CrudEvents,
  ICrudFilter,
  ICrudList,
  ICrudPagination,
  ICrudSorting,
  ICrudStatus,
  Source,
} from './source';

export class Http<ItemType, KeyFieldType> extends Source<
  ItemType,
  KeyFieldType
> {
  // will be '${httpEndPoint}/{create|read|update|list}?'
  // create, delete and update = post methods
  // read, list = get
  public httpEndPoint: string = '/crud';
  create: (items: {
    [Property in keyof ItemType]+?: ItemType[Property];
  }[]) => Promise<ICrudStatus> = (items) => {
    return fetch(`${this.httpEndPoint}/create`, {
      method: 'POST',
      body: encodeURIComponent(JSON.stringify(items)),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.statusText);
      })
      .then((created) => {
        this.eventEmitter.fire(CrudEvents.onCreate, created);
        return {errorCode: CrudErrorCodes.OK};
      })
      .catch((reason) => {
        return {errorCode: CrudErrorCodes.ERROR, errorMessage: reason.message};
      });
  };
  read: (id: KeyFieldType) => Promise<ItemType | ICrudStatus | null> = (id) => {
    return fetch(
      `${this.httpEndPoint}/read?${encodeURIComponent(
        String(this.keyField)
      )}=${encodeURIComponent(String(id))}`,
      {
        method: 'GET',
      }
    )
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.statusText);
      })
      .catch((reason) => {
        return {errorCode: CrudErrorCodes.ERROR, errorMessage: reason.message};
      });
  };
  update: (data: {
    [Property in keyof ItemType]+?: ItemType[Property] | undefined;
  }) => Promise<ICrudStatus> = (data) => {
    return fetch(`${this.httpEndPoint}/update`, {
      method: 'POST',
      body: encodeURIComponent(JSON.stringify(data)),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.statusText);
      })
      .then((updated) => {
        this.eventEmitter.fire(CrudEvents.onUpdate, [updated]);
        return {errorCode: CrudErrorCodes.OK};
      })
      .catch((reason) => {
        return {errorCode: CrudErrorCodes.ERROR, errorMessage: reason.message};
      });
  };
  delete: (id: KeyFieldType) => Promise<ICrudStatus> = (id) => {
    return fetch(`${this.httpEndPoint}/delete`, {
      method: 'POST',
      body: encodeURIComponent(JSON.stringify({[this.keyField]: id})),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.statusText);
      })
      .then((deleted) => {
        if ((deleted as ICrudStatus).errorCode)
          return deleted;
        this.eventEmitter.fire(CrudEvents.onDelete, [deleted]);
        return {errorCode: CrudErrorCodes.OK};
      })
      .catch((reason) => {
        return {errorCode: CrudErrorCodes.ERROR, errorMessage: reason.message};
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
    return fetch(
      `${this.httpEndPoint}/list?params=${encodeURIComponent(
        JSON.stringify({filter, pagination, sorting})
      )}`,
      {
        method: 'GET',
      }
    )
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.statusText);
      })
      .then((jsonData) => {
        this.cache[JSON.stringify({filter, pagination, sorting})] = jsonData;
        return jsonData;
      })
      .catch((reason) => {
        return {errorCode: CrudErrorCodes.ERROR, errorMessage: reason.message};
      });
  };
}
