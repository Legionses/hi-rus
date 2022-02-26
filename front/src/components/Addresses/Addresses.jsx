import axios from "axios";
import React from "react";
import { useState } from "react";
import { Files } from "../../Files";
import "./style.css";

const Addresses = () => {
    const [text, setText] = useState("");
    const [password, setPassword] = useState("");
    const [files, setFiles] = useState([]);
    const [state, setState] = useState("idle");
    const [statusMessage, setStatusMessage] = useState("");
  
    const submitData = async () => {
      setState("loading");
      setStatusMessage("");
  
      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append('files', file);
        }
        formData.append('text', text);
        const res = await axios.post('api/addEmails', formData);
        if (res.data.error) {
            throw new Error(res.data.error)
        } else if (res.status !== 200) {
            throw new Error(res.statusText);
        }

        setState("success");
        setStatusMessage(`Added ${res.data.count} emails`);
      } catch (error) {
        setState("error");
        setStatusMessage("Error: " + error.message);
      }
      
    }
    
    const changeText = ({target: {value}}) => setText(value);
    const changePassword = ({target: {value}}) => setPassword(value);

    return (
        <section>
            <p className="description">Emails format: one per line, in text field below or in .txt, .dump files</p>
            <textarea className="configText" value={text} placeholder="email@some.com" onChange={changeText} maxLength="25000000"/>
            <Files accept={[".txt", ".dump"]} onChange={setFiles} lang="en"></Files>
            <input className="configText" type="password" value={password} placeholder="Password" onChange={changePassword}/>
            <button className='configSubmit' onClick={submitData} disabled={state === "loading"}>Add</button>
            <span className={state + "-message"}>{statusMessage}</span>
        </section>
    );
}

export default Addresses