import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { IonContent, IonIcon, IonInput, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonRadio, IonRadioGroup, IonText, IonTextarea } from '@ionic/react'
import React, { useEffect, useRef, useState } from 'react'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { Students } from '../../context/globalContext'


import './studentListPresence.css'
import { archive, pencil } from 'ionicons/icons'
import { nanoid } from 'nanoid'



type Props = {
    group_id: number,
    student_list: [] | Students[]
    attendanceResult: [] | AttendanceResult[]
    setAttendanceResult: React.Dispatch<React.SetStateAction<[] | AttendanceResult[]>>
}



export type AttendanceResult = {

    student: Students,
    state: 'P' | 'AB' | undefined,
    comment?: string,


}



export default function StudentListPresence({ group_id, attendanceResult, setAttendanceResult }: Props) {





    const { performSQLAction } = useSQLiteDB()

    const [list_student, setList_student] = useState<Students[] | []>([])

    const [revalidateGroup, setRevalidateGroup] = useState(0)


    useEffect(() => {


        if (list_student?.length == 0) {
            setRevalidateGroup(Math.random())
        }
        if (group_id != undefined)
            SELECT_STUDENTS_IN_GROUP(group_id);



    }, [group_id, revalidateGroup]);




    const SELECT_STUDENTS_IN_GROUP = (group_id: number) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`
              SELECT
                student.student_id,
                student.student_code,
                student.first_name,
                student.last_name,
                Groupp.group_id,
                Groupp.group_number , 
                Groupp.group_type
              FROM Groupp
              JOIN group_student ON Groupp.group_id = group_student.group_id
              JOIN student ON group_student.student_id = student.student_id
              WHERE Groupp.group_id = ${group_id};
            `).then(res => {

                    if (res?.values) {
                        const studentsInGroup = res?.values?.map((row: any) => ({
                            student_id: row.student_id,
                            student_code: row.student_code,
                            first_name: row.first_name,
                            last_name: row.last_name,
                        }));

                        // setGroupInfo({group_id : res?.values.})

                        // Use the studentsInGroup array as needed


                        setList_student(studentsInGroup)
                    }
                })




            });
        } catch (error) {

            alert((error as Error).message + ' error fetch student');
        }
    };


    // const [attendanceResult, setAttendanceResult] = useState<AttendanceResult[] | []>([])






    useEffect(() => {
        const initialAttendance: AttendanceResult[] = list_student.map((student) => ({
            student: student,
            state: undefined,
            comment: ''

        }));
        setAttendanceResult(initialAttendance);
    }, [list_student]);


    const handleAttendanceChange = (e: CustomEvent, studentId: number, newState: 'P' | 'AB') => {
        // Update the state in the attendanceResult array
        e.preventDefault();
        setAttendanceResult((prevAttendance) =>
            prevAttendance.map((ar) =>
                ar.student.student_id === studentId ? { ...ar, state: newState } : ar
            )
        );
    };

    const handleStudentCommentChange = (e: CustomEvent, studentId: number, newComment: string) => {
        // Update the state in the attendanceResult array
        e.preventDefault();
        setAttendanceResult((prevAttendance) =>
            prevAttendance.map((ar) =>
                ar.student.student_id === studentId ? { ...ar, comment: newComment } : ar
            )
        );


    };


    console.log(attendanceResult);



    const commentInputRef = useRef<HTMLIonTextareaElement | null>(null)



    const [commentModalIsOpened, setCommentModalIsOpened] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Students | undefined>()

    const commentModal = useRef<HTMLIonModalElement | null>(null)





    const StudentList = attendanceResult ? attendanceResult?.map((({ student, state, comment }, idx) => {




        return (


            <div key={`${student.student_id + student.student_code + student.last_name}`}  >
                <IonItemSliding   >
                    <IonItemOptions side="start">
                        <IonItemOption color="success" id={`open-modal+${student.student_id}`} onClick={() => {

                            setCommentModalIsOpened(true);
                            setSelectedStudent(student);

                        }}  >

                            <IonIcon slot="icon-only" icon={pencil}></IonIcon>

                        </IonItemOption>
                    </IonItemOptions>
                    <IonItem key={student.student_id}  >
                        <IonLabel class="ion-text-wrap" >


                            <h2 style={{ display: 'flex', alignItems: 'center' , gap: '4px' } } > {comment && comment?.length > 0 ? <IonIcon icon={pencil} size='small' color='success'  ></IonIcon> : null} {idx + 1} - {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
                        </IonLabel>
                        <IonRadioGroup
                            style={{ display: 'flex', gap: '20px', marginLeft: '8px', padding: '10px' }}
                            onIonChange={(e) => handleAttendanceChange(e, student.student_id, e.detail.value)}
                            value={state}
                        >
                            <IonRadio color={'success'} labelPlacement='start' value="P">P</IonRadio>
                            <IonRadio color={'danger'} labelPlacement='start' value="AB">Ab</IonRadio>
                        </IonRadioGroup>
                    </IonItem>
                </IonItemSliding>



            </div>
        )


    })) : null






    return (
        <div>
            <div>{StudentList}</div>

            {selectedStudent != undefined ?
                <IonModal
                    ref={commentModal}
                    onIonModalDidDismiss={() => {

                        setSelectedStudent(undefined);
                        setCommentModalIsOpened(false);

                        if (commentInputRef.current) {
                            commentInputRef.current.value = ''
                        }


                    }}
                    onIonModalWillDismiss={
                        (e) => {
                            handleStudentCommentChange(e, selectedStudent.student_id, (commentInputRef.current?.value || '').toString())
                        }
                    }

                    isOpen={commentModalIsOpened && selectedStudent != undefined}
                    initialBreakpoint={0.25}
                    breakpoints={[0.0, 0.25, 0.5, 0.75]}>
                    <IonContent className="ion-padding">

                        <IonList inset>

                            <IonLabel className='ion-padding' >
                                <IonText>
                                    {selectedStudent.first_name.toLowerCase()} {selectedStudent.last_name.toLowerCase()}
                                </IonText>
                            </IonLabel>
                            <IonTextarea
                                ref={commentInputRef}
                                className='ion-padding'
                                label="comment"
                                labelPlacement="start"
                                errorText="Invalid name"
                            />

                        </IonList>
                    </IonContent>
                </IonModal> : null
            }
        </div>
    )
}
