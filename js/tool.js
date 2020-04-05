
class Tool {
    constructor(params) {
        this.id = params.id;
        //用作标记用
        this.canvas = document.getElementById(this.id);
        this.setScope();
    }

    //history用于记录历史图层
    getHistroy() {
        if(!Tool.history) Tool.history = [];
        return Tool.history;
    }
    
    addHistory(params) {
        if(this.history.length>=10) {
            //把第二个图层合并到第一个图层上，然后删除第二个图层
            this.metgeCanvas();
            this.history.splice(1,1);
        }
        this.history.push(params);
    }

    //创建虚拟画布用作图层
    addCanvas() {
        this.history = this.getHistroy();
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

        this.addHistory({
            dom: visualCanvas,
            id
        });
    }

    //合并底层canvas
    metgeCanvas() {
        let canvas = this.history[0].dom;
        let copyCanvas = this.history[1].dom;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(copyCanvas,0,0,canvas.width,canvas.height);
        copyCanvas.parentNode.removeChild(copyCanvas);
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

    init() {
        this.addEvent();
    }

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
        this.functionCache.forEach(item=> {
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
        }
    }
}