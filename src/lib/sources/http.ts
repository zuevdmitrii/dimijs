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
  private customQueryParams: {[propname: string]: string} = {};
  private queryLine = '';
  // will be '${httpEndPoint}/{create|read|update|list}?'
  // create, delete and update = post methods
  // read, list = get
  public httpEndPoint: string = '/crud';
  public setCustomQueryParams = (params: {[propname: string]: string}) => {
    this.customQueryParams = params;
    this.queryLine = '';
    Object.keys(this.customQueryParams).forEach((p) => {
      if (this.queryLine) this.queryLine += '&';
      this.queryLine += `${encodeURIComponent(p)}=${encodeURIComponent(
        this.customQueryParams[p]
      )}`;
    });
    if (this.queryLine) this.queryLine = `?${this.queryLine}`;
  };
  create: (
    items: {
      [Property in keyof ItemType]+?: ItemType[Property];
    }[]
  ) => Promise<ICrudStatus> = (items) => {
    return fetch(`${this.httpEndPoint}/create${this.queryLine}`, {
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
      `${this.httpEndPoint}/read${
        this.queryLine ? `${this.queryLine}&` : '?'
      }${encodeURIComponent(String(this.keyField))}=${encodeURIComponent(
        String(id)
      )}`,
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
    return fetch(`${this.httpEndPoint}/update${this.queryLine}`, {
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
    return fetch(`${this.httpEndPoint}/delete${this.queryLine}`, {
      method: 'POST',
      body: encodeURIComponent(JSON.stringify({[this.keyField]: id})),
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error(response.statusText);
      })
      .then((deleted) => {
        if ((deleted as ICrudStatus).errorCode) return deleted;
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
      `${this.httpEndPoint}/list${
        this.queryLine ? `${this.queryLine}&` : '?'
      }params=${encodeURIComponent(
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
