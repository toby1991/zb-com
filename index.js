const util = require('util');
const _ = require('lodash');
const request = require('request');
// const crypto = require('crypto');
const VError = require('verror');
// const md5 = require('md5');


const CryptoJS = require('crypto-js');


var ZB = function (access_key, secret_key, server, timeout) {
  this.access_key = access_key;
  this.secret_key = secret_key;
  this.server = server || 'https://www.okcoin.cn';
  this.timeout = timeout || 20000;
};

var headers = {"User-Agent": "ZB China JavaScript API Wrapper"};

ZB.prototype.privateRequest = function(method, params, callback) {
    var functionName = 'ZB.privateRequest()',
        self = this;

    if(!this.access_key || !this.secret_key) {
        var error = new VError('%s must provide access_key and secret_key to make this API request.', functionName);
        return callback(error);
    }

    if(!_.isObject(params)) {
        var error = new VError('%s second parameter %s must be an object. If no params then pass an empty object {}', functionName, params);
        return callback(error);
    }

    if (!callback || typeof(callback) != 'function') {
        var error = new VError('%s third parameter needs to be a callback function', functionName);
        return callback(error);
    }

    params.accesskey = this.access_key;
    params.sign = this.signMessage(params);
    var now = new Date();
    params.reqTime = now.getTime();

    var options = {
        url: 'https://trade.zb.com/api/' + method + '?' + formatParameters(params),
        method: 'GET',
        headers: headers,
        timeout: this.timeout,
        //qs: formatParameters(params),
        json: {}        // request will parse the json response into an object
    };

    var requestDesc = util.format('%s request to url %s with method %s and params %s',
        options.method, options.url, method, JSON.stringify(params));

    executeRequest(options, requestDesc, callback);
};

/**
 * This method returns a signature for a request as a md5-encoded uppercase string
 * @param  {Object}  params   The object to encode
 * @return {String}           The request signature
 */
ZB.prototype.signMessage = function getMessageSignature(params) {
    var presign_params = formatParameters(params);
    var secret_key = CryptoJS.SHA1(this.secret_key);
    return _.toString(CryptoJS.HmacMD5(presign_params, _.toString(secret_key)));
};

/**
 * This method returns the parameters as key=value pairs separated by & sorted by the key
 * @param  {Object}  params   The object to encode
 * @return {String}           formatted parameters
 */
function formatParameters(params) {
    var sortedKeys = [],
        formattedParams = '';

    // sort the properties of the parameters
    sortedKeys = _.keys(params).sort();

    // create a string of key value pairs separated by '&' with '=' assignement
    for (i = 0; i < sortedKeys.length; i++) {
        if (i != 0) {
            formattedParams += '&';
        }
        formattedParams += sortedKeys[i] + '=' + params[sortedKeys[i]];
    }

    return formattedParams;
}


ZB.prototype.publicRequest = function(method, params, callback) {
    var functionName = 'ZB.publicRequest()';

    if(!_.isObject(params)) {
        var error = new VError('%s second parameter %s must be an object. If no params then pass an empty object {}', functionName, params);
        return callback(error);
    }

    if (!callback || typeof(callback) != 'function') {
        var error = new VError('%s third parameter needs to be a callback function with err and data parameters', functionName);
        return callback(error);
    }

    var url = 'http://api.zb.com/data/v1/' + method + '?' + formatParameters(params);

    var options = {
        url: url,
        method: 'GET',
        headers: headers,
        timeout: this.timeout,
        //qs: formatParameters(params),
        json: {}        // request will parse the json response into an object
    };

    var requestDesc = util.format('%s request to url %s with parameters %s',
        options.method, options.url, JSON.stringify(params));

    executeRequest(options, requestDesc, callback)
};

function executeRequest(options, requestDesc, callback) {
    var functionName = 'ZB.executeRequest()';

    request(options, function(err, response, data) {
        var error = null,   // default to no errors
            returnObject = data;

        if(err) {
            error = new VError(err, '%s failed %s', functionName, requestDesc);
            error.name = err.code;
        }
        else if (response.statusCode < 200 || response.statusCode >= 300) {
            error = new VError('%s HTTP status code %s returned from %s', functionName,
                response.statusCode, requestDesc);
            error.name = response.statusCode;
        }
        else if (options.form) {
            try {
                returnObject = JSON.parse(data);
            }
            catch(e) {
                error = new VError(e, 'Could not parse response from server: ' + data);
            }
        }
        // if json request was not able to parse json response into an object
        else if (options.json && !_.isObject(data) ) {
            error = new VError('%s could not parse response from %s\nResponse: %s', functionName, requestDesc, data);
        }

        if (_.has(returnObject, 'error_code')) {
            var errorMessage = mapErrorMessage(returnObject.error_code);

            error = new VError('%s %s returned error code %s, message: "%s"', functionName,
                requestDesc, returnObject.error_code, errorMessage);

            error.name = returnObject.error_code;
        }

        callback(error, returnObject);
    });
}

