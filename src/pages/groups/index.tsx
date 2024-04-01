import {
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonItem,
    IonLabel,
    IonItemGroup,
    IonIcon,
    IonButton,
    IonActionSheet,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonAvatar,
    IonChip,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonAlert,
    IonLoading,
    IonSpinner,
    IonToast,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { nanoid } from "nanoid";
import { add,  chevronBack, chevronForward, ellipsisVertical, people, person, share, trash } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core";

import { RefresherEventDetail } from "@ionic/react";

import { GroupSQL, Students, useGlobalContext } from "../../context/globalContext";
import { CreateStudentModal } from "../../components/createStudentModal";


import ClassesListModal from "../../components/classesListModal";
import { ClassGroup, SessionData } from "../sessions";
import ExportSessionGroupModal from "../../components/exportGroupSession";
import { exportJsonToXlsx } from "../../composables/exportSessionDataXSLX";
import { Capacitor } from "@capacitor/core";





type rangeDate = {
    start: string,
    end: string
}


type Props = {
    group_id: number | undefined,
    setSelectedGroup: React.Dispatch<React.SetStateAction<number | undefined>>
    close: React.Dispatch<React.SetStateAction<boolean>>
    isOpen: boolean
}


export default function Group({ group_id, setSelectedGroup, isOpen, close }: Props) {



    const { performSQLAction, initialized } = useSQLiteDB();


    const { setRevalidate, year } = useGlobalContext()



    const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();


    const [groupOptionOpened, setGroupOptionOpened] = useState(false)

    const [addStudentModalOpened, setOpenAddStudentModal] = useState(false)

    const [list_student, setList_student] = useState<Students[] | []>([])

    const [groupInfo, setGroupInfo] = useState<GroupSQL>()


    const [revalidateGroup, setRevalidateGroup] = useState(0)


    useEffect(() => {


        if (list_student?.length == 0) {
            setRevalidateGroup(Math.random())
        }
        if (group_id != undefined)
            SELECT_STUDENTS_IN_GROUP(group_id);



    }, [revalidateGroup, isOpen]);







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

                        setGroupInfo(
                            {
                                group_id: res?.values[0]?.group_id,
                                group_number: res?.values[0]?.group_number,
                                group_type: res?.values[0]?.group_type
                            }
                        )
                        setList_student(studentsInGroup)
                    }
                })




            });
        } catch (error) {

            alert((error as Error).message + ' error fetch student');
        }
    };

    const ActionResult = (result: OverlayEventDetail) => {

        if (result.data?.action === "delete") {

            showConfirmationAlert("Are You Sure You Want To Delete this group? the information related to this class will deleted also! ", () => {

                if (groupInfo?.group_id) {
                    DELETE_GROUP(groupInfo?.group_id)
                }

                close(false)

            })

        };


        if (result.data?.action === "create-student") {

            setOpenAddStudentModal(true)


        }


        if (result.data.action === "export_attendance") {
            setExportRangeSessionOpened(true)
        }






    }

    const DELETE_GROUP = async (group_id: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`DELETE FROM Groupp WHERE group_id = ? `, [group_id])
            }).then(() => {
                setRevalidate(Math.random());
            })

        } catch (error) {
            alert((error as Error).message);
        }
    };


    const DELETE_STUDENT = async (student_id: number) => {


        await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

            await db?.query(`DELETE FROM group_student WHERE student_id = ?  AND group_id = ? `
                , [student_id, group_id]).then(() => {
                    setRevalidateGroup(Math.random())
                })




        })

    }



    const handleDeleteStudent = (student_id: number) => {


        showConfirmationAlert("Are you sure you want to delete this student from this group? the information related to this student will deleted also!", () => {

            DELETE_STUDENT(student_id)

        })



    }











    const DisplayListStudent = list_student?.map((student, idx) => {

        return (

            <IonItemSliding key={nanoid()}  >

                <IonItem >
                    <IonAvatar slot="start">
                        <IonIcon size="large" icon={person} ></IonIcon>  
                    </IonAvatar>
                    <IonLabel class="ion-text-wrap" >
                        <h2 >{idx +1} - {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
                    </IonLabel>
                    <IonLabel slot="end" ><IonIcon icon={chevronForward} ></IonIcon></IonLabel>
                </IonItem>

                <IonItemOptions side="start" >

                    <IonItemOption onClick={() => {

                        setSelectedStudentIdToTransfer(student.student_id);

                        setOpenedClassGroupToTransfer(true);

                    }} >
                        <IonIcon slot="icon-only" icon={share} >  </IonIcon>
                    </IonItemOption>

                    {/* transfer  */}

                    <IonItemOption onClick={() => { handleDeleteStudent(student.student_id) }} color="danger">
                        <IonIcon slot="icon-only" icon={trash} >  </IonIcon>

                        {/* delete  */}

                    </IonItemOption>



                </IonItemOptions>
            </IonItemSliding>
        )

    })



    const [selectedClassGroupToTransfer, setSelectedClassGroupToTransfer] = useState<ClassGroup | null>(null)






    const [selectedStudentIdToTransfer, setSelectedStudentIdToTransfer] = useState<number | undefined>()




    const [openedClassGroupToTransfer, setOpenedClassGroupToTransfer] = useState(false)


    // console.log(new_student_code)

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        setTimeout(() => {
            // Any calls to load data go here
            event.detail.complete();

        }, 2000);
        setRevalidate(Math.random());
        setRevalidateGroup(Math.random())


    }


    const listGroup = useRef(null)


    const handleTransferStudent = () => {

        setOpenedClassGroupToTransfer(false)



        if (selectedClassGroupToTransfer?.group.group_id && selectedStudentIdToTransfer) {

            transferStudent(selectedClassGroupToTransfer?.group.group_id, selectedStudentIdToTransfer)


        }


    }


    const transferStudent = async (group__id: number, student_id: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(`
                UPDATE group_student SET  group_id = ?  WHERE  student_id = ? `,
                    [group__id, student_id]);






            }, async () => {

                setRevalidate(Math.random()); // refresh UI page 
                setRevalidateGroup(Math.random())

            });

        } catch (error) {
            alert((error as Error).message);

        }
    };



    const [exportRangeSessionOpened, setExportRangeSessionOpened] = useState(false)

    const [range, setRange] = useState<rangeDate>({
        start: new Date().toISOString().slice(0, 19)
        , end: new Date().toISOString().slice(0, 19)
    })
    const [sessionsData, setSessionsData] = useState<SessionData[] | []>([])




    const fetchSessionsByRange = async (startDate: string, endDate: string) => {

        if (startDate > endDate) {
            let temp = startDate;
            startDate = endDate;
            endDate = temp;
        }

        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {


                await db?.query(`
                        SELECT 
                        sp.session_id,
                        sp.session_date,
                            c.module_name,  
                            g.group_number,
                            g.group_type,
                            g.group_id,
                            c.specialty_name,
                            c.specialty_level,
                            c.level_year
                        FROM 
                            session_presence sp
                        JOIN 
                            Groupp g ON sp.group_id = g.group_id
                        JOIN 
                            class  c ON g.class_id = c.class_id 
                        WHERE   
                            sp.group_id = ? 
                            AND 
                            sp.session_date BETWEEN ? AND ? ;

                            

                    `,
                    [group_id, startDate, endDate]
                ).then((res) => {


                    if (res) {
                        setSessionsData(res.values as SessionData[])
                        console.log(res.values)

                    } else {
                        setSessionsData([])
                    }


                }).catch((err) => {

                    console.log(err)

                })


                // Process the result (assuming 'result' is an array of rows)
            });
        } catch (error) {
            alert((error as Error).message);
        }
    };




    // fetchSessionsByRange(range.start, range.end)


    useEffect(() => {

        fetchSessionsByRange(range.start, range.end)

    }, [range.start, range.end, exportRangeSessionOpened])



    const [toast, setToast] = useState(false)

    const export_session = async (session: SessionData) => {


        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(`
                    SELECT
                        s.student_code as N  ,
                        s.first_name,
                        s.last_name,
                        a.state
                    FROM
                        attendance a
                    JOIN
                        student s ON a.student_id = s.student_id
                    WHERE
                        a.session_id = ?;
        ` , [session.session_id]).then(async (res) => {

                    if (res.values) {

                        if (res.values?.length > 0) {


                            await exportJsonToXlsx(res.values, [{
                                scholar_year: year,
                                class_name: session.module_name,
                                specialty: session.specialty_name,
                                specialty_level: session.specialty_level,
                                specialty_level_year: session.level_year,
                                group_type: session.group_type,
                                group_number: session.group_number,
                            }]).catch(() => {


                            }


                            ).then(() => {

                                setToast(true)

                            })

                        } else {
                            console.log('res values is empty')
                        }

                    }



                }).catch(err => {
                    alert(err);
                    console.log('export to xlsx error')

                });




            }).catch(
                () => {
                    console.log('error preform SQL action')
                }
            )

                ;
        } catch (error) {
            console.log('export to xlsx error 2 ');
            alert((error as Error).message);
        }
    };

    const export_session_in_range = async () => {
        try {

            const selectColumns = sessionsData.map((date, index) => {

                console.log(date.session_date.replaceAll("-", "_").replaceAll(':', "_").slice(0, 16))

                return `MAX(CASE WHEN sp.session_date = '${date.session_date}' THEN a.state ELSE NULL END) AS date_${date.session_date.replaceAll("-", "_").replaceAll(':', "_").slice(0, 16)}`;
            }).join(', ');


            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(`
                SELECT
                    s.student_code AS N,
                    s.first_name,
                    s.last_name,
                    ${selectColumns}
                FROM
                    student s
                JOIN
                    group_student gs ON s.student_id = gs.student_id
                JOIN
                    Groupp g ON gs.group_id = g.group_id
                JOIN
                    session_presence sp ON g.group_id = sp.group_id
                LEFT JOIN
                    attendance a ON sp.session_id = a.session_id AND s.student_id = a.student_id
                WHERE
                    sp.session_date BETWEEN ? AND ?  
                AND
                    sp.group_id = ? 
                GROUP BY
                    s.student_id, s.student_code, s.first_name, s.last_name
                ORDER BY
                    s.first_name;
        
        ` , [range.start, range.end, group_id]).then(async (res) => {

                    if (res.values) {

                        console.log(res.values)

                        if (res.values?.length > 0) {




                            await exportJsonToXlsx(res.values, [{
                                scholar_year: year,
                                class_name: sessionsData[0].module_name,
                                specialty: sessionsData[0].specialty_name,
                                specialty_level: sessionsData[0].specialty_level,
                                specialty_level_year: sessionsData[0].level_year,
                                group_type: sessionsData[0].group_type,
                                group_number: sessionsData[0].group_number,
                            }]).catch(() => {


                            }


                            ).then(() => {

                                setToast(true)

                            })

                        } else {
                            console.log('res values is empty')
                        }

                    }



                }).catch(err => {
                    alert(err);
                    console.log('export to xlsx error')

                });




            }).catch(
                () => {
                    console.log('error preform SQL action')
                }
            )

                ;
        } catch (error) {
            console.log('export to xlsx error 2 ');
            alert((error as Error).message);
        }


    }




    return (
        <IonModal trigger={"open-selected-group-modal" + group_id} isOpen={isOpen} canDismiss={group_id ? false : true}

            onIonModalDidDismiss={() => { close(false); setSelectedGroup(undefined) }}

        >
            <IonHeader>
                <IonToolbar>
                    <IonButton fill="clear" slot="start" onClick={() => { close(false); setSelectedGroup(undefined) }}   >
                        <IonIcon size="small" icon={chevronBack}></IonIcon>
                    </IonButton>

                    <IonTitle class="ion-text-wrap" >

                        <IonChip color={"success"} >
                            <IonIcon icon={people}></IonIcon>

                            <IonLabel>Group {groupInfo?.group_number} {groupInfo?.group_type}</IonLabel>

                            {!groupInfo ? <IonSpinner color={"success"} /> : null}
                        </IonChip>



                    </IonTitle>

                    <IonButton id="open-action-group-option" fill="clear" slot="end" onClick={() => { setGroupOptionOpened(true) }} >
                        <IonIcon size="small" icon={ellipsisVertical}></IonIcon>
                    </IonButton>

                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen >
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                <IonItem  >
                    <IonLabel >
                        <h1>students</h1>
                    </IonLabel>
                </IonItem>
                <IonItemGroup style={{ padding: '10px' }} >

                    {list_student && list_student?.length > 0 ? DisplayListStudent : <IonLoading isOpen={!list_student} duration={200} />}


                </IonItemGroup>

                <IonActionSheet
                    // trigger={"open-action-group-option"}
                    isOpen={groupOptionOpened}
                    ref={listGroup}
                    onIonActionSheetWillDismiss={() => setGroupOptionOpened(false)}
                    header="Actions"
                    buttons={[
                        {
                            icon: trash,
                            text: 'Delete Group',
                            role: 'delete',
                            data: {
                                action: 'delete',
                            },
                        },
                        {
                            icon: add,
                            text: 'create new student',
                            role: 'create-student',
                            data: {
                                action: 'create-student',
                            },
                        },
                        {
                            icon: share,
                            text: 'export attendance to xlsx',
                            role: 'export_attendance',
                            data: {
                                action: 'export_attendance',
                            },
                        },

                    ]}
                    onDidDismiss={({ detail }) => ActionResult(detail)}
                ></IonActionSheet>


                {list_student && addStudentModalOpened && list_student.length > 0 ? <CreateStudentModal setRevalidateGroup={setRevalidateGroup} student_code={Number(list_student?.toReversed()[0].student_code) + 1} group_id={group_id} isOpen={addStudentModalOpened} close={setOpenAddStudentModal} /> : null

                }



                {openedClassGroupToTransfer ? <ClassesListModal setSelectedClassGroup={setSelectedClassGroupToTransfer} isOpen={openedClassGroupToTransfer} close={setOpenedClassGroupToTransfer} /> : null}

                {ConfirmationAlert}


                <IonAlert
                    isOpen={!openedClassGroupToTransfer && selectedClassGroupToTransfer != null}
                    message={'are you sure you want to transfer this student from this group?'}
                    buttons={[
                        {
                            text: "Cancel",
                            role: "cancel",
                            handler: () => {
                                setSelectedClassGroupToTransfer(null);
                                setOpenedClassGroupToTransfer(false);
                                setSelectedStudentIdToTransfer(undefined)
                            }
                        },
                        {
                            text: "Confirm",
                            handler: () => {
                                handleTransferStudent()
                            }
                        },
                    ]}
                />

                <ExportSessionGroupModal
                    export_session={export_session}
                    export_session_in_range={export_session_in_range}
                    group_id={group_id!}
                    sessionsData={sessionsData}
                    close={setExportRangeSessionOpened}
                    isOpen={exportRangeSessionOpened}
                    range={range} setRange={setRange}
                />


                <IonToast isOpen={toast} onDidDismiss={() => { setToast(false) }} message={Capacitor.getPlatform() === 'web' ? "Downloading..." : "file saved on Downloads"} duration={5000}></IonToast>

            </IonContent>

        </IonModal>
    );
};


