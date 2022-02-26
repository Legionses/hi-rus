import './App.css';
import {useRef, useState, useCallback, useMemo} from "react";
import {useDropzone} from 'react-dropzone'
import noImg from "./img.png";
import axios from "axios";
import STATIC from "./utils/staticText";
import { Files } from './Files';

const PLACEHOLDER = 'Текст повідомлення сюди / Text message here / Текст сообщения';

function App() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState('ua');
  const [files, setFiles] = useState([]);
  const [state, setState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // const onDrop = useCallback(acceptedFiles => {
  //   const reader = new FileReader()
  //   const _file = acceptedFiles[0];
  //   reader.onload = () => {
  //   // Do whatever you want with the file contents
  //   const binaryStr = reader.result
  //   img.current.src = binaryStr;
  //   }
  //   reader.readAsDataURL(_file)
  //   fileRef.current = _file;
  // }, []);

  const submitData = async () => {
    // const file = fileRef.current;
    // if (!fileRef || !text.length) return;
    setState("loading");
    setStatusMessage("");

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('attachments', file);
      }
      formData.append('message', text);
      await axios.post('api/send', formData);
      setState("success");
      setStatusMessage("Your email was sent!");
    } catch (error) {
      setState("error");
      setStatusMessage("Error: " + error.message);
    }
    
  }

  const changeText = ({target: {value}}) => setText(value);
  const changeLang = ({target: {value}}) => setLang(value);

  const TEXT = useMemo(() => {
      return STATIC[lang];
  }, [lang])

  return (
    <div className="App">
        <section className="config">
            <div className="configTitles">
                <p>Відправити привіт з України до Росії.</p>
                <p>Отправить сообщение в Россию.</p>
                <p>Send message to Russians citizens.</p>
            </div>
            <div>
                <input checked={lang === "ua"} onChange={changeLang} type="radio" value="ua" name="lang" id="lang1"/>
                <label htmlFor="contactChoice1">Українська</label>
                <input checked={lang === 'en'} onChange={changeLang} type="radio" value="en" name="lang" id="lang2"/>
                <label htmlFor="contactChoice1">English</label>
                <input checked={lang === 'ru'}  onChange={changeLang} type="radio" value="ru" name="lang" id="lang3"/>
                <label htmlFor="contactChoice1">Русский</label>
            </div>
            <p className="description">{TEXT.description}</p>
            <textarea className="configText" value={text} placeholder={PLACEHOLDER} onChange={changeText} maxLength="350"/>
            <Files ext={["jpg", "png"]} onChange={setFiles} lang={lang}></Files>
            <button className='configSubmit' onClick={submitData} disabled={state === "loading"}>{TEXT.btn}</button>
            <span className={state + "-message"}>{statusMessage}</span>
        </section>
        <section className="preview">
            <p className='previewTitle'>Попередній Перегляд / Прев'ю / Preview</p>
            <div className="previewMail">
                <p style={{whiteSpace: "pre-wrap"}}>
                  {text}
                </p>
                <div class="images">
                  {files.map(file => <img className="previewImg" alt="" src={URL.createObjectURL(file)}></img>)}
                </div>
                {/* <img ref={img} className="previewImg" src={noImg} alt=""/> */}
            </div>
        </section>

    </div>
  );
}

export default App;
