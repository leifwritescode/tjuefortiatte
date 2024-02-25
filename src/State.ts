import { Context, JSONValue, UseStateResult } from "@devvit/public-api";

export default class State<T extends JSONValue> {
  private _state: UseStateResult<T>

  constructor({ useState }: Context, initialState: T | (() => T | Promise<T>)) {
    this._state = useState(initialState)
  }

  get value(): T {
    return this._state[0]
  }

  set value(value: T) {
    this._state[0] = value
    this._state[1](value)
  }
}
