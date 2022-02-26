import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import STATIC from "./utils/staticText";


export const Files = ({onChange, accept, lang}) => {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop: onChange,
        accept,
        maxFiles: 5,
        maxSize: 1024*1024*25
    });

    const TEXT = useMemo(() => {
        return STATIC[lang];
    }, [lang])

    return (
        <div {...getRootProps()} className='uploadZone'>
            <input {...getInputProps()}/>
            {
                isDragActive ? <p> {TEXT.dnd_active} ...</p> : <p>{TEXT.dnd}</p>
            }
        </div>
    );
}
