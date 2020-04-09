
class Tool {
    constructor(params) {
        this.id = params.id;
        this.callback = params.callback;
        this.history = Tool.getHistroy();
        //用作标记用
        this.canvas = document.getElementById(this.id);
        this.setScope();
    }

    //history用于记录历史图层
    static getHistroy() {
        if(!this.history) {
            this.history = [];
            this.now = -1;
        }
        return this.history;
    }
    
    //添加历史图层
    static addHistory(params) {
        let now = Tool.getNow();

        if(this.history.length>=10 && now === 9) {
            //把第二个图层合并到第一个图层上，然后删除第二个图层
            Tool.metgeCanvas();
        }
        
        let i = now + 1;
        while(i<this.history.length) {
            this.removeCanvas(i);
        }
        this.history.push(params);
        Tool.setNow(this.history.length-1);
    }
    
    static getNow() {
        return this.now;
    }

    static setNow(now) {
        this.now = now;
    }

    //切换上一个图层
    static beforeCanvas() {
        if(this.now === undefined || this.now < 0) return false;
        this.history[this.now].dom.style.display = "none";
        this.now = this.now - 1;
        if(this.now < 0) return false;
        return true;
    }

    //切换下一个图层
    static nextCanvas() {
        if(this.now === undefined || this.now >= this.history.length-1) return false;
        this.now = this.now + 1;
        this.history[this.now].dom.style.display = "block";

        if(this.now >= this.history.length-1) return false;
        return true;
    }

    //合并底层canvas
    static metgeCanvas() {
        let canvas = document.getElementById("visualCanvas");
        let copyCanvas = this.history[0].dom;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(copyCanvas,0,0,canvas.width,canvas.height);
        Tool.removeCanvas(0);
    }

    //index是history中需要去除的canvas对应的下标
    static removeCanvas(index) {
        let removeDom = this.history[index].dom; //item-index是因为每去除一个元素，后面的元素下标都会对应-1
        removeDom.parentNode.removeChild(removeDom);
        this.history.splice(index,1);
    }

    //创建虚拟画布用作图层
    addCanvas() {
        let id = 0;
        if(this.history.length) id = this.history[this.history.length-1].id+1;
        let visualCanvas = document.createElement("canvas");
        visualCanvas.id = "visualCanvas_"+id;
        visualCanvas.className = "cutCanvas";
        visualCanvas.width = this.canvas.width;
        visualCanvas.height = this.canvas.height;
        this.canvas.parentNode.appendChild(visualCanvas);

        this.visualCanvas = visualCanvas;
        this.ctx = visualCanvas.getContext("2d");
        this.setConfig();

        Tool.addHistory({
            dom: visualCanvas,
            id
        });
    }

    //配置画图的参数
    setConfig() {}

    //获取画布距离顶部的距离
    getTop() {
        return this.canvas.offsetTop-this.canvas.offsetHeight/2; //由于transform更改的距离不会计算所以要手动减去一半
    }
    //获取画布距离底部的距离
    getBottom() {
        return this.getTop()+this.canvas.offsetHeight;
    }
    //获取画布距离左侧的距离
    getLeft() {
        return this.canvas.offsetLeft-this.canvas.offsetWidth/2; 
    }
    //获取画布距离右侧的距离
    getRight() {
        return this.getLeft()+this.canvas.offsetWidth;
    }
    //设置画布的x,y坐标的极限值
    setScope() {
        this.scope = {
            x: [this.getLeft(),this.getRight()],
            y: [this.getTop(),this.getBottom()],
        };
    }
    //抽象方法
    mouseStart() {
        throw new Error("function mouseStart must rewrite");
    }

    mouseMove() {
        throw new Error("function mouseMove must rewrite");
    }

    mouseEnd() {
        throw new Error("function mouseEnd must rewrite");
    }
    //点击工具时候触发
    init() {
        this.addEvent();
    }
    //点击其他工具时触发
    destroy() {
        this.removeEvent();
    }

