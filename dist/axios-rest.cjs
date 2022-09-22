'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Axios = require('axios');
var lodash = require('lodash');
var LocalService = require('localservicejs');
var _typeof = require('@babel/runtime/helpers/typeof');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Axios__default = /*#__PURE__*/_interopDefaultLegacy(Axios);
var LocalService__default = /*#__PURE__*/_interopDefaultLegacy(LocalService);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);

var WorkerHelp = function () {
  function WorkerHelp() {
    this.pendingJobs = {};
  }

  WorkerHelp.prototype.deepAssign = function (args) {
    return args.reduce(deepClone, args[0]);

    function deepClone(target, obj) {
      if (!target) target = Array.isArray(obj) ? [] : {};

      if (obj && _typeof__default["default"](obj) === "object") {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key] && _typeof__default["default"](obj[key]) === "object") {
              target[key] = deepClone(target[key], obj[key]);
            } else {
              target[key] = obj[key];
            }
          }
        }
      }

      return target;
    }
  };

  WorkerHelp.prototype.createWorker = function (f) {
    var _this = this;

    var worker = new Worker(URL.createObjectURL(new Blob(["(".concat(f.toString(), ")()")])));

    worker.onmessage = function (_a) {
      var _b = _a.data,
          result = _b.result,
          jobId = _b.jobId;
      console.log('onmessage', result);

      _this.pendingJobs[jobId](result);

      delete _this.pendingJobs[jobId];
    };

    worker.onerror = function (data) {
      console.log('onerror', data);
    };

    return function () {
      var message = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
      }

      return new Promise(function (resolve) {
        var jobId = String(Math.random());
        _this.pendingJobs[jobId] = resolve;
        worker.postMessage({
          jobId: jobId,
          message: message
        });
      });
    };
  };

  return WorkerHelp;
}();

var wwh = new WorkerHelp();

var Api = function () {
  function Api(baseurl) {
    this.isLocalService = false;
    this.request_interceptor = {
      success: function success(config) {},
      error: function error(err) {}
    };
    this.response_interceptor = {
      success: function success(config) {},
      error: function error(err, response) {}
    };
    this.baseurl = baseurl;
    Axios__default["default"].defaults.baseURL = baseurl;
  }

  Api.prototype.createApi = function (config) {
    this.startInterceptor();
    this.config = JSON.parse(JSON.stringify(config)) || {};
    return api;
  };

  Api.prototype.setRequestInterceptors = function (success, error) {
    this.request_interceptor.success = success;
    this.request_interceptor.error = error;
  };

  Api.prototype.setResponseInterceptors = function (success, error) {
    this.response_interceptor.success = success;
    this.response_interceptor.error = error;
  };

  Api.prototype.startInterceptor = function () {
    var _this = this;

    Axios__default["default"].interceptors.request.use(function (config) {
      config = lodash.assign(config, _this.config);
      config = Object.assign(config, _this.request_interceptor.success.call(_this, config) || {});
      _this.isLocalService && (config = Object.assign(config, _this.mock_interceptors(config) || {}));
      Api.plugins_option.show = true;
      return config;
    }, function (err) {
      err = Object.assign(err, _this.request_interceptor.error.call(_this, err) || err);
      Api.plugins_option.show = false;
      console.log(err);
      return Promise.reject(err);
    });
    Axios__default["default"].interceptors.response.use(function (res) {
      res = Object.assign(res, _this.data_adapter(res));
      res = Object.assign(res, _this.response_interceptor.success.call(_this, res) || {});
      Api.plugins_option.show = false;
      return res;
    }, function (err) {
      err = Object.assign(err, _this.response_interceptor.error(JSON.parse(JSON.stringify(err)), err.response));
      Api.plugins_option.show = false;
      return Promise.reject(err);
    });
  };

  Api.prototype.mock_interceptors = function (config) {
    for (var _i = 0, _a = Api.mockDataList; _i < _a.length; _i++) {
      var i = _a[_i];

      if (i.isLocalService && this.isLocalService && config.method && config.url && (i.affix ? config.url.match("".concat(i.route, "\\d+/").concat(i.affix)) : config.url === i.url) && i.alreadyMockMethod.indexOf(config.method.toLocaleUpperCase()) !== -1) {
        var index = i.alreadyMockMethod.indexOf(config.method.toLocaleUpperCase());

        if (index != -1) {
          var str = i.route + ".*".concat(i.affix ? '/' + i.affix + '/' : '');
          LocalService__default["default"].listener(new RegExp(str), config.method, i.service[index].service);
          console.warn("[LocalService request]method:".concat(i.service[index].methods, "&&url:").concat(i.route));
        }
      }
    }

    return config;
  };

  Api.prototype.data_adapter = function (res) {
    for (var _i = 0, _a = Api.dataAdapter; _i < _a.length; _i++) {
      var i = _a[_i];

      if (res.config.url === i.url || new RegExp("".concat(i.route, "\\d+/").concat(i.affix, "/")).test(res.config.url)) {
        if (i.adapter) {
          return i.adapter(res);
        }
      }
    }

    return res;
  };

  Api.prototype.local_service_on = function (flag) {
    flag && console.warn("warning: method local_service_on of Api is turn on, that any request to server ");
    this.isLocalService = flag;
  };

  Api.mockDataList = [];
  Api.listenerList = [];
  Api.dataAdapter = [];
  Api.paramsList = [];
  Api.validate_results = [];
  Api.plugins_option = {
    show: false
  };
  Api.api_id = 0;
  return Api;
}();

