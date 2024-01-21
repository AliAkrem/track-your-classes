import React, { useRef, useState } from "react";
import './dropExcelFile.css'
import { IonButton, IonIcon, IonText } from "@ionic/react";
import * as XLSX from 'xlsx';
import { documentOutline } from "ionicons/icons";

import { Students } from "../../context/globalContext";


// Assuming you have the utility function in a separate file


type Props = {
    setStudent_list: React.Dispatch<React.SetStateAction<Students[] | []>>
}

function DragDropFile({ setStudent_list }: Props) {
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileAttached, setFileAttached] = useState(false)
    const handleDrag = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files);
        }
    };

    const handleChange = function (e: any) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    function handleFile(files: FileList | null) {


        if (files) {
            Array.from(files).forEach((file) => {
                const fileName = file.name.toLowerCase();
                const isExcelFile = /\.(xlsx|xls)$/.test(fileName);

                if (isExcelFile) {
                    // Create a new FileReader object
                    const reader = new FileReader();

                    // Event handler for when the file reading is done
                    reader.onload = (evt: any) => {
                        // Parse the data
                        const bstr = evt.target.result;
                        const workbook = XLSX.read(bstr, { type: 'binary' });

                        // Get the first worksheet (you can modify this to loop through all worksheets if needed)
                        const worksheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[worksheetName];



                        // Convert the worksheet to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, 
                        {   header: 1, 
                            range: { s: { c: 0, r: 8 }, e: { c: 2, r: 100 } }
                        }
                        );

                        // Now jsonData contains the data from the worksheet
                        console.log(jsonData);


                        let array_students : any = [];
                    
                        let payload = {}

                        jsonData.map((student: any) => {

                            if(student[0]){
                            payload = {
                                ...payload,
                                first_name: student[1],
                                last_name: student[2],
                                student_code: student[0]
                            }
                            array_students = [... array_students , payload]}

                           
                        })

                        console.log(array_students)

                        setStudent_list(array_students)

                        setFileAttached(true)
                    };

                    // Read the file as binary
                    reader.readAsBinaryString(file);
                } else {
                    alert(`Invalid file type: ${fileName}. Please select an Excel file.`);
                    setStudent_list([])

                }
            });
        }
    }


    return (
        <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input ref={inputRef} type="file" accept=".xlsx, .xls" id="input-file-upload" onChange={handleChange} />
            <label  htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                <div style={{ display: "flex", flexDirection: "column",border : '1px dotted', gap: "10px", alignItems: "center", padding: '15px' }}>

                    {!fileAttached ?
                        <>
                            <IonText   color={'primary'} >
                                Drag and drop your file here or click
                            </IonText>

                            <IonButton  fill="clear" onClick={onButtonClick}>Upload a file</IonButton>
                        </>
                        : <>
                            <IonText color={'primary'} style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", padding: '15px' }}  >
                                file attached
                                <IonIcon icon={documentOutline}></IonIcon>
                            </IonText>

                        </>}


                </div>
            </label>
            {/* <IonButton size="small" fill="outline" onClick={onButtonClick}>Upload a file</IonButton> */}
            {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
        </form>
    );
}

export default DragDropFile;
