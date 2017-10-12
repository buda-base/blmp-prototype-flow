// @flow

export type Action = {
    type: string,
    payload?: any,
    error?: Error,
    meta?: any
}
