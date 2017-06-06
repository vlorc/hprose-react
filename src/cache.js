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
        return this.__option.encode(key);
    };
    formatValue = (value,expires) => {
        let pack = [value,Date.now()];
        if(expires){
            pack.push(pack[1] + expires * 1000);
        }
        return this.__option.encode(pack);
    };

    setOption = (option) => {
        let last = this.__option;
        this.__option = option || {
                defaultValue:null,
                expires:60 * 2,
                /*sync: (key) => null,*/
            };

        this.__option.encode = this.__option.encode || (v => buf2str(msgpack.encode(v)));
        this.__option.decode = this.__option.decode || (v => msgpack.decode(str2buf(v)));
        
        return last;
    };
    getOption = () => {
        return this.__option;
    };

    parseKey = (key)  => {
        return this.__option.decode(key);
    };
    parseValue = (value,defValue) => {
        if(value){
            let pack = this.__option.decode(value);
            if(Array.isArray(pack) && (pack.length < 3 || Date.now() < pack[2])){
                defValue = pack[0];
            }
        }
        return defValue;
    };
    removeRawItem = (key) => {
        return this.__local.removeItem(key);
    };
    setRawItem = (key,value) => {
        return this.__local.setItem(key,value);
    };

    getRawItem = (key,parse,sync,save) => {
        let value = this.__getRawItem(this.__local.getItem(key));

        if(parse){
            value = value.then(v => parse(v,this.__option.defaultValue))
        }

        if(sync){
            save = save || this.__option.save || this.setRawItem;
            value = value.then(v => {
                if(!v){
                    v = sync(key);
                    if(v){
                        v.then(res => save(key,res));
                    }
                }
                return v;
            });
        }
        return value;
    };

    getItem = (key,sync) => {
        return this.load(this.formatKey(key),sync);
    };

    setItem = (key,value) => {
        return this.save(this.formatKey(key), value);
    };

    remove = (key) => {
        return this.removeRawItem(this.formatKey(key));
    };

    save = (key,value,expires) => {
        return this.setRawItem(key,this.formatValue(value,undefined === expires ? this.__option.expires : expires));
    };

    load = (key,sync) => {
        return this.getRawItem(key,this.parseValue,sync || this.__option.sync,this.save);
    };

    clear = () => {
        return this.__local.clear();
    };
}

export default function (rpc,local) {
    rpc.Storage = new Storage(local);
}