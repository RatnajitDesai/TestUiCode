import logo from './logo.svg';
import './App.css';
import BrowserController from './BrowserController';
import { useEffect, useMemo, useState } from 'react';

function App() {

  const [data, setData] = useState([{}])
  const [baselineUrl, setBaselineUrl]= useState()
  const [actualUrl, setActualUrl]= useState()
  const [baseImage, setBaseImage] = useState()
  const [actualImage, setActualImage] = useState()


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className='container'>
        {/* Baseline Image folder
          Allow uploading Figma image
        */}
        <div className='baseline-container' >
          {
          /* 
          Getting baseline Image from the application at runtime
            - Provides option to provide application url
            - Start websocket session with browser instance
          */
          }

            <div className='image-container'>
              <img src={baseImage} alt='Baseline Image'/>
            </div>

            <div>
              <input placeholder='URL' onChange={(e)=> setBaselineUrl(e.target.value)}/>
              {/* <input placeholder='CSS Locator'/> */}
              {/* <button placeholder='Capture Screenshot' title='Capture Screenshot' onClick={()=>{setData({url:baselineUrl, imageType:'base'})}}>Capture Baseline</button> */}
            </div>
        </div>

        <div className='actual-container'>
          {/* Getting actual Image from the application at runtime
            - Provides option to provide application url
            - Start websocket session with another browser instance
        */}
        
          <div className='image-container'>
            <img src={actualImage} alt='Actual Image'/>
          </div>

          <div>
          <input placeholder='URL' onChange={(e)=> setActualUrl(e.target.value)}/>
          {/* <input placeholder='CSS Locator'/> */}
              {/* <button placeholder='Capture Screenshot' title='Capture Screenshot' onClick={()=>{setData({url:actualUrl, imageType:'actual'})}}>Capture Actual</button> */}
          </div>

        </div>
        <button onClick={()=>{setData([{url:actualUrl, cssLocator:'nav[aria-label="Top languages"]', imageType:'actual'}, {url:baselineUrl, cssLocator:'nav[aria-label="Top languages"]', imageType:'base'}])}} >Start</button>
      </div>

      <BrowserController data={data} setBaseImage={setBaseImage} setActualImage={setActualImage}></BrowserController>

    </div>
  );
}

export default App;