var api = function () {
  function api(route, route1, route2, route3, route4, otherRoute) {
    this.adapter = null;
    this.service = [];
    this.isLocalService = false;
    this.isUseParamsValidate = true;
    this.alreadyMockMethod = [];
    this.alreadyParamsMethod = [];
    this.axios = Axios__default["default"];
    this.listenerMap = {};
    var route_list = [route, route1, route2, route3, route4].concat(otherRoute);
    this.url = this.combination(route_list);
    this.route = this.url.split('#')[0];
    this.affix = this.url.split('#')[1] && this.url.split('#')[1].slice(1, -1) || '';
    this.api_id = Api.api_id++;
  }

  api.prototype.checkArgument = function (route, id) {
    var match = this.url.match('#');

    if (match) {
      if (id !== 0 && !id) {
        throw new Error("".concat(this.url, " \u8C03\u7528\u65F6\u5FC5\u987B\u4F20\u5165id"));
      }
    } else {
      return route;
    }
  };

  api.prototype.setName = function (name) {
    this.name = name;
    return this;
  };

  api.prototype.setDescription = function (description) {
    this.description = description;
    return this;
  };

  api.prototype.createAffixApi = function (affix) {
    return new api(this.route, '#', affix);
  };

  api.prototype.GET = function (params, id, affix) {
    if (params === void 0) {
      params = {};
    }

    return this.axios.get("".concat(this.checkArgument(this.route, id)).concat(id ? id + '/' : '').concat(affix ? affix + '/' : this.affix ? this.affix + '/' : ''), {
      params: params
    });
  };

  api.prototype.POST = function (params, id, affix) {
    if (params === void 0) {
      params = {};
    }

    return this.axios.post("".concat(this.checkArgument(this.route)).concat(id ? id + '/' : '').concat(affix ? affix + '/' : this.affix ? this.affix + '/' : ''), params);
  };

  api.prototype.PUT = function (params, id, affix) {
    if (params === void 0) {
      params = {};
    }

    return this.axios.put("".concat(this.checkArgument(this.route)).concat(id ? id + '/' : '').concat(id ? id + '/' : '').concat(affix ? affix + '/' : this.affix ? this.affix + '/' : ''), params);
  };

  api.prototype.PATCH = function (params, id, affix) {
    if (params === void 0) {
      params = {};
    }

    return this.axios.patch("".concat(this.checkArgument(this.route)).concat(id ? id + '/' : '').concat(id ? id + '/' : '').concat(affix ? affix + '/' : this.affix ? this.affix + '/' : ''), params);
  };

  api.prototype.DELETE = function (id, affix) {
    return this.axios["delete"]("".concat(this.checkArgument(this.route)).concat(id ? id + '/' : '').concat(id ? id + '/' : '').concat(affix ? affix + '/' : this.affix ? this.affix + '/' : ''));
  };

  api.prototype.CUSTOM = function (config, id, affix) {
    return this.axios(Object.assign({
      url: "".concat(this.checkArgument(this.route)).concat(id ? id + '/' : '').concat(id ? id + '/' : '').concat(affix ? affix + '/' : this.affix ? this.affix + '/' : '')
    }, config));
  };

  api.prototype.DOWNLOAD = function (fileName, url) {
    if (fileName === void 0) {
      fileName = 'donwload';
    }

    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('href', url || this.route);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  };

  api.prototype.GET_EXCEL = function (params, id) {
    return this.CUSTOM(Object.assign({
      method: 'get',
      responseType: 'blob'
    }, {
      params: params
    }), id);
  };

  api.prototype.DOWNLOAD_EXCEL = function (res, data) {
    var fileName = res.headers['content-disposition'].split(';')[1].split('filename=')[1].replace('"', '').replace('"', '');
    var url = window.URL.createObjectURL(new Blob([data ? data : res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
    }));
    this.DOWNLOAD(fileName, url);
  };

  api.prototype.UPLOAD_IMG = function (file_list) {
    var formData = new FormData();
    file_list.forEach(function (item) {
      formData.append('file', item.originFileObj);
    });
    return this.POST(formData);
  };

  api.prototype.combination = function (urlList) {
    var url;
    urlList = urlList.filter(function (item) {
      return item;
    });
    urlList.push('');

    if (!urlList[0].match(/^http|^https/i)) {
      urlList.unshift(Axios__default["default"].defaults.baseURL);
    }

    if (urlList[0].match(/\/$/i)) {
      urlList[0] = urlList[0].slice(0, urlList[0].length - 1);
    }

    url = urlList.join('/');

    if (urlList[urlList.length - 2].indexOf('.') != -1) {
      url = url.substring(0, url.length - 1);
    }

    return url;
  };

  api.prototype.setService = function (methods, service) {
    this.service.push({
      methods: methods,
      service: service
    });

    if (this.alreadyMockMethod.indexOf(methods) !== -1) {
      throw Error("".concat(this.name ? this.name : this.url, "\uFF0CApi\u5B9A\u4E49\u4E86\u91CD\u590D\u7684Method, \u786E\u4FDD\u8BE5api\u7684\u6BCF\u79CDmethod\u53EA\u8BBE\u7F6E\u4E86\u4E00\u4E2Amock\u6570\u636E"));
    } else {
      this.alreadyMockMethod.push(methods);
    }

    this.isLocalService = true;
    Api.mockDataList.push(this);
  };

  api.prototype.setWebworker = function (f) {
    this.webworkerInstance = wwh.createWorker(f);
  };

  api.prototype.GET_WORKER = function (params) {
    return this.webworkerInstance(params);
  };

  api.prototype.setAdapter = function (callback) {
    this.adapter = callback;
    Api.dataAdapter.push(this);
  };

  api.prototype.local_service_on = function (flag) {
    this.isLocalService = flag;
    return this;
  };

  api.prototype.getAxios = function () {
    return this.axios;
  };

  api.prototype.listener = function (name, cb) {
    if (this.listenerMap[name]) {
      this.listenerMap[name] = [cb];
      return this;
    } else {
      this.listenerMap[name].push(cb);
      return this;
    }
  };

  api.prototype.dispatch = function (name, data, getter_cb) {
    if (this.listenerMap[name]) {
      this.listenerMap[name].map(function (jitem, k) {
        getter_cb(jitem(data));
      });
    }
  };

  api.prototype.rmListener = function (key) {
    var _this = this;

    Api.listenerList.map(function (item, k) {
      if (item[0].api_id == _this.api_id) {
        item.splice(key, 1);
      }
    });
  };

  return api;
}();

exports.Api = Api;
exports.api = api;
