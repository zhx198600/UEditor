






















var T,
    baidu = T = baidu || {version: "1.5.0"};
baidu.guid = "$BAIDU$";
baidu.$$ = window[baidu.guid] = window[baidu.guid] || {global:{}};





baidu.flash = baidu.flash || {};





baidu.dom = baidu.dom || {};














baidu.dom.g = function(id) {
    if (!id) return null;
    if ('string' == typeof id || id instanceof String) {
        return document.getElementById(id);
    } else if (id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
    }
    return null;
};
baidu.g = baidu.G = baidu.dom.g;







baidu.array = baidu.array || {};


















baidu.each = baidu.array.forEach = baidu.array.each = function (source, iterator, thisObject) {
    var returnValue, item, i, len = source.length;

    if ('function' == typeof iterator) {
        for (i = 0; i < len; i++) {
            item = source[i];
            returnValue = iterator.call(thisObject || source, item, i);

            if (returnValue === false) {
                break;
            }
        }
    }
    return source;
};





baidu.lang = baidu.lang || {};













baidu.lang.isFunction = function (source) {
    return '[object Function]' == Object.prototype.toString.call(source);
};













baidu.lang.isString = function (source) {
    return '[object String]' == Object.prototype.toString.call(source);
};
baidu.isString = baidu.lang.isString;






baidu.browser = baidu.browser || {};
















baidu.browser.opera = /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(navigator.userAgent) ?  + ( RegExp["\x246"] || RegExp["\x242"] ) : undefined;





















baidu.dom.insertHTML = function (element, position, html) {
    element = baidu.dom.g(element);
    var range,begin;
    if (element.insertAdjacentHTML && !baidu.browser.opera) {
        element.insertAdjacentHTML(position, html);
    } else {
        range = element.ownerDocument.createRange();
        position = position.toUpperCase();
        if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
            range.selectNodeContents(element);
            range.collapse(position == 'AFTERBEGIN');
        } else {
            begin = position == 'BEFOREBEGIN';
            range[begin ? 'setStartBefore' : 'setEndAfter'](element);
            range.collapse(begin);
        }
        range.insertNode(range.createContextualFragment(html));
    }
    return element;
};

baidu.insertHTML = baidu.dom.insertHTML;





baidu.swf = baidu.swf || {};









baidu.swf.version = (function () {
    var n = navigator;
    if (n.plugins && n.mimeTypes.length) {
        var plugin = n.plugins["Shockwave Flash"];
        if (plugin && plugin.description) {
            return plugin.description
                    .replace(/([a-zA-Z]|\s)+/, "")
                    .replace(/(\s)+r/, ".") + ".0";
        }
    } else if (window.ActiveXObject && !window.opera) {
        for (var i = 12; i >= 2; i--) {
            try {
                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
                if (c) {
                    var version = c.GetVariable("$version");
                    return version.replace(/WIN/g,'').replace(/,/g,'.');
                }
            } catch(e) {}
        }
    }
})();





baidu.string = baidu.string || {};
















baidu.string.encodeHTML = function (source) {
    return String(source)
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
};

baidu.encodeHTML = baidu.string.encodeHTML;

