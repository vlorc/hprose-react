/**
 * Created by kakoyi on 2017-03-20.
 */

import fetchFunctions from "./func";

export default function (url,funcUrl,local){
    let ret = {};
    if (Array.isArray(url)){
        ret.uriList = url;
        ret.url = url[0];
    }else if (typeof(url) === 'string'){
        ret.url = url;
    }else{
        throw new TypeError('url type must is string');
    }
    
    if(typeof(funcUrl) === 'string'){
        ret.functions = funcUrl;
    }else if(!local && typeof(funcUrl['getItem']) === 'function'){
        ret.local = funcUrl;
    }else{
        ret.local = local;
    }

    return fetchFunctions(ret.functions,ret)
        .then(f => {
            ret.functions = f;
            return ret;
        });
}
