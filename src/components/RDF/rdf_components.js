import * as Address from './Address';
import * as LogEntry from './LogEntry';
import * as Note from './Note';
import * as PlaceType from './PlaceType';

const components = {
    [Address.IRI]: Address.default,
    [LogEntry.IRI]: LogEntry.default,
    [Note.IRI]: Note.default,
    [PlaceType.IRI]: PlaceType.default
}

export default components;