baidu.swf.createHTML = function (options) {
    options = options || {};
    var version = baidu.swf.version,
        needVersion = options['ver'] || '6.0.0',
        vUnit1, vUnit2, i, k, len, item, tmpOpt = {},
        encodeHTML = baidu.string.encodeHTML;
    for (k in options) {
        tmpOpt[k] = options[k];
    }
    options = tmpOpt;
    if (version) {
        version = version.split('.');
        needVersion = needVersion.split('.');
        for (i = 0; i < 3; i++) {
            vUnit1 = parseInt(version[i], 10);
            vUnit2 = parseInt(needVersion[i], 10);
            if (vUnit2 < vUnit1) {
                break;
            } else if (vUnit2 > vUnit1) {
                return '';
            }
        }
    } else {
        return '';
    }

    var vars = options['vars'],
        objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
    options['align'] = options['align'] || 'middle';
    options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
    options['codebase'] = 'https://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
    options['movie'] = options['url'] || '';
    delete options['vars'];
    delete options['url'];
    if ('string' == typeof vars) {
        options['flashvars'] = vars;
    } else {
        var fvars = [];
        for (k in vars) {
            item = vars[k];
            fvars.push(k + "=" + encodeURIComponent(item));
        }
        options['flashvars'] = fvars.join('&');
    }
    var str = ['<object '];
    for (i = 0, len = objProperties.length; i < len; i++) {
        item = objProperties[i];
        str.push(' ', item, '="', encodeHTML(options[item]), '"');
    }
    str.push('>');
    var params = {
        'wmode'             : 1,
        'scale'             : 1,
        'quality'           : 1,
        'play'              : 1,
        'loop'              : 1,
        'menu'              : 1,
        'salign'            : 1,
        'bgcolor'           : 1,
        'base'              : 1,
        'allowscriptaccess' : 1,
        'allownetworking'   : 1,
        'allowfullscreen'   : 1,
        'seamlesstabbing'   : 1,
        'devicefont'        : 1,
        'swliveconnect'     : 1,
        'flashvars'         : 1,
        'movie'             : 1
    };

    for (k in options) {
        item = options[k];
        k = k.toLowerCase();
        if (params[k] && (item || item === false || item === 0)) {
            str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
        }
    }
    options['src']  = options['movie'];
    options['name'] = options['id'];
    delete options['id'];
    delete options['movie'];
    delete options['classid'];
    delete options['codebase'];
    options['type'] = 'application/x-shockwave-flash';
    options['pluginspage'] = 'https://www.macromedia.com/go/getflashplayer';
    str.push('<embed');
    var salign;
    for (k in options) {
        item = options[k];
        if (item || item === false || item === 0) {
            if ((new RegExp("^salign\x24", "i")).test(k)) {
                salign = item;
                continue;
            }

            str.push(' ', k, '="', encodeHTML(item), '"');
        }
    }

    if (salign) {
        str.push(' salign="', encodeHTML(salign), '"');
    }
    str.push('></embed></object>');

    return str.join('');
};


baidu.swf.create = function (options, target) {
    options = options || {};
    var html = baidu.swf.createHTML(options)
               || options['errorMessage']
               || '';

    if (target && 'string' == typeof target) {
        target = document.getElementById(target);
    }
    baidu.dom.insertHTML( target || document.body ,'beforeEnd',html );
};
baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;

baidu.array.remove = function (source, match) {
    var len = source.length;

    while (len--) {
        if (len in source && source[len] === match) {
            source.splice(len, 1);
        }
    }
    return source;
};

baidu.lang.isArray = function (source) {
    return '[object Array]' == Object.prototype.toString.call(source);
};



baidu.lang.toArray = function (source) {
    if (source === null || source === undefined)
        return [];
    if (baidu.lang.isArray(source))
        return source;
    if (typeof source.length !== 'number' || typeof source === 'string' || baidu.lang.isFunction(source)) {
        return [source];
    }
    if (source.item) {
        var l = source.length, array = new Array(l);
        while (l--)
            array[l] = source[l];
        return array;
    }

    return [].slice.call(source);
};

baidu.swf.getMovie = function (name) {
	var movie = document[name], ret;
    return baidu.browser.ie == 9 ?
    	movie && movie.length ?
    		(ret = baidu.array.remove(baidu.lang.toArray(movie),function(item){
    			return item.tagName.toLowerCase() != "embed";
    		})).length == 1 ? ret[0] : ret
    		: movie
    	: movie || window[name];
};


