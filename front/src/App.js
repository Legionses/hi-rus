import './App.css';
import {useRef, useState, useCallback} from "react";
import {useDropzone} from 'react-dropzone'
import noImg from "./img.png";

function App() {
  const [text, setText] = useState('');
  const img = useRef(null);
  const onDrop = useCallback(acceptedFiles => {
    const reader = new FileReader()
    console.log('acceptedFiles', acceptedFiles)
    const file = acceptedFiles[0];
    reader.onload = () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result
      console.log(binaryStr)
      img.current.src = binaryStr;
    }
    reader.readAsDataURL(file)
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const changeText = ({target: {value}}) => setText(value)
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Отправить привет с украины без смс и регистрации.
        </p>
        <textarea value={text} onChange={changeText}/>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag 'n' drop some files here, or click to select files</p>
          }
        </div>
        <img ref={img} className="imgPreview" src={noImg} alt=""/>
      </header>
    </div>
  );
}

export default App;
