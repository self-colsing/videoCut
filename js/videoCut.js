class VideoCut {
    constructor(params) {
        let temp = {
            cutButtonId: "",
            videoId: "",
        }
        for(let key in temp) {
            this[key] = params[key]?params[key]:temp[key];
        }
        this.videoWay = 0; //0是横屏，1是竖屏
        this.history = []; //用于存储历史图层

        //绑定截图按钮
        document.getElementById(this.cutButtonId).addEventListener("click",this.clickCut.bind(this));
        // setTimeout(()=>{this.clickCut();},1000)
    }

    clickCut() {
        let video = document.getElementById(this.videoId);
        video.pause();
        //进行截图
        this.createCanvas();
        this.createTools();
    }

    //创建截图
    createCanvas() {
        let div = document.createElement("div");
        div.className = "cutCanvasContainer"
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let video = document.getElementById(this.videoId);
        canvas.id = "cutCanvas";
        canvas.className = "cutCanvas";
        
        canvas.width = document.documentElement.clientWidth - 200;
        canvas.height = video.videoHeight/video.videoWidth * canvas.width;
        if(canvas.height > document.documentElement.clientHeight - 200) {
            canvas.height = document.documentElement.clientHeight - 200;
            canvas.width = canvas.height * video.videoWidth/video.videoHeight;
            this.videoWay = 1;
        }
        context.drawImage(video,0,0,canvas.width,canvas.height);

        //虚拟画布，用作绘画用
        let visualCanvas = document.createElement("canvas");
        visualCanvas.id = "visualCanvas";
        visualCanvas.className = "cutCanvas";
        visualCanvas.width = canvas.width;
        visualCanvas.height = canvas.height;

        div.appendChild(canvas);
        div.appendChild(visualCanvas);
        document.body.appendChild(div);
    }

    createTools() {
        let params = {
            id: "cutCanvas",
            history: this.history,
            callback: this.finishDraw.bind(this) //绘画结束触发的回调函数
        };
        this.tools = [{
            obj: new Brush(params),
            name: "刷"
        },{
            obj: new Eraser(params),
            name: "擦"
        },{
            obj: new Rectangle(params),
            name: "正"
        },{
            obj: new Font(params),
            name: "文"
        }];

        //批量添加工具
        let cutTools = document.createElement("div");
        cutTools.id = "cutTools";
        document.getElementsByClassName("cutCanvasContainer")[0].appendChild(cutTools);

        this.tools.forEach((item,index)=> {
            let cutToolsItem = document.createElement("div");
            cutToolsItem.innerHTML = item.name;
            cutToolsItem.className = "cutToolsItem";
            cutToolsItem.id = "tools_"+index;
            cutTools.appendChild(cutToolsItem);
        })
        
        this.extends = [{
            name: "←",
            func: this.before.bind(this),
            default: false
        },{
            name: "→",
            func: this.next.bind(this),
            default: false
        },{
            name: "√",
            func: this.submit.bind(this)
        },{
            name: "×",
            func: this.cancel.bind(this)
        }]
        //批量添加扩充工具
        this.extends.forEach((item,index)=> {
            let cutToolsItem = document.createElement("div");
            cutToolsItem.innerHTML = item.name;
            cutToolsItem.className = "cutToolsItem";
            if(item.default === false) cutToolsItem.className = cutToolsItem.className + " unable";
            cutToolsItem.id = "tools_"+(this.tools.length+index);
            cutTools.appendChild(cutToolsItem);
        })

        cutTools.addEventListener("click",this.handleClick.bind(this));
    }
    
    //点击工具按钮
    clickTools(e) {
        let dom = e.path[0];
        let index = dom.id.split("tools_")[1];
        
        if(this.nowTools !==undefined) {
            if(this.nowTools === index) return; //重复点击返回
            if(this.tools[this.nowTools]) this.tools[this.nowTools].obj.destroy(); //销毁上一个的点击事件
        }
        let activeDom = document.getElementById("cutTools").getElementsByClassName("active")[0];
        if(this.nowTools && activeDom) activeDom.className = activeDom.className.replace(" active",""); //把active类去掉
        this.tools[index].obj.init();
        this.nowTools = index;

        if(dom.className.indexOf("active")===-1) {
            dom.className = dom.className + " active"; //添加激活类
        }
    }

    //点击扩充按钮
    clickExtends(e) {
        let dom = e.path[0];
        let index = dom.id.split("tools_")[1]-this.tools.length;
        this.extends[index].func();
    }

    handleClick(e) {
        e.stopPropagation();
        if(e.path[0].className.indexOf("cutToolsItem")!=-1) {
            let dom = e.path[0];
            let index = dom.id.split("tools_")[1];
            if(index>=this.tools.length) this.clickExtends(e);
            else this.clickTools(e);
        }
    }

    //标注完成触发的回调函数
    finishDraw() {
        let leftDom = document.getElementById("tools_"+ (this.tools.length));
        let rightDom = document.getElementById("tools_"+ (this.tools.length+1));
        leftDom.className = leftDom.className.replace(" unable","");
        rightDom.className = rightDom.className.replace(" unable","") + " unable";
    }

    //点击上一步
    before() {
        if(!Tool.beforeCanvas()) {
            let leftDom = document.getElementById("tools_"+ (this.tools.length));
            leftDom.className = leftDom.className.replace(" unable","") + " unable";
        }
        if(Tool.getNow()<Tool.getHistroy().length-1) {
            let rightDom = document.getElementById("tools_"+ (this.tools.length+1));
            rightDom.className = rightDom.className.replace(" unable","");
        }
    }

    //点击下一步
    next() {
        if(!Tool.nextCanvas()) {
            let rightDom = document.getElementById("tools_"+ (this.tools.length+1));
            rightDom.className = rightDom.className.replace(" unable","") + " unable";
        }
        if(Tool.getNow()>=0) {
            let rightDom = document.getElementById("tools_"+ (this.tools.length));
            rightDom.className = rightDom.className.replace(" unable","");
        }
    }

    submit() {
        let history = Tool.getHistroy();
        let now = Tool.getNow();
        let video = document.getElementById(this.videoId);
        let canvas = document.getElementById("cutCanvas");
        let visualCanvas = document.getElementById("visualCanvas");
        for(let i=0;i<=now;i++) {
            visualCanvas.getContext("2d").drawImage(history[i].dom,0,0,visualCanvas.width,visualCanvas.height);
            history[i].dom.style.display = "none";
        }
        canvas.getContext("2d").drawImage(visualCanvas,0,0,visualCanvas.width,visualCanvas.height);
        visualCanvas.style.display = "none";

        //清楚之前的截图
        let dom = document.getElementById("showCut");
        if(dom) dom.parentNode.removeChild(dom);
        dom = document.getElementById("submitButton");
        if(dom) dom.parentNode.removeChild(dom);
        
        let img = document.createElement("img");
        img.src = canvas.toDataURL(); //转成base64
        document.getElementsByClassName("imgContainer")[0].appendChild(img);
        img.id = "showCut";
        // img.style.display = "block";

        img.style.width = video.clientWidth + "px";
        img.style.height = video.clientHeight + "px";
        this.cancel();

        //创建上传按钮
        let button = document.createElement("button");
        button.id = "submitButton";
        button.innerHTML = "上传";
        document.getElementsByClassName("imgContainer")[0].appendChild(button);
        button.addEventListener("click",this.handleImg.bind(this));
    }

    cancel() {
        this.tools.forEach(item=> {
            item.obj.destroy()
        })
        Tool.history = [];
        Tool.now = -1;
        this.nowTools = undefined;

        let dom = document.getElementsByClassName("cutCanvasContainer")[0];
        dom.parentNode.removeChild(dom);
        video.play();
    }

    //上传图片相关代码
    handleImg() {
        let img = document.getElementById("showCut");

        Ajax.post("http://localhost:3000","img="+img.src,(data)=>{
            console.log(data);
        })
    }
}
