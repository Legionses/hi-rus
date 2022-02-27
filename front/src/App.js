import './App.css';
import { useState, useMemo, useEffect} from "react";
import axios from "axios";
import STATIC from "./utils/staticText";
import { Files } from './Files';

const PLACEHOLDER = 'Текст повідомлення сюди / Text message here / Текст сообщения';
const TEXT_MAX_LENGTH = 350

function App() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState('ua');
  const [files, setFiles] = useState([]);
  const [state, setState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);

  
  const requestEmails = async () => {
    setState("loading");

    try {
      const res = await axios.get('api/emails');
      if (res.data.error) {
        setEmails([res.data.error]);
        throw new Error(res.data.error);
      }
      setEmails(res.data);
      setState("success");
    } catch (error) {
      setState("error");
    }
  }
  
  const submitData = async () => {
    if (!text.length) return;
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

  const loadStats = async() => {
    const res = await axios.get('api/stats');
    setStats(res.data);
  } 

  useEffect(() => loadStats(), []);

  const TEXT = useMemo(() => {
      return STATIC[lang];
  }, [lang])

  return (<>
    <section className="App">
        <section className="config">
            <div className="configTitles">
                <p>Відправити привіт з України до Росії.</p>
                <p>Отправить сообщение в Россию.</p>
                <p>Send message to Russians citizens.</p>
            </div>
            <div className="lang">
                <input checked={lang === "ua"} onChange={changeLang} type="radio" value="ua" name="lang" id="lang1"/>
                <label htmlFor="contactChoice1">Українська</label>
                <input checked={lang === 'en'} onChange={changeLang} type="radio" value="en" name="lang" id="lang2"/>
                <label htmlFor="contactChoice1">English</label>
                <input checked={lang === 'ru'}  onChange={changeLang} type="radio" value="ru" name="lang" id="lang3"/>
                <label htmlFor="contactChoice1">Русский</label>
            </div>
            <p className="description">{TEXT.description}</p>
            {stats && <>
            <p> {TEXT.emails}: {stats.emails} </p>
            <p> {TEXT.generated}: {stats.generated} </p>
            </>}
            <address>
              <a href="https://t.me/tell_russians_truth">Канал в Телеграмі / Telegram channel / Канал в Телеграме</a>
            </address>
            <hr />
            <section>
              <h3>{TEXT.manual}</h3>
              <button disabled={state === "loading"} onClick={requestEmails}>{TEXT.generate}</button>
              <p>{emails.join(", ")}</p>
            </section>
            <hr />
            <section>
              <h3>{TEXT.auto}</h3>
              <div className="configText">
                  <textarea value={text} placeholder={PLACEHOLDER} onChange={changeText} maxLength={TEXT_MAX_LENGTH}/>
                  <span className="configTextLength">{text.length}/{TEXT_MAX_LENGTH}</span>
              </div>
            </section>
            <Files ext={["jpg", "png"]} onChange={setFiles} lang={lang}/>
            <button
                className='configSubmit'
                onClick={submitData}
                disabled={state === "loading" || !text.length}>
                {TEXT.btn}
            </button>
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
            </div>
        </section>
    </section>
  </>);
}

export default App;
