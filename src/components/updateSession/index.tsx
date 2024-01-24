import { IonButton, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonLoading, IonModal, IonRadio, IonRadioGroup, IonText, IonTextarea, IonTitle, IonToolbar } from '@ionic/react'
import { arrowBack, pencil, } from 'ionicons/icons'
import { GroupSQL, SQLClass, useGlobalContext } from '../../context/globalContext'
import { useEffect, useRef, useState } from 'react'

import useConfirmationAlert from '../../composables/useConfirmationAlert'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { SQLiteDBConnection } from '@capacitor-community/sqlite'


export type ClassGroup = {

    group: GroupSQL
    class: SQLClass


}

// type AttendanceResult = {
//     student: Students;
//     state: 'P' | 'Ab' | undefined;
// }


type AttendanceResult = {

    student_id: number

    first_name: string

    last_name: string

    state: 'P' | 'AB' | 'ABJ'

    comment: string,

    student_code: string
}




type Props = {

    isOpen: boolean
    close: React.Dispatch<React.SetStateAction<boolean>>

    session_id: number | undefined
    selectedDate: string
    setRevalidateSessionsList: React.Dispatch<React.SetStateAction<number>>
}



export const UpdateSession = ({ isOpen, close, session_id, selectedDate, setRevalidateSessionsList }: Props) => {


    const dateSession = useRef<HTMLIonDatetimeElement>(null)

    const { performSQLAction } = useSQLiteDB()

    const { setRevalidate } = useGlobalContext()

    const [date_Session, setDate_Session] = useState(selectedDate)

    console.log(selectedDate)


    const { ConfirmationAlert, showConfirmationAlert } = useConfirmationAlert()




    const [attendanceResult, setAttendanceResult] = useState<AttendanceResult[]>()

    // const [date, setdate] = useState(second)





    const onSubmit = () => {


        if (attendanceResult?.some((attendance) => attendance.state === undefined) || attendanceResult?.length == 0) {
            return
        }

        console.log(date_Session)

        if (session_id && attendanceResult) {
            updateSession(date_Session, session_id, attendanceResult)
        }

    }


    const updateSession = async (sessionDatetime: string, session_id: number, attendance: AttendanceResult[]) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {



                await db?.query(
                    'UPDATE  session_presence SET session_date  = ? WHERE session_id = ?',
                    [sessionDatetime, session_id]
                )



                await Promise.all(attendance.map(async (student) => {
                    await db?.query(
                        'UPDATE  attendance SET  state = ? , comment = ?  WHERE session_id = ? AND student_id = ?    ;',
                        [student.state,student.comment , session_id, student.student_id]
                    );

                }))





            }, async () => {
                close(false)
                setRevalidate(Math.random())
                setRevalidateSessionsList(Math.random())
            })






        } catch (error) {
            alert((error as Error).message);
        }
    };



    const [revalidateEffect, setRevalidateEffect] = useState(0)


    useEffect(() => {


        if (attendanceResult == undefined) {


            if (revalidateEffect == 0 && isOpen) {

                setRevalidateEffect(Math.random())

            }

        }

        if (session_id) {
            fetchAttendanceBySession(session_id)
            setDate_Session(selectedDate)
        }

    }, [revalidateEffect, isOpen])


    const handleAttendanceChange = (e: CustomEvent, studentId: number, newState: 'P' | 'AB' | 'ABJ') => {
        e.preventDefault();

        setAttendanceResult((prevAttendance) =>
            prevAttendance?.map((ar) =>
                ar.student_id === studentId ? { ...ar, state: newState } : ar
            )
        );

    };

    const handleCommentChange = (e: CustomEvent, studentId: number, newComment: string) => {
        e.preventDefault();

        setAttendanceResult((prevAttendance) =>
            prevAttendance?.map((ar) =>
                ar.student_id === studentId ? { ...ar, comment: newComment } : ar
            )
        );


    };





    const fetchAttendanceBySession = async (sessionId: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`
                    SELECT
                        s.student_id,
                        s.first_name,
                        s.last_name,
                        s.student_code,
                        a.state, 
                        a.comment
                    FROM
                        attendance a
                    JOIN
                        student s ON a.student_id = s.student_id
                    WHERE
                        a.session_id = ?;
                `, [sessionId])

                    .then(res => {


                        setAttendanceResult(res.values as AttendanceResult[])


                    })
                    .catch(err => {

                        console.log(err)

                    })


            })
        } catch (error) {
            alert((error as Error).message);
        }
    };


    const StudentList = attendanceResult ? attendanceResult?.map(((student, idx) => {

        return (

            <IonItemSliding key={student.student_code} >
                <IonItemOptions side="start">
                    <IonItemOption color="success" onClick={() => {

                        setCommentModalIsOpened(true);
                        setSelectedStudent({
                            student_id: student.student_id,
                            first_name: student.first_name,
                            last_name: student.last_name,
                            student_code: student.student_code,
                            comment: student.comment,
                            state: student.state,
                        });


                    }}  >

                        <IonIcon slot="icon-only" icon={pencil}></IonIcon>

                    </IonItemOption>
                </IonItemOptions>

                <IonItem key={student.student_code}>
                    <IonLabel class="ion-text-wrap" >
                    <h2 style={{ display: 'flex', alignItems: 'center' , gap: '4px' } } > {student.comment && student.comment?.length > 0 ? <IonIcon icon={pencil} size='small' color='success'  ></IonIcon> : null}{idx + 1} - {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
                    </IonLabel>
                    <IonRadioGroup

                        style={{ display: 'flex', gap: '20px', marginLeft: '8px', padding: '10px' }}
                        onIonChange={(e) => handleAttendanceChange(e, student.student_id, e.detail.value)}

                        value={student.state}
                    >
                        <IonRadio color={'success'} labelPlacement='stacked' value="P">P</IonRadio>
                        <IonRadio color={'danger'} labelPlacement='stacked' value="AB">Ab</IonRadio>
                        <IonRadio color={'success'} labelPlacement='stacked' value="ABJ">Ab J</IonRadio>
                    </IonRadioGroup>
                </IonItem>
            </IonItemSliding>
        )


    })) : <IonLoading className="custom-loading" isOpen={!attendanceResult} message="Loading" duration={200} />






    const commentInputRef = useRef<HTMLIonTextareaElement | null>(null)



    const [commentModalIsOpened, setCommentModalIsOpened] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<AttendanceResult | undefined>()

    const commentModal = useRef<HTMLIonModalElement | null>(null)







    return (

        <IonModal isOpen={isOpen} onIonModalDidDismiss={() => { close(false) }}   >
            <IonHeader>
                <IonToolbar>
                    <IonButton onClick={() => close(false)} size='default' fill='clear' slot="start"   >

                        <IonIcon icon={arrowBack} ></IonIcon>

                    </IonButton>
                    <IonTitle size="small" >
                        update session
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen >





                <IonList>
                    <IonItem>
                        <IonDatetimeButton datetime="datetime"></IonDatetimeButton>

                        <IonButton
                            style={{ width: '24%' }}
                            color={'success'}
                            size='default'
                            slot='end'
                            onClick={() => { onSubmit() }}
                        >Save</IonButton>

                    </IonItem>


                </IonList>



                <IonModal keepContentsMounted={true}>
                    <IonDatetime
                        id="datetime"
                        ref={dateSession}
                        value={date_Session}
                        onIonChange={() => { setDate_Session(String(dateSession.current?.value)) }}
                    ></IonDatetime>
                </IonModal>


                {StudentList}


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
                                handleCommentChange(e, selectedStudent.student_id, (commentInputRef.current?.value || "") as string)
                            }
                        }

                        isOpen={commentModalIsOpened && selectedStudent != undefined}
                        initialBreakpoint={0.5}
                        breakpoints={[0, 0.25, 0.5, 0.75]}>
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

                                    value={selectedStudent.comment}
                                    label="comment"
                                    labelPlacement="start"
                                    errorText="Invalid name"
                                />

                            </IonList>
                        </IonContent>
                    </IonModal> : null
                }





                {ConfirmationAlert}

            </IonContent>
        </IonModal>

    )
}
