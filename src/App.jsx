import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);

  /* 📑APUNTES
  * When your component is added to the DOM, React will run your setup function. 
  * After every re-render with changed dependencies, React will first run the cleanup function (if you provided it) 
  * with the old values, and then run your setup function with the new values. 
  * After your component is removed from the DOM, React will run your cleanup function. 
  * */
  useEffect(()=>{
    //Necesitamos que los canvas esten cargados en el DOM antes de pedir su contexto.
    const ctx1 = canvas1Ref.current.getContext('2d');
    const ctx2 = canvas2Ref.current.getContext('2d'); 

    render(ctx1);
    render(ctx2);

  },[]);

  
  

  const drawRectangle = (ctx, x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)

  }
  const clearCanvas = (ctx)=>{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const render = (ctx) =>{
    clearCanvas(ctx);
    drawRectangle(ctx, 0, 0, 100, 100, 'red');
    drawRectangle(ctx, 200, 200, 100, 100, 'blue');
  }

  return (
    <div className='container'>
      <div>
        <h1>Canvas 1</h1>
        <canvas ref={canvas1Ref} width={500} height={500}></canvas>
      </div>
      <div>
        <h1>Canvas 2</h1>
        <canvas ref={canvas2Ref} width={500} height={500}></canvas>
      </div>
    </div>
  )
}

export default App
