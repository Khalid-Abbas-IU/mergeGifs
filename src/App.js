import { mergedGifs } from "./components/mergeGifs";
import React, {useEffect} from "react";


const gifs = ['gifs/loading.gif','gifs/CosmicBlueTongue.gif','gifs/HynoGlasses.gif','gifs/Cigarette.gif']
function App() {
    useEffect( ()=>{
        getMergedGifs()
    },[])

    const getMergedGifs =async ()=>{
        const blob = await mergedGifs(gifs)
        if (!blob) return;

        // For Video

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



        // For Gif ( Please run node first for gif conversion)

        // const a = document.createElement('a');
        // a.target = "_blank"
        // var data = new FormData();
        // var oReq = new XMLHttpRequest();
        // oReq.open("POST", 'http://localhost:5000/convert', true);
        // // oReq.setRequestHeader("Content-Type", "multipart/form-data")
        // oReq.onload = function (oEvent) {
        //     // Uploaded.
        //     if (oEvent.target.status === 200) {
        //         const url = oEvent.target.response
        //         a.href = url;
        //         a.download = "output.gif";
        //         document.body.appendChild(a);
        //         a.click();
        //         setTimeout(() => {
        //             document.body.removeChild(a);
        //             window.URL.revokeObjectURL(url);
        //         }, 100);
        //     }
        // };
        // oReq.onerror = function(e){
        //     console.log('error')
        // };
        // data.append('video', blob);
        // oReq.send(data);





    }
  return (
    <div className="App">
        <h2>Function is calling , Please wait for the download</h2>
        <h4>Downloading...</h4>
    </div>
  );
}

export default App;
