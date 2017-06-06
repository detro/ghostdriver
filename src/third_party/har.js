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
            endReply = resource.endReply,
            error = resource.error;

        if (!request) {
            return;
        }

        // Exclude Data URI from HAR file because
        // they aren't included in specification
        if (request.url.match(/(^data:image\/.*)/i)) {
            return;
        }

        if (error) {
            // according to http://qt-project.org/doc/qt-4.8/qnetworkreply.html
            // Synchronised with browsermob-proxy.
            switch (error.errorCode) {
                case 1:
                    error.errorCode = "CONNECTION_REFUSED";
                    break;
                case 2:
                    error.errorCode = "CONNECTION_CLOSED";
                    break;
                case 3:
                    error.errorCode = "UNKNOWN_HOST";
                    break;
                case 4:
                    error.errorCode = "CONNECTION_TIMED_OUT";
                    break;
                case 5:
                    error.errorCode = "OPERATION_CANCELLED";
                    break;
                case 6:
                    error.errorCode = "SSL";
                    break;
                default:
                    error.errorCode = "CONNECTION_GENERIC";
                    break;
            }
        }

        var entry = {
            startedDateTime: request.time.toISOString(),
            time: null,
            state: "wait",
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
                status: -999,
                statusText: null,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: {},
                redirectURL: "",
                headersSize: -1,
                bodySize: null,
                content: {
                    size: null,
                    mimeType: null
                },
                error: {}
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: -1,
                receive: -1,
                ssl: -1
            },
            pageref: page.url
        };

        function fillInHeaders (reply) {
            entry.response.status = reply.status;
            entry.response.statusText = reply.statusText;
            entry.response.headers = reply.headers;
            entry.response.content.mimeType = reply.contentType;
            entry.response.bodySize = reply.bodySize;
            entry.response.content.size = reply.bodySize;
        }

        if (startReply) {
            entry.timings.wait = startReply.time - request.time;
            entry.state = "receive";
            fillInHeaders(startReply);
        }

        if (error) {
            entry.response.status = -998;
            entry.response.statusText = error.errorString;
            entry.response.error.code = error.errorCode;
            entry.response.error.message = error.errorString;
        } else if (endReply) {
            entry.time = endReply.time - request.time;
            if (startReply) {
                // Certain requests (redirects, synchronous AJAX requests) will not receive
                // onResourceReceived with stage "start".
                entry.timings.receive = endReply.time - startReply.time;
            } else {
                fillInHeaders(endReply);
            }
        }

        entries.push(entry);
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
                startedDateTime: (page.startTime instanceof Date)
                    ? page.startTime.toISOString() : null,
                id: page.url,
                title: page.title,
                pageTimings: {
                    onLoad: (page.startTime instanceof Date && page.endTime instanceof Date)
                        ? page.endTime.getTime() - page.startTime.getTime() : null
                }
            }],
            entries: entries
        }
    };
};
