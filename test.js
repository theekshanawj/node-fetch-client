const fetch = require('node-fetch');
const APIClient = require('./index');
const { to } = require('./utils');

jest.mock('node-fetch');

describe('Node Fetch Api Client tests', () => {

    describe('APIClient tests', () => {

        it('should be able to create a new API client that support all http method', () => {
            const apiClient = new APIClient();
            expect(apiClient).toBeDefined();

            expect(apiClient.get).toBeDefined();
            expect(apiClient.post).toBeDefined();
            expect(apiClient.put).toBeDefined();
            expect(apiClient.patch).toBeDefined();
            expect(apiClient.head).toBeDefined();
            expect(apiClient.options).toBeDefined();
            expect(apiClient.delete).toBeDefined();
            expect(apiClient.download).toBeDefined();

        });
        it('should call node-fetch with correct url and configs', () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'http:///url.com';
            const configs = {
                query: {},
                headers: {
                    'user-agent': 'agent',
                },
                body: {
                    data: '123',
                },
            };
            const finalConfigs = {
                query: {},
                headers: {
                    'user-agent': 'agent',
                    'content-type': 'application/json',
                },
                body: {
                    data: '123',
                },
                method: 'POST',
            };
            fetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve(), ok: true }));
            apiClient.post(url, configs);
            expect(fetch).toHaveBeenCalledWith(url, finalConfigs);
        });
        it('should return resolving promise when fetch is successful', async () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const body = { data: {} };
            fetch.mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(body),
                ok: true,
            }));
            const result = await apiClient.get(url);
            expect(result).toEqual(body);
        });
        it('should return rejected promise when fetch is successful but response status code is not in 200s', async () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const body = { error: {} };
            fetch.mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(body),
                ok: false,
            }));
            let err;
            try {
                await apiClient.post(url, { body: {} });
            } catch (e) {
                err = e;
            }
            expect(err).toEqual(body);
        });
        it('should return rejected promise when json in fetch fails ', async () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const error = new Error('some error');
            fetch.mockImplementation(() => Promise.resolve({
                json: () => Promise.reject(error),
                ok: false,
            }));
            let err;
            try {
                await apiClient.put(url, {});
            } catch (e) {
                err = e;
            }
            expect(err).toEqual(error);
        });
        it('should return rejected promise when fetch return an error ', async () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const error = new Error('some error');
            fetch.mockImplementation(() => Promise.reject(error));
            let err;
            try {
                await apiClient.delete(url);
            } catch (e) {
                err = e;
            }
            expect(err).toEqual(error);
        });
        it('should return rejected promise when fetch times out', async () => {
            const apiClient = new APIClient({ timeout: 1, headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            fetch.mockImplementation(() => new Promise((resolve) => {
                setTimeout(resolve, 500);
            }));
            let err;
            try {
                await apiClient.get(url);
            } catch (e) {
                err = e;
            }
            expect(err).toEqual(new Error(`Request to ${url} timed out`));
        });
        it('should merge configs passed to Api client', () => {
            const apiClient = new APIClient({ header: { 'content-type': 'application/json', 'user-agent': 'agent' }, body: { text: 'abc' }, timeout: 5000 });
            const url = 'url/';

            fetch.mockImplementation(() => Promise.resolve({ json: () => Promise.resolve(), ok: true }));

            apiClient.post(url, { header: { 'auth': '123' }, body: { params: '123'}, timeout: 120000 });


            const finalConfigs = {
              header: {
                  'content-type': 'application/json',
                  'user-agent': 'agent',
                  'auth': '123',
              },
              body: {
                  text: 'abc',
                  params: '123',
              },
              timeout: 120000,
              method: 'POST'
            };

            expect(fetch).toHaveBeenCalledWith(url, finalConfigs);

        });
        it('should call the node-fetch as post method with url and option when calling download method', () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const options = {
                query: {},
                headers: {
                    'user-agent': '124',
                },
            };
            const finalOptions = {
                query: {},
                headers: {
                    'user-agent': '124',
                    'content-type': 'application/json',
                },
                method: 'POST',
            };
            fetch.mockImplementation(() => Promise.resolve({
                buffer: () => Promise.resolve(),
                ok: true,
            }));
            apiClient.download(url, options);
            expect(fetch).toHaveBeenCalledWith(url, finalOptions);
        });
        it('should call the node-fetch as specified method with url and option when method is specified', () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const options = {
                query: {},
                headers: {
                    'user-agent': '124',
                },
                method: 'PUT',
            };
            const finalOptions = {
                query: {},
                headers: {
                    'user-agent': '124',
                    'content-type': 'application/json',
                },
                method: 'PUT',
            };
            fetch.mockImplementation(() => Promise.resolve({
                buffer: () => Promise.resolve(),
                ok: true,
            }));
            apiClient.download(url, options);
            expect(fetch).toHaveBeenCalledWith(url, finalOptions);
        });
        it('should thrown an error/reject promise when fetch fails', async () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const error = new Error('some error');
            fetch.mockImplementation((() => Promise.reject(error)));
            let err;
            try {
                await apiClient.download(url);
            } catch (e) {
                err = e;
            }
            expect(err).toEqual(err);
        });
        it('should return a buffer when fetch is successful', async () => {
            const apiClient = new APIClient({ headers: { 'content-type': 'application/json' } });
            const url = 'some/url';
            const buffer = Buffer.from([2, 6, 7]);
            fetch.mockImplementation(() => Promise.resolve({
                buffer: () => Promise.resolve(buffer),
                ok: true,
            }));
            const result = await apiClient.download(url);
            expect(result).toEqual(buffer);
        });
    });

    describe('Util method tests', () => {

        it('should return [error, result] when to is called', async () => {
            let [err, result] = await to(Promise.resolve('result'));
            expect(err).toBeNull();
            expect(result).toBe('result');

            [err, result] = await to(Promise.reject(new Error('error')));
            expect(err).toEqual(new Error('error'));
            expect(result).toBeNull();

            [err, result] = await to(2);
            expect(err).toEqual(new Error('A Promise is expected'));
            expect(result).toBeNull();

        });
    });
});