baidu.flash._Base = (function(){

    var prefix = 'bd__flash__';

    function _createString(){
        return  prefix + Math.floor(Math.random() * 2147483648).toString(36);
    };

    function _checkReady(target){
        if(typeof target !== 'undefined' && typeof target.flashInit !== 'undefined' && target.flashInit()){
            return true;
        }else{
            return false;
        }
    };

    function _callFn(callQueue, target){
        var result = null;

        callQueue = callQueue.reverse();
        baidu.each(callQueue, function(item){
            result = target.call(item.fnName, item.params);
            item.callBack(result);
        });
    };

    function _createFunName(fun){
        var name = '';

        if(baidu.lang.isFunction(fun)){
            name = _createString();
            window[name] = function(){
                fun.apply(window, arguments);
            };

            return name;
        }else if(baidu.lang.isString){
            return fun;
        }
    };

    function _render(options){
        if(!options.id){
            options.id = _createString();
        }

        var container = options.container || '';
        delete(options.container);

        baidu.swf.create(options, container);

        return baidu.swf.getMovie(options.id);
    };

    return function(options, callBack){
        var me = this,
            autoRender = (typeof options.autoRender !== 'undefined' ? options.autoRender : true),
            createOptions = options.createOptions || {},
            target = null,
            isReady = false,
            callQueue = [],
            timeHandle = null,
            callBack = callBack || [];

        me.render = function(){
            target = _render(createOptions);

            if(callBack.length > 0){
                baidu.each(callBack, function(funName, index){
                    callBack[index] = _createFunName(options[funName] || new Function());
                });
            }
            me.call('setJSFuncName', [callBack]);
        };

        me.isReady = function(){
            return isReady;
        };

        me.call = function(fnName, params, callBack){
            if(!fnName) return null;
            callBack = callBack || new Function();

            var result = null;

            if(isReady){
                result = target.call(fnName, params);
                callBack(result);
            }else{
                callQueue.push({
                    fnName: fnName,
                    params: params,
                    callBack: callBack
                });

                (!timeHandle) && (timeHandle = setInterval(_check, 200));
            }
        };

        me.createFunName = function(fun){
            return _createFunName(fun);
        };

        function _check(){
            if(_checkReady(target)){
                clearInterval(timeHandle);
                timeHandle = null;
                _call();

                isReady = true;
            }
        };

        function _call(){
            _callFn(callQueue, target);
            callQueue = [];
        }

        autoRender && me.render();
    };
})();



baidu.flash.imageUploader = baidu.flash.imageUploader || function(options){

    var me = this,
        options = options || {},
        _flash = new baidu.flash._Base(options, [
            'selectFileCallback',
            'exceedFileCallback',
            'deleteFileCallback',
            'startUploadCallback',
            'uploadCompleteCallback',
            'uploadErrorCallback',
            'allCompleteCallback',
            'changeFlashHeight'
        ]);
    me.upload = function(){
        _flash.call('upload');
    };

    me.pause = function(){
        _flash.call('pause');
    };
    me.addCustomizedParams = function(index,obj){
        _flash.call('addCustomizedParams',[index,obj]);
    }
};

baidu.object = baidu.object || {};


baidu.extend =
baidu.object.extend = function (target, source) {
    for (var p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }

    return target;
};





