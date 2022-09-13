import {useEffect,useState} from "react";
import './index.css'
import {fabric} from 'fabric';
import {pandaImage,playerImg} from "../assets";
import '../fabricOverrids'
import  {fabricGif} from "./fabricGif";
// import CCapture from 'ccapture.js-npmfixed';


let canvas,capturer,recorder,recordedBlobs=[];

const ImageDesigner = () =>{
    const [recordedBlobss, setRecordedBlobss] = useState([]);

    useEffect(() => {
        inItCanvas();
        initializeRecorder();
        addGifs()
    },[]);

    const initializeRecorder = () => {
        // add background image
        if (!canvas) return;
        let canvasEl = canvas.getElement(),
            stream = canvasEl.captureStream(24)
        recorder = new MediaRecorder(stream,{mimeType : 'video/webm'});
        recorder.ondataavailable = saveChunks;
        recorder.onstop = saveRecordedBlobss
    }

    const startRecording = () => {
        if (!recorder) return;
        recorder.start();
    }
    const stopRecording = () => {
        if (!recorder) return;
        recorder.stop()
    }

    const saveRecordedBlobss = () => {
        setRecordedBlobss(recordedBlobs)
    }
    function saveChunks(evt) {
        // store our final video's chunks
        if (evt.data && evt.data.size > 0) {
            recordedBlobs.push(evt.data);
        }

    }

    function downloadGif() {
        const blob = new Blob(recordedBlobs, { type: 'video/webm' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'mergedGifs.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);

    }


    // const animateByRequestTime = (canvasEle) => {
    //     requestAnimationFrame(() => animateByRequestTime(canvasEle))
    //     capturer.capture(canvasEle);
    // }
    // const cancelAnimation = () => {
    //     if (!capturer) return;
    //     capturer.stop();
    //     cancelAnimationFrame(animateByRequestTime);
    // }

    const addGifs=async ()=>{
        // animateByRequestTime(canvas.getElement())
        startRecording()
        const gif1 = await fabricGif(
            "https://media.giphy.com/media/HufOeXwDOInlK/giphy.gif",
            200,
            200
        );
        gif1.set({ top: 50, left: 50 });
        canvas.add(gif1);

        const gif2 = await fabricGif(
            "https://media.giphy.com/media/11ZSwQNWba4YF2/giphy.gif",
            200,
            200
        );
        gif2.set({ top: 50, left: 300 });
        canvas.add(gif2);

        const gif3 = await fabricGif(
            "https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
            200,
            200
        );
        gif3.set({ top: 300, left: 50 });
        canvas.add(gif3);

        const gif4 = await fabricGif(
            "giffy.gif",
            200,
            200
        );
        gif4.set({ top: 350, left: 270 });
        canvas.add(gif4);


        fabric.util.requestAnimFrame(function render() {
            canvas.renderAll();
            fabric.util.requestAnimFrame(render);
        });
        setTimeout(()=>{
            stopRecording();
        },5000)
        // setTimeout(()=>{
        //     // cancelAnimation();
        //     // capturer.save(function (blob) {
        //     //     const url = window.URL.createObjectURL(blob);
        //     //     const a = document.createElement('a');
        //     //     a.style.display = 'none';
        //     //     a.href = url;
        //     //     a.download = 'tacticsboard.tar';
        //     //     document.body.appendChild(a);
        //     //     a.click();
        //     //     setTimeout(() => {
        //     //         document.body.removeChild(a);
        //     //         window.URL.revokeObjectURL(url);
        //     //     }, 100);
        //     //
        //     // });
        // },4000)
    }

    const inItCanvas =()=>{
        canvas = new fabric.Canvas('canvas',{
            width:850,
            height:600,
            backgroundColor:'white',
            selection: false,
        })
        onCanvasEvents(canvas)
        window.canvas = canvas;
        canvas.renderAll();
    }

    function onCanvasEvents(canvas){
        canvas.on({
            'object:added': objectAdded,
            'selection:created': selectionCreated,
            'selection:updated': selectionUpdated,
            'object:moving': objectMoving,
            'object:modified' : modifiedObject,
            'object:scaling':objectScaling,
            'object:scaled':objectScaled,
            'object:rotating':objectRotating,
            'mouse:up':mouseUp,
            'mouse:move':mouseMove,
            'key:down':onKeyDown,
        })
    }

    const onKeyDown = (e) => {}
    const mouseMove=(e)=>{}
    const mouseUp=(e)=> {}
    const objectAdded=(e)=>{}
    const selectionCreated=(e)=>{}
    const selectionUpdated=(e)=>{}
    const modifiedObject=(e)=>{}
    const objectScaling=(e)=>{}
    const objectScaled=(e)=>{}
    const objectRotating=(e)=>{}
    const objectMoving=(e)=>{}


    return (
        <div className="editor-container">
            <div className={"canvas-main-wrapper"}>
                {/*<div className="buttons-section">*/}
                {/*    <button onClick={bgImage}>Add Image</button>*/}
                {/*    <button onClick={addOverlayImage}>Add Overlay</button>*/}
                {/*    <button className="generate-pdd">Generate New PFP</button>*/}
                {/*</div>*/}
                <div className="merge-text"> MERGE GIFS</div>
                <div className="canvas-section">
                    <canvas id="canvas" width="850" height="600"/>
                </div>
                <div className="save-section">
                    <button className="generate-pdd" onClick={downloadGif}>Merge & Download GIF</button>
                </div>
            </div>
        </div>
    );
}
export default ImageDesigner;