    //事件绑定
    addEvent() {
        //用来存储this改变后的函数,以便清楚
        this.functionCache = [{
            name: "mousedown",
            function: this.mouseStart.bind(this)
        },{
            name: "mousemove",
            function: this.mouseMove.bind(this)
        },{
            name: "mouseup",
            function: this.mouseEnd.bind(this)
        }];

        this.functionCache.forEach(item=> {
            document.addEventListener(item.name,item.function);
        })
        
    }
    //取消事件绑定
    removeEvent() {
        if(this.functionCache)  this.functionCache.forEach(item=> {
            document.removeEventListener(item.name,item.function);
        })
    }
}

class Brush extends Tool {
    constructor(params) {
        super(params);
        this.onMove = false; //判断鼠标是否按住滑动
    }
    setConfig() {
        let ctx = this.ctx;
        ctx.lineWidth="3";
        ctx.strokeStyle="red";
    }
    init() {
        console.log(123);
        this.addEvent();
    }
    mouseStart(e) {
        let clientX = e.clientX;
        let clientY = e.clientY;
        this.setScope();
        //画布内才触发
        if(clientX>=this.scope.x[0] && clientX<=this.scope.x[1] && clientY>=this.scope.y[0] && clientY<=this.scope.y[1]) {
            this.addCanvas();
            this.onMove = true;
            this.lastX = clientX; 
            this.lastY = clientY;
        }
    }
    mouseMove(e) {
        if(this.onMove) {
            let clientX = e.clientX;
            let clientY = e.clientY;
            //画布外当在边框处理
            clientX = clientX<this.scope.x[0]?this.scope.x[0]:clientX>this.scope.x[1]?this.scope.x[1]:clientX;
            clientY = clientY<this.scope.y[0]?this.scope.y[0]:clientY>this.scope.y[1]?this.scope.y[1]:clientY;
            this.nowX = clientX;
            this.nowY = clientY;
            
            //绘制
            let ctx = this.ctx;
            ctx.beginPath();
            //坐标以画布内计算，故去掉画布的x,y坐标
            ctx.moveTo(this.lastX - this.scope.x[0],this.lastY - this.scope.y[0]);
            ctx.lineTo(this.nowX - this.scope.x[0],this.nowY - this.scope.y[0]);
            ctx.stroke();

            this.lastX = clientX;
            this.lastY = clientY;
        }
    }
    mouseEnd() {
        if(this.onMove) {
            this.onMove = false;
            this.callback(this.history);
        }
    }
}

class Eraser extends Tool {
    constructor(params) {
        super(params);
        this.onMove = false; //判断鼠标是否按住滑动
    }
    setConfig() {
        this.size = 20;
    }
    mouseStart(e) {
        let clientX = e.clientX;
        let clientY = e.clientY;
        this.setScope();
        //画布内才触发
        if(clientX>=this.scope.x[0] && clientX<=this.scope.x[1] && clientY>=this.scope.y[0] && clientY<=this.scope.y[1]) {
            this.addCanvas();
            this.onMove = true;
            this.lastX = clientX; 
            this.lastY = clientY;
        }
    }
    mouseMove(e) {
        if(this.onMove) {
            let clientX = e.clientX;
            let clientY = e.clientY;
            //画布外当在边框处理
            clientX = clientX<this.scope.x[0]?this.scope.x[0]:clientX>this.scope.x[1]?this.scope.x[1]:clientX;
            clientY = clientY<this.scope.y[0]?this.scope.y[0]:clientY>this.scope.y[1]?this.scope.y[1]:clientY;
            this.nowX = clientX;
            this.nowY = clientY;
            
            
            let ctx = this.ctx; 
            let size = this.size;
            // ctx.clearRect(this.lastX - this.scope.x[0] - size/2,this.lastY - this.scope.y[0] - size/2,size,size);
            ctx.drawImage(this.canvas,this.lastX - this.scope.x[0] - size/2,this.lastY - this.scope.y[0] - size/2,size,size,this.lastX - this.scope.x[0] - size/2,this.lastY - this.scope.y[0] - size/2,size,size);

            this.lastX = clientX;
            this.lastY = clientY;
        }
    }
    mouseEnd() {
        if(this.onMove) {
            this.onMove = false;
            this.callback(this.history);
        }
    }
}

