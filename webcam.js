/**
 * Created by Ярослав on 16.02.2017.
 */


let sepiaFilter = (imageData, range) =>{
    let pixelChannel = imageData.data;
    let r, g, b, gray;
    let rangef = range/100;
    let antirangef = 1-rangef;
    for(let i = 0; i < pixelChannel.length; i += 4){
        r = pixelChannel[i];
        g = pixelChannel[i + 1];
        b = pixelChannel[i + 2];
        gray = ((r + g + b)/3);
        pixelChannel[i] =  r*antirangef + (gray + 60)*rangef;
        pixelChannel[i + 1] =  g*antirangef + (gray + 30)*rangef;
        pixelChannel[i + 2] =  b*antirangef + gray*rangef;
    }
    return imageData;
};

let grayscaleFilter = (imageData, range) =>{
    let pixelChannel = imageData.data;
    let r, g, b, gray;
    let rangef = range/100;
    let antirangef = 1-rangef;
    for(let i = 0; i < pixelChannel.length; i += 4){
        r = pixelChannel[i];
        g = pixelChannel[i + 1];
        b = pixelChannel[i + 2];
        gray = ((r + g + b)/3)*rangef;
        pixelChannel[i] =  r*antirangef + gray;
        pixelChannel[i + 1] =  g*antirangef + gray;
        pixelChannel[i + 2] =  b*antirangef + gray;
    }
    return imageData;
};



let invertFilter = (imageData, range) =>{
    let r, g, b;
    let pixelChannel = imageData.data;
    let rangef = range/100;
    let antirangef = 1-rangef;
    for(let i = 0; i < pixelChannel.length; i += 4){
        r = pixelChannel[i];
        g = pixelChannel[i + 1];
        b = pixelChannel[i + 2];
        pixelChannel[i] =  (255 - r)*rangef + r*antirangef;
        pixelChannel[i + 1] =  (255 - g)*rangef + g*antirangef;
        pixelChannel[i + 2] =  (255 - b)*rangef + b*antirangef;
    }
    return imageData;
};


//Набор фильтров и их параметров
let filters = {
    grayscale: {
        name: "grayscale",
        value: 100,
        enable: false,
        func: grayscaleFilter
    },
    sepia: {
        name: "sepia",
        value: 100,
        enable: false,
        func: sepiaFilter
    },
    invert: {
        name: "invert",
        value: 100,
        enable: false,
        func: invertFilter
    }
};

window.onload = ()=>{
    let video = document.getElementById("vid"),
        canvas = {
            canvVideo: document.getElementById("canvVideo"),
            canvMain: document.getElementById("canv"),
            canvSepia: document.getElementById("canvSepia"),
            canvGray: document.getElementById("canvGray"),
            canvInvert: document.getElementById("canvInvert")
        },
        ctx = {
            ctxVideo: canvas.canvVideo.getContext("2d"),
            ctxMain: canvas.canvMain.getContext("2d"),
            ctxSepia: canvas.canvSepia.getContext("2d"),
            ctxGray: canvas.canvGray.getContext("2d"),
            ctxInvert: canvas.canvInvert.getContext("2d")
        },
        range = {
            sepia: document.getElementById("rangeS"),
            grayscale: document.getElementById("rangeG"),
            invert: document.getElementById("rangeI"),
        },
        btn = document.getElementById("btn"),
        localMediaStream = null;


    //Перехват видео потока с камеры на тэг video
    let initVideoStream = (stream) => {
        if(typeof (video.srcObject) !== undefined){
            console.log("srcObject");
            video.srcObject = stream;
        }
        else {
            console.log("URL object");
            video.src = URL.createObjectURL(stream);
        }
        localMediaStream = stream;
    };

    // Исключение на случай, если камера не работает
    let onCameraFail =  (e) => {
        console.log('Camera did not work.', e);
    };

    //Отрисока кадра видео на канвасе
    let videoToCanvas = (context, filter)=>{
        let t1 = performance.now();
        if(localMediaStream){
            context.drawImage(video, 0, 0);
            setFilter(context, filter);
        }
        console.log(t1 - performance.now());
    };

    let setFilter = (context, filter) => {
        let dataImg = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        if(filter){
                dataImg = filter.func(dataImg, 100);
        }
        else{
            for(let value in filters){
                if(filters[value].enable){
                        dataImg = filters[value].func(dataImg, filters[value].value);
                }
            }
        }
        context.putImageData(dataImg, 0, 0);
    };


    navigator.getUserMedia =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({video: true}, initVideoStream, onCameraFail);

    //Отображаем превью фильтров
    cameraInterval = setInterval(() => {
        videoToCanvas(ctx.ctxVideo, null);
        videoToCanvas(ctx.ctxGray, filters.grayscale);
        videoToCanvas(ctx.ctxSepia, filters.sepia);
        videoToCanvas(ctx.ctxInvert, filters.invert);
    }, 40 );

    //Изменяем плотность фильтра при помощи бегунка
    let setValue = (filterName) => {
        filters[filterName].value = range[filterName].value;
    };

    //Кнопка сохранения кадра
    btn.addEventListener("click", () => {videoToCanvas(ctx.ctxMain, null)});

    let viewSetting = () => {
        let countEnableFilter = 0;
        if(filters.grayscale.enable){
            countEnableFilter++;
            range.grayscale.style.display = "block";
            range.grayscale.style.marginTop = 60 - (5*countEnableFilter) + "%";
            document.getElementsByName("grayscale")[0].style.display = "block";
            document.getElementsByName("grayscale")[0].style.marginTop = 57 - (5*countEnableFilter) + "%";
        }
        else {
            range.grayscale.style.display = "none";
            document.getElementsByName("grayscale")[0].style.display = "none";
        }
        if(filters.sepia.enable){
            countEnableFilter++;
            range.sepia.style.display = "block";
            range.sepia.style.marginTop = 60 - (5*countEnableFilter) + "%";
            document.getElementsByName("sepia")[0].style.display = "block";
            document.getElementsByName("sepia")[0].style.marginTop = 57 - (5*countEnableFilter) + "%";
        }
        else {
            range.sepia.style.display = "none";
            document.getElementsByName("sepia")[0].style.display = "none";
        }
        if(filters.invert.enable){
            countEnableFilter++;
            range.invert.style.display = "block";
            range.invert.style.marginTop = 60 - (5*countEnableFilter) + "%";
            document.getElementsByName("invert")[0].style.display = "block";
            document.getElementsByName("invert")[0].style.marginTop = 57 - (5*countEnableFilter) + "%";
        }
        else {
            range.invert.style.display = "none";
            document.getElementsByName("invert")[0].style.display = "none";
        }
    };

    //Кнопки наложения фильтров на видео
    canvas.canvGray.addEventListener("click", ()=>{
        filters.grayscale.enable = !filters.grayscale.enable;
        viewSetting();
    });
    canvas.canvSepia.addEventListener("click", ()=>{
        filters.sepia.enable = !filters.sepia.enable;
        viewSetting();
    });
    canvas.canvInvert.addEventListener("click", ()=>{
        filters.invert.enable = !filters.invert.enable;
        viewSetting();
    });

    //Значение бегунка
    range.grayscale.addEventListener("input", () => {setValue("grayscale");});
    range.sepia.addEventListener("input", () => {setValue("sepia");});
    range.invert.addEventListener("input", () => {setValue("invert");});
};

