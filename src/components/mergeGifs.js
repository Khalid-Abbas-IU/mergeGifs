import {fabric} from 'fabric';
import { parseGIF, decompressFrames } from "gifuct-js";

let canvas,recorder,recordedBlobs=[],isRenderEnd = false;
const [PLAY, PAUSE, STOP] = [0, 1, 2],maxWidth = 300, maxHeight = 300,gifDuration=2000;

export const mergedGifs = (gifs) =>new Promise(async (resolve, reject)=>{

    const initializeRecorder = () => {
        // add background image
        if (!canvas) return;
        let canvasEl = canvas.getElement(),
            stream = canvasEl.captureStream(24)
        recorder = new MediaRecorder(stream,{mimeType: 'video/webm;codecs=h264'});
        recorder.ondataavailable = saveChunks;
        recorder.onstop = onStop
    }
    const inItCanvas =()=>{
        let canvasEl = window.document.createElement('canvas');
        canvasEl.width = 500;
        canvasEl.id = "canvas";
        canvasEl.height = 400;
        canvas = new fabric.StaticCanvas('canvas',{backgroundColor:null,selection: false})
        canvas.renderAll();
        initializeRecorder(canvasEl)
    }

    const onStop=()=>{
        downloadGif()
    }

    const startRecording = () => {
        if (!recorder) return;
        recorder.start();
    }
    const stopRecording = () => {
        if (!recorder) return;
        if (recorder.state !== "inactive") recorder.stop()
        cancelAllAnimationFrames()
    }

    function cancelAllAnimationFrames(){
        let id = fabric.util.requestAnimFrame(function(){});
        while(id--){
            window.cancelAnimationFrame(id);
        }
    }

    function saveChunks(evt) {
        // store our final video's chunks
        if (evt.data && evt.data.size > 0) {
            recordedBlobs.push(evt.data);
        }

    }
    function downloadGif() {
        const blob = new Blob(recordedBlobs, { type: 'video/webm' });
        resolve(blob)
    }

    const gifToSprite = async (gif, maxWidth, maxHeight, maxDuration) => {
        let arrayBuffer;
        let error;
        let frames;

        // if the gif is an input file, get the arrayBuffer with FileReader
        if (gif.type) {
            const reader = new FileReader();
            try {
                arrayBuffer = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsArrayBuffer(gif);
                });
            } catch (err) {
                error = err;
            }
        }
        // else the gif is a URL or a dataUrl, fetch the arrayBuffer
        else {
            try {
                arrayBuffer = await fetch(gif).then((resp) => resp.arrayBuffer());
            } catch (err) {
                error = err;
            }
        }

        // Parse and decompress the gif arrayBuffer to frames with the "gifuct-js" library
        if (!error) frames = decompressFrames(parseGIF(arrayBuffer), true);
        if (!error && (!frames || !frames.length)) error = "No_frame_error";
        if (error) {
            console.error(error);
            return { error };
        }

        // Create the needed canvass
        const dataCanvas = document.createElement("canvas");
        const dataCtx = dataCanvas.getContext("2d");
        const frameCanvas = document.createElement("canvas");
        const frameCtx = frameCanvas.getContext("2d");
        const spriteCanvas = document.createElement("canvas");
        const spriteCtx = spriteCanvas.getContext("2d");

        // Get the frames dimensions and delay
        let [width, height, delay] = [
            frames[0].dims.width,
            frames[0].dims.height,
            frames.reduce((acc, cur) => (acc = !acc ? cur.delay : acc), null)
        ];

        // Set the Max duration of the gif if any
        // FIXME handle delay for each frame
        const duration = frames.length * delay;
        maxDuration = maxDuration || duration;
        if (duration > maxDuration) frames.splice(Math.ceil(maxDuration / delay));

        // Set the scale ratio if any
        maxWidth = maxWidth || width;
        maxHeight = maxHeight || height;
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = width * scale;
        height = height * scale;

        //Set the frame and sprite canvass dimensions
        frameCanvas.width = width;
        frameCanvas.height = height;
        spriteCanvas.width = width * frames.length;
        spriteCanvas.height = height;

        frames.forEach((frame, i) => {
            // Get the frame imageData from the "frame.patch"
            const frameImageData = dataCtx.createImageData(
                frame.dims.width,
                frame.dims.height
            );
            frameImageData.data.set(frame.patch);
            dataCanvas.width = frame.dims.width;
            dataCanvas.height = frame.dims.height;
            dataCtx.putImageData(frameImageData, 0, 0);

            // Draw a frame from the imageData
            if (frame.disposalType === 2) frameCtx.clearRect(0, 0, width, height);
            frameCtx.drawImage(
                dataCanvas,
                frame.dims.left * scale,
                frame.dims.top * scale,
                frame.dims.width * scale,
                frame.dims.height * scale
            );

            // Add the frame to the sprite sheet
            spriteCtx.drawImage(frameCanvas, width * i, 0);
        });

        // Get the sprite sheet dataUrl
        const dataUrl = spriteCanvas.toDataURL();

        // Clean the dom, dispose of the unused canvass
        dataCanvas.remove();
        frameCanvas.remove();
        spriteCanvas.remove();

        return {
            dataUrl,
            frameWidth: width,
            framesLength: frames.length,
            delay
        };
    };

    const fabricGif = async (gif, maxWidth, maxHeight, maxDuration) => {
        const { error, dataUrl, delay, frameWidth, framesLength } = await gifToSprite(
            gif,
            maxWidth,
            maxHeight,
            maxDuration
        );


        if (error) return { error };
        console.log("gif, framesIndex",gif,framesLength,delay)

        return new Promise((resolve) => {
            fabric.Image.fromURL(dataUrl, (img) => {
                const sprite = img.getElement();
                let framesIndex = 0;
                let start = performance.now();
                let status;

                img.width = frameWidth;
                img.height = sprite.naturalHeight;
                img.mode = "image";
                img.top = 0;
                img.left = 0;

                img._render = function (ctx) {
                    if (status === PAUSE || (status === STOP && framesIndex === 0)) {
                        return;
                    }
                    const now = performance.now();
                    const delta = now - start;
                    if (delta > delay) {
                        start = now;
                        framesIndex++;
                    }
                    if (framesIndex === framesLength || status === STOP) {
                        isRenderEnd = true;
                        framesIndex = 0;
                    }
                    ctx.drawImage(
                        sprite,
                        frameWidth * framesIndex,
                        0,
                        frameWidth,
                        sprite.height,
                        -this.width / 2,
                        -this.height / 2,
                        frameWidth,
                        sprite.height
                    );
                };
                img.play = function () {
                    status = PLAY;
                    this.dirty = true;
                };
                img.pause = function () {
                    status = PAUSE;
                    this.dirty = false;
                };
                img.stop = function () {
                    status = STOP;
                    this.dirty = false;
                };
                img.getStatus = () => ["Playing", "Paused", "Stopped"][status];

                // img.play();
                resolve(img);
            });
        });
    };

    const getGifsObjs = ()=>{
        let promises = [];
        for (let i = 0; i < gifs.length; i++) {
            const src = gifs[i];
            promises[i] = new Promise(async (resolve)=>{
                const gif = await fabricGif(src, maxWidth,maxHeight);
                resolve(gif)
            })
        }
        return Promise.all(promises);
    }
    const loadGifIntoCanvas = (gifObjs)=>{
        let promises = [];
        for (let i = 0; i < gifObjs.length; i++) {
            promises[i] = new Promise(async (resolve)=>{
                canvas.add(gifObjs[i])
                resolve()
            })
        }
        return Promise.all(promises);
    }

    const addGifs=async ()=>{
        canvas.setWidth(maxWidth)
        canvas.setHeight(maxHeight)
        const gifObjs = await getGifsObjs()
        const isRendered = await loadGifIntoCanvas(gifObjs)
        if (isRendered) {
            canvas.renderAll();
            startRecording()
            requestAnimationFrame(function render() {
                canvas.renderAll();
                if (isRenderEnd) stopRecording();
                fabric.util.requestAnimFrame(render);
            })
        }
    }
    inItCanvas();
    addGifs()
});