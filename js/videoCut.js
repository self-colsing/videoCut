class VideoCut {
    constructor(params) {
        let temp = {
            cutButtonId: "",
            videoId: "",
        }
        for(let key in temp) {
            this[key] = params[key]?params[key]:temp[key];
        }
        this.history = []; //用于存储历史图层

        //绑定截图按钮
        document.getElementById(this.cutButtonId).addEventListener("click",this.clickCut.bind(this));
        setTimeout(()=>{this.clickCut();},1000)
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
        
        canvas.width = 800;
        canvas.height = video.clientHeight/video.clientWidth * canvas.width;
        context.drawImage(video,0,0,canvas.width,canvas.height);

        div.appendChild(canvas);
        document.body.appendChild(div);
    }

    createTools() {
        let params = {
            id: "cutCanvas",
            history: this.history,
        };
        this.tools = [{
            obj: new Brush(params),
            name: "刷"
        },{
            obj: new Eraser(params),
            name: "擦"
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
        
        //确定和关闭按钮的创建
        let cutToolsItem = document.createElement("div");
        cutToolsItem.innerHTML = "√";
        cutToolsItem.className = "cutToolsItem";
        cutToolsItem.id = "tools_"+this.tools.length;
        cutTools.appendChild(cutToolsItem);

        cutToolsItem = document.createElement("div");
        cutToolsItem.innerHTML = "×";
        cutToolsItem.className = "cutToolsItem";
        cutToolsItem.id = "tools_"+this.tools.length+1;
        cutTools.appendChild(cutToolsItem);

        cutTools.addEventListener("click",this.clickToos.bind(this));
    }

    clickToos(e) {
        if(e.path[0].className.indexOf("cutToolsItem")!=-1) {
            let dom = e.path[0];
            let index = dom.id.split("tools_")[1];

            if(!this.tools[index]) return;
            if(this.nowTools !==undefined) {
                if(this.nowTools === index) return; //重复点击返回
                if(this.tools[this.nowTools]) this.tools[this.nowTools].obj.destroy(); //销毁上一个的点击事件
            }
            let activeDom = document.getElementById("cutTools").getElementsByClassName("active")[0];
            if(this.nowTools) activeDom.className = activeDom.className.replace(" active",""); //把active类去掉

            this.tools[index].obj.init();
            this.nowTools = index;

            if(dom.className.indexOf("active")===-1) {
                dom.className = dom.className + " active"; //添加激活类
            }
        }
    }
}
