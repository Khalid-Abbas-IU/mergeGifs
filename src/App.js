import './App.css';
import MergedGifsComp from "./components/designer";
import { mergedGifs } from "./components/designer/mergeGifs";
import React, {useEffect, useState} from "react";
const gifs = [
    {
        src:'https://media.giphy.com/media/HufOeXwDOInlK/giphy.gif',
        dimension:{ x:0, y:50}
    },
    {
        src:'https://media.giphy.com/media/11ZSwQNWba4YF2/giphy.gif',
        dimension:{x:400,y:50}
    },
    {
        src:'https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif',
        dimension:{x:50,y:300}
    },
    {
        src:'giffy.gif',
        dimension:{x:400,y:300}
    }
]

function App() {
    const [gifImg, setGifImg] = useState('')
    // useEffect(async ()=>{
    //     // const img = await mergedGifs(gifs)
    //     // setGifImg(img)
    // },[])
  return (
    <div className="App">
      {/*<img src={gifImg} alt={"img"}/>*/}
      <MergedGifsComp/>
    </div>
  );
}

export default App;
