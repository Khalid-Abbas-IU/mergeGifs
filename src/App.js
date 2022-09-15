import { mergedGifs } from "./components/designer/mergeGifs";
import React, {useEffect} from "react";


const gifs = ['gifs/loading.gif','gifs/CosmicBlueTongue.gif','gifs/HynoGlasses.gif','gifs/Cigarette.gif']
function App() {
    useEffect( ()=>{
        getMergedGifs()
    },[])

    const getMergedGifs =async ()=>{
        const blob = await mergedGifs(gifs)
        if (!blob) return;
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
  return (
    <div className="App">
        <h2>Function is calling , Please wait for the download</h2>
        <h4>Downloading...</h4>
    </div>
  );
}

export default App;
