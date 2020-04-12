class ToolConfig {
    constructor(params) {
        this.config = {
            lineColor: "red", //线条颜色
            lineWidthIndex: 0 //线条宽度下标
        }

        for(let key in params) {
            this.config[key] = params[key];
        }

        setTimeout(()=>{this.createConfig();},0)
    }

    //配置参数
    setConfig(params) {
        if(this.config === undefined) this.config = {};
        for(let key in params) {
            this.config[key] = params[key];
        }
        let showColor = document.getElementsByClassName("colorConfigShow")[0];
        showColor.style.background = this.config.lineColor;

        let children = document.getElementsByClassName("widthConfig")[0].children;
        for(let i=0;i<children.length;i++) {
            if(i === this.config.lineWidthIndex) {
                let dom = children[i];
                if(dom.className.indexOf("active") === -1) {
                    dom.className = dom.className + " active";
                    this.setConfig({lineWidthIndex: i});
                }
            }
            else children[i].className = children[i].className.replace(" active","");
        }
    }

    getConfig() {
        return this.config;
    }

    clickColor(dom) {
        let showColor = document.getElementsByClassName("colorConfigShow")[0];
        showColor.style.background = dom.style.background;
        this.setConfig({
            lineColor: dom.style.background
        })
    }

    clickDot(dom) {
        let children = dom.parentNode.children;
        for(let i=0;i<children.length;i++) {
            if(children[i] === dom) {
                if(dom.className.indexOf("active") === -1) {
                    dom.className = dom.className + " active";
                    this.setConfig({lineWidthIndex: i});
                }
            }
            else children[i].className = children[i].className.replace(" active","");
        }
    }

    //点击事件的处理函数
    handleClick(e) {
        let className = e.path[0].className;
        if(className.indexOf("colorConfigItem")!=-1) this.clickColor(e.path[0]);
        else if(className.indexOf("widthConfigItem")!=-1) this.clickDot(e.path[0]);
        else if(className.indexOf("widthConfigDot")!=-1) this.clickDot(e.path[1]);
    }

    addEvent() {
        let config = document.getElementsByClassName("cutToolsConfig")[0];
        this.cacheFunction = [{
            name: "click",
            function: this.handleClick.bind(this)
        }]
        this.cacheFunction.forEach(item=> {
            config.addEventListener(item.name,item.function);
        })
    }

    removeEvent() {
        let config = document.getElementsByClassName("cutToolsConfig")[0];
        this.cacheFunction.forEach(item=> {
            config.removeEventListener(item.name,item.function);
        })
    }

    createConfig() {
        let container = document.getElementById("cutTools");
        let div = document.createElement("div");
        div.className = "cutToolsConfig";
        div.style.display = "none";
        container.appendChild(div);

        //大小配置
        let widthConfig = document.createElement("div");
        widthConfig.className = "widthConfig";

        for(let i=0;i<3;i++) {
            let item = document.createElement("div");
            item.className = "widthConfigItem";
            
            let dot = document.createElement("div");
            dot.className = "widthConfigDot"
            dot.style.width = 5 + i*2 + "px";
            dot.style.height = 5 + i*2 + "px";

            item.appendChild(dot);
            widthConfig.appendChild(item);
        }
        widthConfig.firstChild.className = "widthConfigItem active";
        div.appendChild(widthConfig);

        //颜色配置
        let colorConfig = document.createElement("div");
        colorConfig.className = "colorConfig";
        
        let showColor = document.createElement("div");
        showColor.className = "colorConfigShow";
        showColor.style.background = "red";
        colorConfig.appendChild(showColor);

        let colorContainer = document.createElement("div");
        colorContainer.className = "colorConfigContainer";
        colorConfig.appendChild(colorContainer);
        let background = ["black","white","gray","red","#FF7F00","yellow","green","#00FFFF","blue","#8B00FF"];
        for(let i=0;i<10;i++) {
            let item = document.createElement("div");
            item.className = "colorConfigItem";
            item.style.background = background[i];
            colorContainer.appendChild(item);
        }

        div.appendChild(colorConfig);
    }

    show(type) {
        let config = document.getElementsByClassName("cutToolsConfig")[0];
        if(!config) this.createConfig();
        config = document.getElementsByClassName("cutToolsConfig")[0];
        config.style.display = "block";

        switch(type) {
            case "0":
                document.getElementsByClassName("widthConfig")[0].style.display = "block";
                document.getElementsByClassName("colorConfig")[0].style.display = "block";
                break;
            case "1":
                document.getElementsByClassName("widthConfig")[0].style.display = "block";
                document.getElementsByClassName("colorConfig")[0].style.display = "none";
                break;
            case "2":
                document.getElementsByClassName("widthConfig")[0].style.display = "none";
                document.getElementsByClassName("colorConfig")[0].style.display = "block";
                break;
        }
        this.addEvent();
    }

    hidden() {
        let config = document.getElementsByClassName("cutToolsConfig")[0];
        if(config) config.style.display = "none";
        this.removeEvent();
    }
}