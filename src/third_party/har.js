/**
 * Page object
 * @typedef {Object} PageObject
 * @property {String} title - contents of <title> tag
 * @property {String} url - page URL
 * @property {Date} startTime - time when page starts loading
 * @property {Date} endTime - time when onLoad event fires
 */

/**
 * Resource object
 * @typedef {Object} ResourceObject
 * @property {Object} request - PhantomJS request object
 * @property {Object} startReply - PhantomJS response object
 * @property {Object} endReply - PhantomJS response object
 */

/**
 * This function is based on PhantomJS network logging example:
 * https://github.com/ariya/phantomjs/blob/master/examples/netsniff.js
 *
 * @param {PageObject} page
 * @param {ResourceObject} resources
 * @returns {{log: {version: string, creator: {name: string, version: string}, pages: Array, entries: Array}}}
 */
exports.createHar = function (page, resources) {
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        // Exclude Data URI from HAR file because
        // they aren't included in specification
        if (request.url.match(/(^data:image\/.*)/i)) {
            return;
        }

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: page.url
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: page.startTime.toISOString(),
                id: page.url,
                title: page.title,
                pageTimings: {
                    onLoad: page.endTime.getTime() - page.startTime.getTime()
                }
            }],
            entries: entries
        }
    };
};