baidu.flash.fileUploader = baidu.flash.fileUploader || function(options){
    var me = this,
        options = options || {};

    options.createOptions = baidu.extend({
        wmod: 'transparent'
    },options.createOptions || {});

    var _flash = new baidu.flash._Base(options, [
        'selectFile',
        'exceedMaxSize',
        'deleteFile',
        'uploadStart',
        'uploadComplete',
        'uploadError',
        'uploadProgress'
    ]);

    _flash.call('setMaxNum', options.maxNum ? [options.maxNum] : [1]);

    me.setHandCursor = function(isCursor){
        _flash.call('setHandCursor', [isCursor || false]);
    };

    me.setMSFunName = function(fun){
        _flash.call('setMSFunName',[_flash.createFunName(fun)]);
    };

    me.upload = function(url, fieldName, postData, index){

        if(typeof url !== 'string' || typeof fieldName !== 'string') return null;
        if(typeof index === 'undefined') index = -1;

        _flash.call('upload', [url, fieldName, postData, index]);
    };

    me.cancel = function(index){
        if(typeof index === 'undefined') index = -1;
        _flash.call('cancel', [index]);
    };

    me.deleteFile = function(index, callBack){

        var callBackAll = function(list){
                callBack && callBack(list);
            };

        if(typeof index === 'undefined'){
            _flash.call('deleteFilesAll', [], callBackAll);
            return;
        };

        if(typeof index === 'Number') index = [index];
        index.sort(function(a,b){
            return b-a;
        });
        baidu.each(index, function(item){
            _flash.call('deleteFileBy', item, callBackAll);
        });
    };

    me.addFileType = function(type){
        var type = type || [[]];

        if(type instanceof Array) type = [type];
        else type = [[type]];
        _flash.call('addFileTypes', type);
    };

    me.setFileType = function(type){
        var type = type || [[]];

        if(type instanceof Array) type = [type];
        else type = [[type]];
        _flash.call('setFileTypes', type);
    };

    me.setMaxNum = function(num){
        _flash.call('setMaxNum', [num]);
    };

    me.setMaxSize = function(num){
        _flash.call('setMaxSize', [num]);
    };

    me.getFileAll = function(callBack){
        _flash.call('getFileAll', [], callBack);
    };

    me.getFileByIndex = function(index, callBack){
        _flash.call('getFileByIndex', [], callBack);
    };

    me.getStatusByIndex = function(index, callBack){
        _flash.call('getStatusByIndex', [], callBack);
    };
};

baidu.sio = baidu.sio || {};

baidu.sio._createScriptTag = function(scr, url, charset){
    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(scr);
};

baidu.sio._removeScriptTag = function(scr){
    if (scr.clearAttributes) {
        scr.clearAttributes();
    } else {
        for (var attr in scr) {
            if (scr.hasOwnProperty(attr)) {
                delete scr[attr];
            }
        }
    }
    if(scr && scr.parentNode){
        scr.parentNode.removeChild(scr);
    }
    scr = null;
};


baidu.sio.callByBrowser = function (url, opt_callback, opt_options) {
    var scr = document.createElement("SCRIPT"),
        scriptLoaded = 0,
        options = opt_options || {},
        charset = options['charset'],
        callback = opt_callback || function(){},
        timeOut = options['timeOut'] || 0,
        timer;
    scr.onload = scr.onreadystatechange = function () {
        if (scriptLoaded) {
            return;
        }

        var readyState = scr.readyState;
        if ('undefined' == typeof readyState
            || readyState == "loaded"
            || readyState == "complete") {
            scriptLoaded = 1;
            try {
                callback();
                clearTimeout(timer);
            } finally {
                scr.onload = scr.onreadystatechange = null;
                baidu.sio._removeScriptTag(scr);
            }
        }
    };

    if( timeOut ){
        timer = setTimeout(function(){
            scr.onload = scr.onreadystatechange = null;
            baidu.sio._removeScriptTag(scr);
            options.onfailure && options.onfailure();
        }, timeOut);
    }

    baidu.sio._createScriptTag(scr, url, charset);
};

