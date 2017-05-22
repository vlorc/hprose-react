/**
 * Created by kakoyi on 2017-03-09.
 */

import hprose from "hprose-html5/dist/hprose-html5.src";
import parseConfig from "./config";
import initCache from "./cache";
import initHandle from "./handle";

export default function(...args) {
    return parseConfig(...args)
        .then(config => {
        	config.functions = [{cache:config.functions},...config.functions];
        	let rpc = hprose.Client.create(config.url,config.functions,config);
        	if(rpc){
        		if(config.local){
        			initCache(rpc,config.local);
        		}
        		initHandle(rpc);
        	}
        	return rpc;
        });
};
