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
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { nanoid } from "nanoid";
import { add, chevronBack, ellipsisVertical, people, person, share, trash } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core";

import { RefresherEventDetail } from "@ionic/react";

import { GroupSQL, Students, useGlobalContext } from "../../context/globalContext";
import { CreateStudentModal } from "../../components/createStudentModal";


import ClassesListModal from "../../components/classesListModal";
import { ClassGroup } from "../sessions";



type Props = {
    group_id: number | undefined,
    setSelectedGroup: React.Dispatch<React.SetStateAction<number | undefined>>
    close: React.Dispatch<React.SetStateAction<boolean>>
    isOpen: boolean
}


export default function Group({ group_id, setSelectedGroup, isOpen, close }: Props) {



    const { performSQLAction, initialized } = useSQLiteDB();


    const { setRevalidate } = useGlobalContext()



    const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();


    const [groupOptionOpened, setGroupOptionOpened] = useState(false)

    const [addStudentModalOpened, setOpenAddStudentModal] = useState(false)

    const [list_student, setList_student] = useState<Students[] | []>([])

    const [groupInfo, setGroupInfo] = useState<GroupSQL>()
    // const params = useParams<{id : string } >();

    const [revalidateGroup, setRevalidateGroup] = useState(0)


    useEffect(() => {


        if (list_student?.length == 0) {
            // if (revalidateGroup == 0) {
            setRevalidateGroup(Math.random())
            // }
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

            await db?.query(`
                DELETE FROM group_student WHERE student_id = ?  AND group_id = ? 
                  `
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











    const DisplayListStudent = list_student?.map((student) => {

        return (
            <IonItemSliding key={nanoid()}  >
                <IonItem  >
                    <IonAvatar slot="start">
                        <IonIcon size="large" icon={person} ></IonIcon>
                    </IonAvatar>
                    <IonLabel class="ion-text-wrap" >
                        <h2 > {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
                    </IonLabel>
                </IonItem>

                <IonItemOptions side="start" >
                    <IonItemOption onClick={() => { setSelectedStudentIdToTransfer(student.student_id); setOpenedClassGroupToTransfer(true) }} >
                        <IonIcon slot="icon-only" icon={share} >  </IonIcon>
                    </IonItemOption>
                    <IonItemOption onClick={() => { handleDeleteStudent(student.student_id) }} color="danger">
                        <IonIcon slot="icon-only" icon={trash} >  </IonIcon>
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
                setRevalidate(Math.random());
                setRevalidateGroup(Math.random())
            });

        } catch (error) {
            alert((error as Error).message);

        }
    };





    return (
        <IonModal trigger={"open-selected-group-modal" + group_id} isOpen={isOpen} canDismiss={group_id ? false : true} >
            <IonHeader>
                <IonToolbar>
                    <IonButton fill="clear" slot="start" onClick={() => { close(false); setSelectedGroup(undefined) }}   >
                        <IonIcon size="small" icon={chevronBack}></IonIcon>
                    </IonButton>

                    <IonTitle class="ion-text-wrap" >

                        <IonChip color={"success"} >
                            <IonIcon icon={people}></IonIcon>

                            <IonLabel>Group {groupInfo?.group_number} {groupInfo?.group_type}</IonLabel>

                            {!groupInfo ?   <IonSpinner color={"success"} /> : null}
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

                    {list_student && list_student?.length > 0 ? DisplayListStudent : <IonLoading isOpen={!list_student} duration={200}  />}


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
                    ]}
                    onDidDismiss={({ detail }) => ActionResult(detail)}
                ></IonActionSheet>


                {list_student && addStudentModalOpened && list_student.length > 0 ? <CreateStudentModal setRevalidateGroup={setRevalidateGroup} student_code={Number(list_student?.toReversed()[0].student_code) + 1} group_id={group_id} isOpen={addStudentModalOpened} close={setOpenAddStudentModal} /> : null
            
            }



                {openedClassGroupToTransfer ? <ClassesListModal setSelectedClassGroup={setSelectedClassGroupToTransfer} isOpen={openedClassGroupToTransfer} close={setOpenedClassGroupToTransfer} /> : null}

                {ConfirmationAlert}


                <IonAlert
                    isOpen={!openedClassGroupToTransfer && selectedClassGroupToTransfer != null}
                    message={'are you sure you want to transfer this student from this group?' }
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




            </IonContent>

        </IonModal>
    );
};


