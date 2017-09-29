import md5 from 'md5';

const directoryPrefixes = {
    'C': 'corporations',
    'UT': 'etexts',
    'I': 'items',
    'L': 'lineages',
    'R': 'offices',
    'P': 'persons',
    'G': 'places',
    'PR': 'products',
    'T': 'topics',
    'W': 'works'
}
const OBJECT_PATH = '/objects';

type APIOptions = {
    server?: string,
    fetch?: (req: Request) => Promise<(res: Response) => void>
}

export default class API {
    _server: string;
    _fetch: (req: Request) => Promise

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            this._fetch = (options.fetch) ? options.fetch : fetch;
        }
    }

    getFileContents(url: string): Promise {
        const req = new Request(url);
        let text;
        return new Promise((resolve, reject) => {
            this._fetch(req).then((response) => {
                response.text().then((reqText) => {
                    text = reqText;
                    resolve(text);
                });
            });
        });
    }
    
    getObjectURL(name: string): string | null {
        let firstChars = null;
        try {
            firstChars = name.match(/^([A-Z]{0,2})/)[0];
        } catch(e) {
            return null;
        }
    
        let dir = directoryPrefixes[firstChars];
        if (!dir) {
            return null;
        }
    
        const checksum = md5(name);
        const objectDir = checksum.substr(0, 2);
    
        let url = [OBJECT_PATH, dir, objectDir, name].join('/') + '.ttl';
        if (this._server) {
            url = this._server + url;
            console.log('server url: %s', url);
        }
        return url;
    }
    
    getObjectData(name: string): Promise<string> | null {
        const url = this.getObjectURL(name);
        if (url) {
            return this.getFileContents(url);
        } else {
            return null;
        }
        
    }
}