//
// Public Functions
//

ZB.prototype.getTicker = function getTicker(callback, currency) {
    this.publicRequest('ticker', {market: currency}, callback);
};

ZB.prototype.getDepth = function getDepth(callback, market, size, merge) {
    var params = {
        market: market,
        size: 50,
        //merge: 1
    };

    if (!_.isUndefined(size) ) params.size = size;
    if (!_.isUndefined(merge) ) params.merge = merge;

    this.publicRequest('depth', params, callback);
};

ZB.prototype.getTrades = function getTrades(callback, market, since) {
    var params = {market: market};
    if (since) params.since = since;

    this.publicRequest('trades', params, callback);
};

ZB.prototype.getKline = function getKline(callback, market, type, size, since) {
    var params = {market: market};
    if (type) params.type = type;
    if (size) params.size = size;
    if (since) params.since = since;

    this.publicRequest('kline', params, callback);
};
//
// ZB.prototype.getLendDepth = function getLendDepth(callback, market) {
//     this.publicRequest('kline', {market: market}, callback);
// };

//
// Private Functions
//

ZB.prototype.getUserInfo = function getUserInfo(callback) {
    var params = {method: 'getAccountInfo'};
    this.privateRequest('getAccountInfo', params, callback);
};

ZB.prototype.createOrder = function createOrder(callback, currency, type, amount, price) {
    var params = {
        currency: currency,
        tradeType: type == 'buy' ? '1' : '0',
        amount: amount,
        price: price,
    };

    this.privateRequest('order', params, callback);
};

ZB.prototype.cancelOrder = function cancelOrder(callback, currency, order_id) {
    this.privateRequest('cancelOrder', {
        currency: currency,
        id: order_id
    }, callback);
};

ZB.prototype.getOrderInfo = function getOrderInfo(callback, currency, order_id) {
    this.privateRequest('getOrder', {
        currency: currency,
        id: order_id
    }, callback);
};

ZB.prototype.getOrdersNew = function getOrdersNew(callback, currency, type, current_page, page_length) {
    this.privateRequest('getOrdersNew', {
        currency: currency,
        tradeType: type,
        pageIndex: current_page,
        pageSize: page_length
    }, callback);
};


ZB.prototype.getOrderHistory = function getOrderHistory(callback, currency, current_page, page_length) {
    this.privateRequest('getOrdersIgnoreTradeType', {
        currency: currency,
        pageIndex: current_page,
        pageSize: page_length
    }, callback);
};

ZB.prototype.getWithdrawRecord = function getWithdrawRecord(callback, currency, current_page, page_length){
    this.privateRequest('getAccountRecords', {
        currency: currency,
        pageIndex: current_page,
        pageSize: page_length,
    }, callback);
}

ZB.prototype.addWithdraw = function addWithdraw(callback, currency, chargefee, trade_pwd, withdraw_address, withdraw_amount) {
    this.privateRequest('withdraw', {
        currency: currency,
        fees: chargefee,
        safePwd: trade_pwd,
        receiveAddr: withdraw_address,
        amount: withdraw_amount,
        itransfer: 0
    }, callback);
};

/**
 * Maps the ZB error codes to error message
 * @param  {Integer}  error_code   ZB error code
 * @return {String}                error message
 */
function mapErrorMessage(error_code) {
    var errorCodes = {
        1000: '调用成功',
        1001: '一般错误提示',
        1002: '内部错误',
        1003: '验证不通过',
        1004: '资金安全密码锁定',
        1005: '资金安全密码错误，请确认后重新输入。',
        1006: '实名认证等待审核或审核不通过',
        1009: '此接口维护中',
        2001: '人民币账户余额不足',
        2002: '比特币账户余额不足',
        2003: '莱特币账户余额不足',
        2005: '以太币账户余额不足',
        2006: 'ETC币账户余额不足',
        2007: 'BTS币账户余额不足',
        2009: '账户余额不足',
        3001: '挂单没有找到',
        3002: '无效的金额',
        3003: '无效的数量',
        3004: '用户不存在',
        3005: '无效的参数',
        3006: '无效的IP或与绑定的IP不一致',
        3007: '请求时间已失效',
        3008: '交易记录没有找到',
        4001: 'API接口被锁定或未启用',
        4002: '请求过于频繁',};

    if (!errorCodes[error_code]) {
        return 'Unknown ZB error code: ' + error_code;
    }

    return( errorCodes[error_code] );
}

module.exports = ZB;
