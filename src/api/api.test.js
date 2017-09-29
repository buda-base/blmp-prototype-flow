import api from './api';

const object = 'G843';

const SUCCESS = 'success';

class ResponseMock {
    text() {
        return new Promise((resolve, reject) => {
            resolve(SUCCESS);
        });
    }
}

function fetchMock(req: Request): Promise {
    return new Promise((resolve, reject) => {
        const res = new ResponseMock();
        resolve(res);
    });
}    

describe('API', () => {
    test('Getting object URL', () => {
        const bdrcAPI = new api();
        const expectedUrl = '/objects/places/70/G843.ttl';
        expect(
            bdrcAPI.getObjectURL(object)
        ).toEqual(expectedUrl);
    });

    test('Getting object data', done => {
        const bdrcAPI = new api({
            fetch: fetchMock
        });

        bdrcAPI.getObjectData(object).then((text) => {
            expect(text).toEqual(SUCCESS);
            done();
        });
    });
});