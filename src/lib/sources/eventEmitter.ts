type TCallback<Events> = (event: keyof Events, ...args: any) => void;

export class EventEmitter<Events> {
  private handlers: {[Property in keyof Events]?: TCallback<Events>[]} = {};
  on: (event: keyof Events, callback: TCallback<Events>) => () => void = (
    event,
    callback
  ) => {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event]?.push(callback);
    return () => {
      const index = this.handlers[event]?.indexOf(callback);
      if (index!==undefined && index>-1)
        this.handlers[event]?.splice(index, 1);
    };
  };
  fire: (event: keyof Events, ...args: any) => void = (event, ...args) => {
    if (this.handlers[event]) {
      this.handlers[event]?.forEach((f) => f(event, ...args));
    }
  };
}
