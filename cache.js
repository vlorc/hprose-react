/**
 * Created by kakoyi on 2017-03-20.
 */

import msgpack from "msgpack-lite";

const VERSION = '0.0.1';

function buf2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

function str2buf(str) {
    let buf = new Uint8Array(str.length);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
}

class Storage{
    constructor(local,option){
        this.__local = local;
        this.__isPromise = local.setItem('jsStorage',VERSION) instanceof Promise;
        this.setOption(option);
        this.__init();
    }
    __init(){
        if(this.__isPromise){
            this.__getRawItem = v => v;
        }else{
            this.__getRawItem = v => Promise.resolve(v);
        }

    }
    formatKey = (key) =>{
        return buf2str(msgpack.encode(key));
    };
    formatValue = (value,expires) =>{
        let pack = [value,Date.now()];
        if(expires){
            pack.push(pack[1] + expires * 1000);
        }
        let buf = msgpack.encode(pack);
        return buf2str(buf);
    };

    setOption = (option) =>{
        let last = this.__option;
        this.__option = option || {
                defaultValue:null,
                expires:60 * 2,
                /*sync: (key) => null,*/
            };
            this.__option.parseKey = this.__option.parseKey || this.parseKey;
            this.__option.parseValue = this.__option.parseValue || this.parseValue;
            this.__option.formatKey = this.__option.formatKey || this.formatKey;
            this.__option.formatValue = this.__option.formatValue || this.formatValue;
        return last;
    };
    getOption = () =>{
        return this.option;
    };

    parseKey = (key)  => {
        return msgpack.decode(str2buf(key));
    };
    parseValue = (value,defValue) =>{
        if(value){
            let buf = str2buf(value);
            let pack =  msgpack.decode(buf);
            if(Array.isArray(pack) && (pack.length < 3 || Date.now() < pack[2])){
                defValue = pack[0];
            }
        }
        return defValue;
    };
    removeRawItem = (key) =>{
        return this.__local.removeItem(key);
    };
    setRawItem = (key,value) =>{
        return this.__local.setItem(key,value);
    };

    getRawItem = (key,parse,sync,save) =>{
        let value = this.__getRawItem(this.__local.getItem(key));

        if(parse){
            value = value.then(v => parse(v,this.__option.defaultValue))
        }

        if(sync){
            save = save || this.__option.save || this.setRawItem;
            value = value.then(
                v => v ? v : sync(key).then(res =>{ save(key,res); return res; })
            );
        }
        return value;
    };

    getItem = (key,sync) =>{
        return this.load(this.__option.formatKey(key),sync);
    };

    setItem = (key,value) =>{
        return this.save(this.__option.formatKey(key), value);
    };

    remove = (key) =>{
        return this.removeRawItem(this.__option.formatKey(key));
    };

    save = (key,value,expires) =>{
        return this.setRawItem(key,this.__option.formatValue(value,undefined === expires ? this.__option.expires : expires));
    };

    load = (key,sync) =>{
        return this.getRawItem(key,this.__option.parseValue,sync || this.__option.sync,this.save);
    };

    clear = () =>{
        return this.__local.clear();
    };
}

export default function (rpc,local) {
    rpc.Storage = new Storage(local);
}