class Rectangle extends Tool {
    constructor(params) {
        super(params);
        this.onMove = false; //判断鼠标是否按住滑动
    }
    setConfig() {
        let ctx = this.ctx;
        ctx.lineWidth = "3";
        ctx.strokeStyle = "red";
        ctx.fillStyle = "blue";
    }
    mouseStart(e) {
        let clientX = e.clientX;
        let clientY = e.clientY;
        this.setScope();
        //画布内才触发
        if(clientX>=this.scope.x[0] && clientX<=this.scope.x[1] && clientY>=this.scope.y[0] && clientY<=this.scope.y[1]) {
            this.addCanvas();
            this.onMove = true;
            this.lastX = clientX; 
            this.lastY = clientY;
        }
    }
    mouseMove(e) {
        if(this.onMove) {
            let clientX = e.clientX;
            let clientY = e.clientY;
            //画布外当在边框处理
            clientX = clientX<this.scope.x[0]?this.scope.x[0]:clientX>this.scope.x[1]?this.scope.x[1]:clientX;
            clientY = clientY<this.scope.y[0]?this.scope.y[0]:clientY>this.scope.y[1]?this.scope.y[1]:clientY;
            this.nowX = clientX;
            this.nowY = clientY;
            let ctx = this.ctx; 
            ctx.clearRect(0,0,this.canvas.width,this.canvas.height); //每次绘画都要清空画布
            ctx.strokeRect(this.lastX - this.scope.x[0],this.lastY - this.scope.y[0],this.nowX - this.lastX,this.nowY - this.lastY);
        }
    }
    mouseEnd() {
        if(this.onMove) {
            this.onMove = false;
            this.callback(this.history);
        }
    }
}

class Font extends Tool {
    constructor(params) {
        super(params);
        this.onWrite = false; //判断是否正在书写
        this.onMove = false; //判断是否在移动input
        this.addInput();
    }

    setConfig() {
        
    }

    //创建input 
    addInput() {
        this.color = "red";
        this.fontSize = 22;
        
        let color = this.color;
        let lineHeight = this.fontSize + 2 + "px";
        let dom = document.getElementsByClassName("cutCanvasContainer")[0];
        let input = document.createElement("textarea");

        input.id = "visualInput";
        input.style.color = color;
        input.style.border = "1px solid " + color;
        input.style.display = "none";
        input.style.resize = "none";
        input.style.fontSize = this.fontSize + "px";
        input.style.height = lineHeight;
        input.style.lineHeight = lineHeight;
        input.setAttribute("auto-height",true);
        dom.appendChild(input);
        this.input = input;
    }

    addInputEvent() {
        //用于存储修改了this指针的方法并批量绑定事件
        this.inputCache = [{
            name: "blur",
            func: this.inputBlur.bind(this),
            dom: this.input
        },{
            name: "mousedown",
            func: this.beginMoveInput.bind(this),
            dom: this.input
        },{
            name: "mousemove",
            func: this.moveInput.bind(this),
            dom: document.body
        },{
            name: "mouseup",
            func: this.endMoveInput.bind(this),
            dom: document.body
        },{
            name: "scroll",
            func: this.scroll.bind(this),
            dom: this.input
        },{
            name: "keydown",
            func: this.keydown.bind(this),
            dom: this.input
        }];

        this.inputCache.forEach(item=> {
            item.dom.addEventListener(item.name,item.func);
        })
    }
    destroyInputEvent() {
        this.inputCache.forEach(item=> {
            item.dom.removeEventListener(item.name,item.func);
        })
    }
    //input失去焦点使触发
    inputBlur() {
        this.onWrite = false;
        //如果没有写的话就去除
        if(this.input.value === "") {
            Tool.removeCanvas(this.history.length-1);
            Tool.setNow(Tool.getNow()-1);
        }
        else {
            this.drawCanvas();
            this.callback(this.history);
        };

        this.input.style.width = "200px";
        this.input.style.height = this.fontSize+2+"px";
        this.input.style.display = "none";
        this.input.value = "";
        this.destroyInputEvent();
    }

