import logo from './logo.svg';
import housing_logo from './housing_logo.jpg';
import './App.css';
import {useState, useEffect, useCallback, useRef} from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios';
import ImageSlider from "react-image-comparison-slider";

function App() {
  const [id, setId] =  useState(null)
  const [isLoading, setIsLoading] =  useState(false)
  const [promptValue, setPromptValue] =  useState('')
  const loadingStatus = useRef();
  const [readerFile, setReaderFile] =  useState(null)
  const [url1, setURL1] =  useState(null)
  const [url2, setURL2] =  useState(null)

  useEffect(() => {
    loadingStatus.current = false
  },[])

  const onDrop = useCallback(acceptedFiles => {
    console.log('The file is dropped', acceptedFiles)
    const fileReader = new FileReader();
      fileReader.onload = () => {
        const srcData = fileReader.result;
        setReaderFile(srcData)
      };
      fileReader.readAsDataURL(acceptedFiles[0]);
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    useEffect(() => {
      if(id && !loadingStatus.current) {
          let intervalID = setInterval(() => {
          secondAPI(id);
        }, 2000);
        return () => {
          if(loadingStatus.current) {
            console.log("clearing interval", intervalID)
            clearInterval(intervalID)
          }
        };
      }
    }, [id, loadingStatus.current]);

  const firstAPI = async () => {
    setIsLoading(true)
    const testData = {
      version: '854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b',
      input: {
        image:
          readerFile,
        prompt: promptValue,
      },
    };
    const ans = await axios({
      method: 'post',
      url: 'https://api.replicate.com/v1/predictions',
      data: testData,
      headers: {
        Authorization: 'Token r8_PtPBICbf7zG6jYmPxzK4weQaJl84tEg2Lv48e',
      },
    });
    setId(ans.data.id)
  };

  const secondAPI = async (versionId) => {
    const newURL = 'https://api.replicate.com/v1/predictions/' + versionId;
    const actualAns = await axios({
      method: 'get',
      url: newURL,
      headers: {
        Authorization: 'Token r8_PtPBICbf7zG6jYmPxzK4weQaJl84tEg2Lv48e',
      },
    });

    if(actualAns.data.status === 'succeeded' && actualAns?.data?.output?.length > 1) {
      loadingStatus.current = true
      setURL1(actualAns.data.output[0])
      setURL2(actualAns.data.output[1])
      setIsLoading(false)
    }
    return actualAns;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className='housing_logo'>
          <img src={housing_logo} style={{ width: 300, height: 50 , marginTop: 10}}/>
        </div>
        {!readerFile ? <img src={logo} className="App-logo" alt="logo" /> : <img src={readerFile} style={{ width: 850, height: 450 , margin: 20}}/> }
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            readerFile ?
              <p style={{fontSize: '0.5em'}}>Image Added Successfully...</p> :
              <p>Drag 'n' drop some files here, or click to select files</p>
          }
        </div>
        <label style={{marginTop: 20}}>Please Enter the Prompt</label>
        <input onChange={(e) => {setPromptValue(e.target.value)}} value={promptValue} style={{ width: 350, height: 30, marginTop: 20}} />
        <br />
        <button onClick= {() => firstAPI()} style={{background: "green", color: 'white', width: 120, height: 40, border: 1}}>Convert</button>
        {isLoading && <p>Loading....</p>}
        {/* {id && <p>The id is :{id}</p>} */}
        {/* {url1 && <a href={url1} target="_blank">Image 1</a>}
        {url2 && <a href={url2} target="_blank">image 2</a>} */}
       <hr
        style={{
            background: 'blue',
            height: 0.1,
            width: '100%',
            marginTop: 40,
            marginBottom: 10
        }}
    />
        {url2 && 
        <>
          <div className="title-div">
            <span className="img-div" style={{marginRight: 300}}>Contour Image</span>
            <span className="img-div">Converted Image</span>
          </div>
          <div className="image-div">
              <img className="img-div" src={url1} alt="" />
              <img className="img-div" src={url2} alt="" />
          </div>
        </>
        }
        
       {url2 && 
       <>
        <span style={{marginBottom: 20}}>Please slide to compare both images</span>
        <div style={{ width: 900, height: 450 }}>
              <ImageSlider
                  image1={url2}
                  image2={readerFile}
                  onSlide={() => {
                    console.log("sliding");
                  }}
              />
          </div>
       </>
        }
        
        <br />
      </header>
    </div>
  );
}

export default App;
