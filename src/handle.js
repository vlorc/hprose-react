/**
 * Created by kakoyi on 2017-03-20.
 */

function cacheHandler(name, args, context, next) {
    let sync = () => next(name, args, context);

    if (!name.startsWith("cache_")) {
        return sync();
    }
    
    name = name.substr(6);
    if (!this.Storage) {
        return sync();
    }

    let flush = args[args.length - 1] === true;
    if (flush) {
        args.pop();
    }

    args.push(name);
    let key = this.Storage.formatKey(args);
    args.pop();

    if (!flush) {
        return this.Storage.load(key,sync);
    }

    return sync().then((value) => {
        if (value) {
            this.Storage.save(key, value)
        }
        return value;
    });
}

function logHandler(name, args, context, next) {
    let log = this.getState() ? console.debug : function() {};
    log(name, args);
    let res = next(name, args, context);
    res.then(function(result) {
        log(name, args, result);
    });
    return res;
}

function tokenBatchesHandler(batches, context, next) {
    for (let v of batches) {
        if (v.name.startsWith("cache_")) {
            v.name = v.name.substr(6);
        }
        if (!name.startsWith("public_")) {
            v.args.push(this.getToken());
        }
    }
    return next(batches, context);
}

function tokenHandler(name, args, context, next) {
    if (name.startsWith("public_")) {
        return next(name, args, context);
    }
    let token = this.getToken();
    let call = v => {
        args.push(v);
        return next(name, args, context);
    };
    if (token instanceof Promise) {
        return token.then(call);
    }
    return call(token);
}

export default function initRpc(rpc) {
    function setToken(token) {
        return this.token = token;
    }

    function getToken() {
        return this.token ? this.token : this.getDefaultToken();
    }

    function getDefaultToken() {
        return undefined;
    }

    function setState(state) {
        this.state = state;
    }

    function getState(state) {
        return this.state;
    }

    rpc.setState = setState.bind(rpc);
    rpc.getState = getState.bind(rpc);
    rpc.tokenHandler = tokenHandler.bind(rpc);
    rpc.batch.use(tokenBatchesHandler.bind(rpc));
    rpc.use(logHandler.bind(rpc));

    rpc.setToken = setToken.bind(rpc);
    rpc.getToken = getToken.bind(rpc);

    rpc.getDefaultToken = getDefaultToken.bind(rpc);

    rpc.use(cacheHandler.bind(rpc));
    rpc.use(tokenHandler.bind(rpc));
    return rpc;
}