    drawCanvas() {
        this.ctx.fillStyle = "red";
        this.ctx.textAlign="left";
        this.ctx.textBaseline="top";
        this.ctx.font = "normal "+ this.fontSize +"px Arial";
        
        let x = parseInt(this.input.style.left) - this.scope.x[0] + 1;
        let y = parseInt(this.input.style.top) - this.scope.y[0] + 2; //谷歌有3像素差别
        
        //用于存储每行的字符
        let arr = [];
        let count = 0;
        let lineHeight = this.fontSize + 2;

        for(let i=0;i<this.input.value.length;i++) {
            arr.push(this.input.value[i]);
            let width = this.ctx.measureText(arr.join("")).width; //arr中的字符总宽度
            if(this.input.value[i]==="\n") {
                this.ctx.fillText(arr.join(""),x,y+count*lineHeight);
                this.input.value = this.input.value.slice(i,this.input.value.length);
                arr = [];
                i = 0;
                count++;
            }
            if(width>this.input.clientWidth) {
                arr.pop();   
                i = i-1;
                this.ctx.fillText(arr.join(""),x,y+count*lineHeight);
                this.input.value = this.input.value.slice(i,this.input.value.length);
                arr = [];
                i=0;
                count++;
            }
        }
        
        this.ctx.fillText(arr.join(""),x,y+count*lineHeight);
    }

    //用于移动textarea
    beginMoveInput(e) {
        e.stopPropagation();
        let clientX = e.clientX;
        let clientY = e.clientY;
        this.onMove = true;
        this.beginInputX = parseInt(this.input.style.left);
        this.beginInputY = parseInt(this.input.style.top);
        this.lastInputX = clientX; 
        this.lastInputY = clientY;
    }

    moveInput(e) {
        e.stopPropagation();
        if(this.onMove) {
            let clientX = e.clientX;
            let clientY = e.clientY;
            clientX = clientX - this.lastInputX + this.beginInputX;
            clientY = clientY - this.lastInputY + this.beginInputY;
            //边界判断
            clientX = clientX<this.scope.x[0]?this.scope.x[0]:clientX>this.scope.x[1]-this.input.clientWidth?this.scope.x[1]-this.input.clientWidth:clientX;
            clientY = clientY<this.scope.y[0]?this.scope.y[0]:clientY>this.scope.y[1]-this.input.clientHeight?this.scope.y[1]-this.input.clientHeight:clientY;
            this.input.style.top =clientY  + "px";
            this.input.style.left = clientX  + "px";
        }
    }

    endMoveInput(e) {
        e.stopPropagation();
        this.onMove = false;
    }
    scroll() {
        this.input.scrollTop = 0;
        if(!this.clickEnter && this.input.clientWidth + 40 + parseInt(this.input.style.left)<this.scope.x[1]) {
            this.input.style.width = this.input.clientWidth + 40 +"px";
        } else if(this.clickEnter) {
            this.clickEnter = false;
        } else {
            this.input.style.width = this.scope.x[1] - parseInt(this.input.style.left) + "px";
            this.input.style.height = this.input.scrollHeight+"px";
        }
    }
    keydown(e) {
        //按回车时
        if(e.keyCode === 13) {
            let lineHeight = this.fontSize + 2;
            this.input.style.height = this.input.scrollHeight+lineHeight+"px";
            this.clickEnter = true;
        }
        //scrollHeight的变更需要等待
        //每次输入跳转到滚动条底部
        setTimeout(()=>{this.input.scrollTop = this.input.scrollHeight;},0);
    }
    mouseStart(e) {
        let clientX = e.clientX;
        let clientY = e.clientY;
        this.setScope();
        //画布内才触发
        if(clientX>=this.scope.x[0] && clientX<=this.scope.x[1] && clientY>=this.scope.y[0] && clientY<=this.scope.y[1]) {
            if(!this.onWrite) {
                this.addInputEvent();
                this.addCanvas();
                this.onWrite = true;
                this.input.style.display = "block";
                //边界值处理
                clientX = clientX<this.scope.x[0]?this.scope.x[0]:clientX>this.scope.x[1]-this.input.clientWidth?this.scope.x[1]-this.input.clientWidth:clientX;
                clientY = clientY<this.scope.y[0]?this.scope.y[0]:clientY>this.scope.y[1]-this.input.clientHeight?this.scope.y[1]-this.input.clientHeight:clientY;
                this.input.style.top = clientY+"px";
                this.input.style.left = clientX+"px";
                setTimeout(()=>{this.input.focus();},0);
            }
        }
    }
    mouseMove() {
    }
    mouseEnd() {
    }
}