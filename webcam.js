/**
 * Created by Ярослав on 16.02.2017.
 */

    //Набор фильтров и их параметров
let filters = {
        blur: {
            name: "blur",
            value: 50,
            enable: false
        },
        grayscale: {
            name: "grayscale",
            value: 100,
            enable: false
        },
        sepia: {
            name: "sepia",
            value: 100,
            enable: false
        },
        invert: {
            name: "invert",
            value: 100,
            enable: false
        }
    };

window.onload = ()=>{
    let video = document.getElementById("vid"),
        canvas = {
            canvMain: document.getElementById("canv"),
            canvBlur: document.getElementById("canvBlur"),
            canvSepia: document.getElementById("canvSepia"),
            canvGray: document.getElementById("canvGray"),
            canvInvert: document.getElementById("canvInvert")
        },
        ctx = {
            ctxMain: canvas.canvMain.getContext("2d"),
            ctxBlur: canvas.canvBlur.getContext("2d"),
            ctxSepia: canvas.canvSepia.getContext("2d"),
            ctxGray: canvas.canvGray.getContext("2d"),
            ctxInvert: canvas.canvInvert.getContext("2d")
        },
        range = {
            blur: document.getElementById("rangeB"),
            sepia: document.getElementById("rangeS"),
            grayscale: document.getElementById("rangeG"),
            invert: document.getElementById("rangeI"),
        },
        btn = document.getElementById("btn"),
        localMediaStream = null;

    //Сборка валидной строки из объекта filter
    let stringFilter = (filter, value) => {
        if(filter !== "blur"){
            return filter + "(" + value + "%)";
        }
        else {
            return filter + "(" + value/10 + "px)" ;
        }
    };

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
        if(localMediaStream){
            if(filter) {
                context.filter = stringFilter(filter.name, filter.value);
            }
            else{
                if(video.style.filter.toString() == ""){
                    context.filter = "none";
                }else {
                    context.filter = video.style.filter;
                }
               console.log("v"+video.style.filter.toString()+"v");
               console.log(context.filter.toString());
            }
            context.drawImage(video, 0, 0);
        }
    };

    //Наложение или удаление фильтров на видео
    let videoFilter = (filter) => {
        let strFilter = stringFilter(filter.name, filter.value);

        //Скрыть "бегунки" и подписи настроек фильтров
        let styleRange = document.querySelectorAll("input[type=range]");
        let styleLabelRange = document.querySelectorAll("label");
        for(let i = 0; i < styleRange.length; i++){
          styleRange[i].style.display = "none";
          styleLabelRange[i].style.display = "none"
        }

        //Если фильтр не наложен, то включаем его, отображаем его настройки и накладываем на изображение
        //Иначе выключаем фильтр и снимаем его с изображения
        if(!filter.enable) {
            video.style.filter +=  strFilter;
            document.querySelector("label[name = "+filter.name+"]").style.display = "block";
            range[filter.name].style.display = "block";
        }
        else{
            let videoStyle = video.style.filter.toString();
            videoStyle = videoStyle.replace(strFilter, "");
            console.log(videoStyle);
            video.style.filter = videoStyle;
        }
        filter.enable = !filter.enable;
    };


    navigator.getUserMedia =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({video: true}, initVideoStream, onCameraFail);

    //Отображаем превью фильтров
    cameraInterval = setInterval(() => {
        videoToCanvas(ctx.ctxBlur, filters.blur);
        videoToCanvas(ctx.ctxGray, filters.grayscale);
        videoToCanvas(ctx.ctxSepia, filters.sepia);
        videoToCanvas(ctx.ctxInvert, filters.invert);
    }, 1 );

    //Изменяем плотность фильтра при помощи бегунка
    let setValue = (filterName) => {
        let strFilter = stringFilter(filterName, filters[filterName].value);
        let videoStyle = video.style.filter.toString();
        videoStyle = videoStyle.replace(strFilter, "");
        console.log(strFilter);
        filters[filterName].value = range[filterName].value;
        strFilter = stringFilter(filterName, filters[filterName].value);
        console.log(strFilter);
        video.style.filter = videoStyle + " " + strFilter ;

    };

    //Кнопка сохранения кадра
    btn.addEventListener("click", () => {videoToCanvas(ctx.ctxMain, null)});

    //Кнопки наложения фильтров на видео
    canvas.canvBlur.addEventListener("click", () => {videoFilter(filters.blur)});
    canvas.canvGray.addEventListener("click", () => {videoFilter(filters.grayscale)});
    canvas.canvSepia.addEventListener("click", () => {videoFilter(filters.sepia)});
    canvas.canvInvert.addEventListener("click", () => {videoFilter(filters.invert)});

    //Значение бегунка
    range.blur.addEventListener("input", () => {setValue("blur");});
    range.grayscale.addEventListener("input", () => {setValue("grayscale");});
    range.sepia.addEventListener("input", () => {setValue("sepia");});
    range.invert.addEventListener("input", () => {setValue("invert");});
};

