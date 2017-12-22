import * as Address from './Address';
import * as LogEntry from './LogEntry';
import * as Note from './Note';

let components = {
    [Address.IRI]: Address.default,
    [LogEntry.IRI]: LogEntry.default,
    [Note.IRI]: Note.default
}

export default components;