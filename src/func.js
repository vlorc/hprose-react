/**
 * Created by kakoyi on 2017-03-20.
 */

function parseFunction(src) {
    let e = /s\d+"([a-zA-Z_]+)"/ig;
    let root = [{}];
    for(let r = e.exec(src); r ;r = e.exec(src)) {
        let list = r[1].split('_');
        let func = list.pop();
        let last = root;
        for (let i in list) {
            let name = list[i];
            name = name.charAt(0).toLowerCase() + name.substr(1);
            if(!last[0][name]){
                last[0][name] = [{}];
            }
            last = last[0][name];
        }
        last.push(func.charAt(0).toLowerCase() + func.substr(1));
    }
    return root;
}

export default function fetchFunctions(src,config){
    if(!src){
        src = config.url.replace(/^ws/,'http');
    }
    let dst = src;
    if(/^[a-zA-Z][a-z-A-Z\d]+:\/\//i.test(src)){
        dst = fetch(src)
            .then(rep => rep.text())
            .then(rep => parseFunction(rep));
    }
    if(!(dst instanceof Promise)){
        dst =  Promise.resolve(dst);
    }
    return dst;
}
