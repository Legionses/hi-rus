import './App.css';
import {useRef, useState, useCallback} from "react";
import {useDropzone} from 'react-dropzone'
import noImg from "./img.png";
import axios from "axios";

function App() {
  const [text, setText] = useState('Текст повідомлення сюди / Text message here / Текст сообщения');
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
    if (!fileRef || !text.length) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);

    // axios.post('/upload/image', {body: formData});
    console.log(formData)
  }

  const changeText = ({target: {value}}) => setText(value);

  return (
    <div className="App">
        <section className="config">
            <div className="configTitles">
                <p>Відправити привіт з України до Росії.</p>
                <p>Отправить сообщение в Россию.</p>
                <p>Send message to Russians citizens.</p>
            </div>

            <button className='configSubmit' onClick={submitData}>Отправить</button>
            <textarea className="configText" value={text} onChange={changeText} maxLength="350"/>
            <div {...getRootProps()} className='uploadZone'>
                <input {...getInputProps()}/>
                {
                    isDragActive ?
                        <p>Вкинути сюди / Drop the files here / Бросить сюда ...</p> :
                        <>
                        <p>Перенесіть фото сюди, або клікніть для вибору</p>
                        <p>Drag 'n' drop some photo here, or click to select photo</p>
                        <p>Перенесите фото сюда, или кликните для загрузки фотографии</p>
                        </>
                }
            </div>
        </section>
        <section className="preview">
            <p className='previewTitle'>Попередній Перегляд / Прев'ю / Preview</p>
            <div className="previewMail">
                <textarea
                    className="previewText"
                    value={text}
                    readOnly
                />
                <img ref={img} className="previewImg" src={noImg} alt=""/>
            </div>
        </section>

    </div>
  );
}

export default App;
