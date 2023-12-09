import React, { useRef } from "react";
import './dropExcelFile.css'
import { IonButton, IonText } from "@ionic/react";



function handleFile(files: FileList | null) {

    if (files) {
        Array.from(files).forEach((file) => {
            const fileName = file.name.toLowerCase();
            const isExcelFile = /\.(xlsx|xls)$/.test(fileName);

            if (isExcelFile) {
                // Handle the Excel file here
                alert(`Excel file detected: ${fileName}`);
            } else {
                alert(`Invalid file type: ${fileName}. Please select an Excel file.`);
            }
        });
    }
}

// drag drop file component
export default function DragDropFile() {
    // drag state
    const [dragActive, setDragActive] = React.useState(false);
    // ref
    const inputRef = useRef<HTMLInputElement>(null);

    // handle drag events
    const handleDrag = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // triggers when file is dropped
    const handleDrop = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files);
        }
    };

    // triggers when file is selected with click
    const handleChange = function (e: any) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files);
        }
    };

    // triggers the input when the button is clicked
    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input ref={inputRef} type="file"  accept=".xlsx, .xls" id="input-file-upload" multiple={true} onChange={handleChange} />
            <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                <div style={{ display : "flex" ,gap : "10px", alignItems : "center" }} >
                    <IonText color={'primary'} >
                        Drag and drop your file here or
                    </IonText>
                    <IonButton  size="small" fill="outline"  onClick={onButtonClick}>Upload a file</IonButton>
                </div>
            </label>
            {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
        </form>
    );
};

