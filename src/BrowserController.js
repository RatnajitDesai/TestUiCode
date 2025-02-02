import { useEffect, useMemo, useState } from 'react';
import Pixelmatch, {pixelmatch} from 'pixelmatch';
import './App.css';


const BrowserController = (props) => {

    const [bws, setBaseSocket] = useState()
    const [aws, setActualSocket] = useState()
    const [baseImage, setBaseImage] = useState()
    const [actualImage, setActualImage] = useState()
    const [comparisonImage, setComparisonResult] = useState()

    useEffect(() => {
        const baseSocket = new WebSocket('ws://localhost:8080')
        const actualSocket = new WebSocket('ws://localhost:8085')

        if (baseSocket) {
            baseSocket.onopen = () => {
                console.log('Connected to Baseline WebSocket Server');
            };

            baseSocket.onmessage = (event) => {
                const response = JSON.parse(event.data);
                console.log('📩 Message from server:', response);

                if (response.status === 'Page Opened') {
                    console.log(response.status)
                }

                if (response.status === 'Screenshot Taken') {
                    props.setBaseImage(`data:image/png;base64,${response.image}`);
                    setBaseImage(`${response.image}`)
                }

                if (response.status === 'Baseline Content Extracted') {
                }
            };

            baseSocket.onclose = () => {
                console.log('❌ Baseline WebSocket Disconnected');
            };
        }

        if (actualSocket) {
            // Actual Base Socket    
            actualSocket.onopen = () => {
                console.log('✅ Connected to Actual WebSocket Server');
                actualSocket.send(JSON.stringify({ action: 'openPage', props }));
            };

            actualSocket.onmessage = (event) => {
                const response = JSON.parse(event.data);
                console.log('📩 Message from server:', response);

                if (response.status === 'Page Opened') {
                    console.log(response.status)
                }

                if (response.status === 'Screenshot Taken') {
                    props.setActualImage(`data:image/png;base64,${response.image}`);
                    setActualImage(`${response.image}`)
                }

                if (response.status === 'Baseline Content Extracted') {
                }
            };

            actualSocket.onclose = () => {
                console.log('❌ Baseline WebSocket Disconnected');
            };
        }
        setBaseSocket(baseSocket)
        setActualSocket(actualSocket)
        return ()=>{
            baseSocket.close()
            actualSocket.close()
        }
    }, []);

    useEffect(()=>{
        if(props.data.length == 2){
            openBasePage(props.data[0].url)
            openActualPage(props.data[1].url)
        }
    }, [props])

    const openBasePage = (url) => {
        if (url && bws) bws.send(JSON.stringify({ action: 'openPage', url }));
    };

    const openActualPage = (url) => {
        if (url && aws) aws.send(JSON.stringify({ action: 'openPage', url }));
    };

    const captureBaselineScreenshot = ()=>{
        const data = props.data[0];
        if (data && bws) bws.send(JSON.stringify({ action: 'takeScreenshot', data }));
    } 

    const captureActualScreenshot = ()=>{
        const data = props.data[1];
        if (data && aws) aws.send(JSON.stringify({ action: 'takeScreenshot', data }));
    } 

    const compareImages = ()=>{
        if(baseImage && actualImage){
            const images = {"baseImage" : baseImage, "actualImage": actualImage}
            if (images && aws) aws.send(JSON.stringify({ action: 'takeScreenshot', images }));
        }
    }

    return (
        <div style={{ padding: "10px" }}>
            <h2>WebSocket Browser Automation</h2>
            <button onClick={captureBaselineScreenshot}>Capture Baseline Screeshot</button>
            <button onClick={captureActualScreenshot}>Capture Actual Screeshot</button>
            <button onClick={compareImages}>Compare</button>
            <img className='image-container' src={`data:image/png;base64,${comparisonImage}`}></img>
        </div>
    );
};

export default BrowserController;
