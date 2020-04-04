class VideoCut {
    constructor(params) {
        let temp = {
            cutButtonId: "",
            videoId: ""
        }
        for(let key in temp) {
            this[key] = params[key]?params[key]:temp[key];
        }

        //绑定截图按钮
        document.getElementById(this.cutButtonId).addEventListener("click",this.clickCut.bind(this));
    }

    clickCut() {
        let video = document.getElementById(this.videoId);
        video.pause();
        //进行截图
        this.createCanvas();
    }

    //截图的相关操作
    createCanvas() {
        let div = document.createElement("div");
        div.className = "cutCanvasContainer"
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let video = document.getElementById(this.videoId);
        canvas.id = "cutCanvas";
        
        canvas.width = 800;
        canvas.height = video.clientHeight/video.clientWidth * canvas.width;
        console.log(canvas);
        div.appendChild(canvas);
        document.body.appendChild(div);

        context.drawImage(video,0,0,canvas.width,canvas.height);
    }
}