baidu.sio.callByServer = function(url, callback, opt_options) {
    var scr = document.createElement('SCRIPT'),
        prefix = 'bd__cbs__',
        callbackName,
        callbackImpl,
        options = opt_options || {},
        charset = options['charset'],
        queryField = options['queryField'] || 'callback',
        timeOut = options['timeOut'] || 0,
        timer,
        reg = new RegExp('(\\?|&)' + queryField + '=([^&]*)'),
        matches;

    if (baidu.lang.isFunction(callback)) {
        callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
        window[callbackName] = getCallBack(0);
    } else if(baidu.lang.isString(callback)){
        callbackName = callback;
    } else {
        if (matches = reg.exec(url)) {
            callbackName = matches[2];
        }
    }

    if( timeOut ){
        timer = setTimeout(getCallBack(1), timeOut);
    }
    url = url.replace(reg, '\x241' + queryField + '=' + callbackName);

    if (url.search(reg) < 0) {
        url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
    }
    baidu.sio._createScriptTag(scr, url, charset);

    function getCallBack(onTimeOut){
        return function(){
            try {
                if( onTimeOut ){
                    options.onfailure && options.onfailure();
                }else{
                    callback.apply(window, arguments);
                    clearTimeout(timer);
                }
                window[callbackName] = null;
                delete window[callbackName];
            } catch (exception) {
            } finally {
                baidu.sio._removeScriptTag(scr);
            }
        }
    }
};

baidu.sio.log = function(url) {
  var img = new Image(),
      key = 'tangram_sio_log_' + Math.floor(Math.random() *
            2147483648).toString(36);
  window[key] = img;

  img.onload = img.onerror = img.onabort = function() {
    img.onload = img.onerror = img.onabort = null;

    window[key] = null;
    img = null;
  };
  img.src = url;
};



baidu.json = baidu.json || {};

baidu.json.parse = function (data) {
    return (new Function("return (" + data + ")"))();
};
baidu.json.decode = baidu.json.parse;

baidu.json.stringify = (function () {
    var escapeMap = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"' : '\\"',
        "\\": '\\\\'
    };

    function encodeString(source) {
        if (/["\\\x00-\x1f]/.test(source)) {
            source = source.replace(
                /["\\\x00-\x1f]/g,
                function (match) {
                    var c = escapeMap[match];
                    if (c) {
                        return c;
                    }
                    c = match.charCodeAt();
                    return "\\u00"
                            + Math.floor(c / 16).toString(16)
                            + (c % 16).toString(16);
                });
        }
        return '"' + source + '"';
    }

    function encodeArray(source) {
        var result = ["["],
            l = source.length,
            preComma, i, item;

        for (i = 0; i < l; i++) {
            item = source[i];

            switch (typeof item) {
            case "undefined":
            case "function":
            case "unknown":
                break;
            default:
                if(preComma) {
                    result.push(',');
                }
                result.push(baidu.json.stringify(item));
                preComma = 1;
            }
        }
        result.push("]");
        return result.join("");
    }

    function pad(source) {
        return source < 10 ? '0' + source : source;
    }

    function encodeDate(source){
        return '"' + source.getFullYear() + "-"
                + pad(source.getMonth() + 1) + "-"
                + pad(source.getDate()) + "T"
                + pad(source.getHours()) + ":"
                + pad(source.getMinutes()) + ":"
                + pad(source.getSeconds()) + '"';
    }

    return function (value) {
        switch (typeof value) {
        case 'undefined':
            return 'undefined';

        case 'number':
            return isFinite(value) ? String(value) : "null";

        case 'string':
            return encodeString(value);

        case 'boolean':
            return String(value);

        default:
            if (value === null) {
                return 'null';
            } else if (value instanceof Array) {
                return encodeArray(value);
            } else if (value instanceof Date) {
                return encodeDate(value);
            } else {
                var result = ['{'],
                    encode = baidu.json.stringify,
                    preComma,
                    item;

                for (var key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        item = value[key];
                        switch (typeof item) {
                        case 'undefined':
                        case 'unknown':
                        case 'function':
                            break;
                        default:
                            if (preComma) {
                                result.push(',');
                            }
                            preComma = 1;
                            result.push(encode(key) + ':' + encode(item));
                        }
                    }
                }
                result.push('}');
                return result.join('');
            }
        }
    };
})();

baidu.json.encode = baidu.json.stringify;
