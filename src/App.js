import './App.css';
import MergedGifsComp from "./components/designer";
import { mergedGifs } from "./components/designer/mergeGifs";
import React, {useEffect} from "react";

let left = 0, top = 0, maxWidth = 300, maxHeight = 300;
const gifs = [
    {
        src:'gifs/loading.gif',
        maxWidth,maxHeight
    },
    {
        src:'gifs/CosmicBlueTongue.gif',
        maxWidth,maxHeight
    },
    {
        src:'gifs/HynoGlasses.gif',
        maxWidth,maxHeight
    },
    {
        src:'gifs/Cigarette.gif',
        maxWidth,maxHeight
    },

]
function App() {
    useEffect( ()=>{
        // getMergedGifs()
    },[])

    const getMergedGifs =async ()=>{
        const blob = await mergedGifs(gifs,maxWidth,maxHeight, 5000)
        if (!blob) return;
        const url = window.URL.createObjectURL(blob);
        // setGifImg(url)
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
      <MergedGifsComp/>
    </div>
  );
}

export default App;
