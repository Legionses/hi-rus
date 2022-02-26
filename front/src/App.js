import './App.css';
import {useRef, useState, useCallback, useMemo} from "react";
import {useDropzone} from 'react-dropzone'
import noImg from "./img.png";
import axios from "axios";
import STATIC from "./utils/staticText";

function App() {
  const [text, setText] = useState('Текст повідомлення сюди / Text message here / Текст сообщения');
  const [lang, setLang] = useState('ua');
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
    formData.append('attachments', file);
    formData.append('message', text);

    axios.post('api/send', formData);
    console.log(formData)
  }

  const changeText = ({target: {value}}) => setText(value);
  const changeLang = ({target: {value}}) => setLang(value);

  const TEXT = useMemo(() => {
      return STATIC[lang];
  },[lang])

  return (
    <div className="App">
        <section className="config">
            <div className="configTitles">
                <p>Відправити привіт з України до Росії.</p>
                <p>Отправить сообщение в Россию.</p>
                <p>Send message to Russians citizens.</p>
            </div>
            <button className='configSubmit' onClick={submitData}>{TEXT.btn}</button>
            <div>
                <input checked={lang === "ua"} onChange={changeLang} type="radio" value="ua" name="lang" id="lang1"/>
                <label htmlFor="contactChoice1">Українська</label>
                <input checked={lang === 'en'} onChange={changeLang} type="radio" value="en" name="lang" id="lang2"/>
                <label htmlFor="contactChoice1">English</label>
                <input checked={lang === 'ru'}  onChange={changeLang} type="radio" value="ru" name="lang" id="lang3"/>
                <label htmlFor="contactChoice1">Русский</label>
            </div>
            <p className="description">{TEXT.description}</p>
            <textarea className="configText" value={text} onChange={changeText} maxLength="350"/>
            <div {...getRootProps()} className='uploadZone'>
                <input {...getInputProps()}/>
                {
                    isDragActive ? <p> {TEXT.dnd_active} ...</p> : <p>{TEXT.dnd}</p>
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
