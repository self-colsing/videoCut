class Ajax {
    constructor() {

    }

    static post(url,params,callback) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST",url,true);
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.addEventListener("readystatechange",()=>{
            if(xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) callback.call(this,xhr.responseText);
        })
        xhr.send(params);
        callback();
    }
}