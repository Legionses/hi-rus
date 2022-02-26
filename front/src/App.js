import './App.css';
import {useRef, useState, useCallback} from "react";
import {useDropzone} from 'react-dropzone'
import noImg from "./img.png";
import axios from "axios";

function App() {
  const [text, setText] = useState('');
  const img = useRef(null);
  const fileRef = useRef(null);

  const onDrop = useCallback(acceptedFiles => {
    const reader = new FileReader()
    const _file = acceptedFiles[0];
    reader.onload = () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result
      img.current.src = binaryStr;
    }
    reader.readAsDataURL(_file)
    fileRef.current = _file;
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const submitData = () => {
    const file = fileRef.current;
    console.log('file', file)
    console.log('text', text)
    if (!fileRef || !text.length) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);

    // axios.post('/upload/image', {body: formData});
    console.log(formData)
  }

  const changeText = ({target: {value}}) => setText(value)
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Отправить привет с украины без смс и регистрации.
        </p>
        <button onClick={submitData}>Отправить</button>
        <textarea value={text} onChange={changeText}/>
        <div {...getRootProps()}>
          <input {...getInputProps()}/>
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
