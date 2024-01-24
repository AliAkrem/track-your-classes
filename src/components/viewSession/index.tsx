import { IonButton, IonChip, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonLoading, IonModal, IonRadio, IonRadioGroup, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react'
import { arrowBack, pencil } from 'ionicons/icons'
import { GroupSQL, SQLClass, Students } from '../../context/globalContext'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { useEffect, useRef, useState } from 'react'
import { formatDateTime } from '../sessionsList'


export type ClassGroup = {

    group: GroupSQL
    class: SQLClass


}

type AttendanceResult = {

    first_name: string

    last_name: string

    state: 'P' | 'AB' | 'ABJ'

    comment: string;

    student_code: string


}



type Session = {

    group_number: number

    group_type: string

    level_year: number

    module_name: string

    session_date: string

    session_id: number

    specialty_level: string

    specialty_name: string
}



type Props = {

    isOpen: boolean
    close: React.Dispatch<React.SetStateAction<boolean>>

    session_id: number | undefined
}



export const ViewSession = ({ isOpen, close, session_id }: Props) => {


    const { performSQLAction, initialized } = useSQLiteDB()

    const [attendanceResult, setAttendanceResult] = useState<AttendanceResult[] | []>([])

    const [revalidateEffect, setRevalidateEffect] = useState(0)

    const [sessionDetails, setSessionDetails] = useState<Session>()


    useEffect(() => {

        if (attendanceResult.length == 0) {


            // if (revalidateEffect == 0)
            setRevalidateEffect(Math.random())


        }
        if (initialized && session_id) {
            fetchAttendanceBySession(session_id)
            fetchSessionDetails(session_id)
        } else {
            console.log(session_id);
        }

    }, [revalidateEffect])



    const fetchAttendanceBySession = async (sessionId: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`
                    SELECT
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


    const fetchSessionDetails = async (session_id: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`
                    SELECT 
                        sp.session_id,
                        sp.session_date,
                        g.group_number,
                        g.group_type,
                        c.module_name,
                        c.specialty_name,
                        c.specialty_level,
                        c.level_year
                    FROM 
                        session_presence sp
                    JOIN 
                        Groupp g ON sp.group_id = g.group_id
                    JOIN 
                        class c ON g.class_id = c.class_id
                    WHERE  sp.session_id = ? ;

                ` , [session_id]).then(res => {

                    if (res.values) {
                        setSessionDetails(res?.values[0] as Session)
                    }
                }).catch(err => {
                    console.log(err)
                });

            });
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
                <IonItem >
                    <IonLabel class="ion-text-wrap" >
                    <h2 style={{ display: 'flex', alignItems: 'center' , gap: '4px' } } > {student.comment && student.comment?.length > 0 ? <IonIcon icon={pencil} size='small' color='success'  ></IonIcon> : null}{idx + 1} - {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
                    </IonLabel>

                    <IonRadioGroup

                        style={{ display: 'flex', gap: '20px', marginLeft: '8px', padding: '10px' }}

                        value={student.state}
                    >
                        <IonRadio disabled color={'success'} labelPlacement='stacked' value="P">P</IonRadio>
                        <IonRadio disabled color={'danger'} labelPlacement='stacked' value="AB">Ab</IonRadio>
                        <IonRadio disabled color={'success'} labelPlacement='stacked' value="ABJ">Ab J</IonRadio>
                    </IonRadioGroup>
                </IonItem>
            </IonItemSliding>

        )


    })) : <IonLoading className="custom-loading" isOpen={true} spinner={'bubbles'} message="Loading" duration={2000} />



    const commentInputRef = useRef<HTMLIonTextareaElement | null>(null)



    const [commentModalIsOpened, setCommentModalIsOpened] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<AttendanceResult | undefined>()

    const commentModal = useRef<HTMLIonModalElement | null>(null)







    return (

        <IonModal isOpen={isOpen} onIonModalDidDismiss={() => { close(false) }}  >
            <IonHeader>
                <IonToolbar>
                    <IonButton onClick={() => close(false)} size='default' fill='clear' slot="start"   >
                        <IonIcon icon={arrowBack} ></IonIcon>
                    </IonButton>
                    <IonTitle size="small" >
                        <div style={{
                            display: 'flex', width: '100%', justifyContent: 'space-between',
                            alignItems: 'center'
                        }} >

                            {sessionDetails ?
                                <IonLabel className="ion-text-wrap" >
                                    {sessionDetails?.module_name + " " + sessionDetails?.specialty_name + " " + sessionDetails?.specialty_level + sessionDetails?.level_year} group {sessionDetails?.group_number + " " + sessionDetails?.group_type}
                                    <IonChip>
                                        <IonLabel>
                                            {sessionDetails && formatDateTime(sessionDetails.session_date)}
                                        </IonLabel>
                                    </IonChip>

                                </IonLabel> : <IonSpinner   ></IonSpinner>
                            }
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen >






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
                            }
                        }

                        isOpen={commentModalIsOpened && selectedStudent != undefined}
                        initialBreakpoint={0.5}
                        breakpoints={[0, 0.25, 0.5, 0.75]}>
                        <IonContent className="ion-padding">

                            <IonList inset>
                                <IonItem>
                                    <IonLabel className='ion-padding' >
                                        <IonText>
                                            {selectedStudent.first_name.toLowerCase()} {selectedStudent.last_name.toLowerCase()}
                                        </IonText>
                                    </IonLabel>
                                </IonItem>
                                <IonItem>
                                    <IonLabel className='ion-padding' >
                                        <IonText
                                            className='ion-padding'

                                        >
                                            {selectedStudent.comment}
                                        </IonText>
                                    </IonLabel>
                                </IonItem>
                            </IonList>
                        </IonContent>
                    </IonModal> : null
                }




            </IonContent>
        </IonModal>

    )
}
