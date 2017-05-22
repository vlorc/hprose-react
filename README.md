# hprose rpc

## support
+ private (not public) interface support last param token
+ cache enter ,storage support expires
+ dynamically load the function table (not lazy)

## demo

		import openRpc from "hprose-react";
		//openRpc return a Promise
		//param 1 is url must type string
		openRpc('ws://YOUR_SERVICE_DOMAIN/rpc/v1',window.sessionStorage/*you can set localStorage*/)
			.then(rpc => {
                this.rpc = rpc;
                // my service use public.user.login
                rpc.getDefaultToken = () => rpc.Storage.getRawItem('token',null,() => rpc.public.user.login('mimi','mimi',rpc.setToken));
                return rpc.cache.user.getInfo();
            });