import React, { useState } from 'react';
import Html5QrcodePlugin from '../components/Scanner.jsx';
import ResultContainerPlugin from '../components/ResultContainerPlugin.jsx'
const ScannerVision = (props) => {
    const [decodedResults, setDecodedResults] = useState([]);
    const onNewScanResult = (decodedText, decodedResult) => {
        console.log("App [result]", decodedResult);
        setDecodedResults(prev => [...prev, decodedResult]);
    };

    return (
        <div className="App">
            <section className="App-section">
                <div className="App-section-title"> Html5-qrcode React demo</div>
                <br />
                <br />
                <br />
                <Html5QrcodePlugin
                    fps={10}
                    qrbox={300}
                    aspectRatio={16 / 9}
                    disableFlip={false}
                    qrCodeSuccessCallback={onNewScanResult}
                />
                <ResultContainerPlugin results={decodedResults} />
            </section>
        </div>
    );
};

export default ScannerVision
