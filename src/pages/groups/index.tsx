import {
    IonHeader,
    IonPage,
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

} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { Redirect, useParams } from "react-router";
import { GroupSQL, Students } from "../classes";
import { nanoid } from "nanoid";
import { chevronBack, ellipsisVertical } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/core";

import { RefresherEventDetail } from "@ionic/react";
import { redirect } from "next/dist/server/api-utils";





export const Group: React.FC = () => {



    const { performSQLAction, initialized } = useSQLiteDB();


    const { group } = useParams<{ group: string; }>();

    const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();


    const [groupOptionOpened, setGroupOptionOpened] = useState(false)

    const [list_student, setList_student] = useState<Students[]>()
    const [groupInfo, setGroupInfo] = useState<GroupSQL>()
    // const params = useParams<{id : string } >();

    useEffect(() => {

        SELECT_STUDENTS_IN_GROUP(Number(group));

    }, [initialized]);




    const SELECT_STUDENTS_IN_GROUP = async (group_id: number) => {
        try {
        await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                const respSelect = await db?.query(`
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
            `);

                const studentsInGroup = respSelect?.values?.map((row: any) => ({
                    student_id: row.student_id,
                    student_code: row.student_code,
                    first_name: row.first_name,
                    last_name: row.last_name,
                }));

                // setGroupInfo({group_id : respSelect?.values.})

                // Use the studentsInGroup array as needed
                if (respSelect?.values) {
                    console.log(respSelect?.values[0]?.group_type);
                    console.log(respSelect?.values[0]?.group_number);
                    console.log(respSelect?.values[0]?.group_id);
                    setGroupInfo(
                        {
                            group_id: respSelect?.values[0]?.group_id,
                            group_number: respSelect?.values[0]?.group_number,
                            group_type: respSelect?.values[0]?.group_type
                        }
                    )
                }

                setList_student(studentsInGroup)

            });
        } catch (error) {
            alert((error as Error).message);
        }
    };


    const ActionResult = (result: OverlayEventDetail) => {

        if (result.data?.action === "delete") {

            showConfirmationAlert("Are You Sure You Want To Delete this group? the information related to this class will deleted also! ", () => {

                if (groupInfo?.group_id) {
                    DELETE_GROUP(groupInfo?.group_id)
                }

            })

        };


        if (result.data?.action === "create-student") {




        }





    }


    const DELETE_GROUP = async (group_id: number) => {
        try {
           await  performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`DELETE FROM Groupp WHERE group_id = ? `, [group_id])
            })
            // navigate('/classes')
            location.replace('/classes')

        } catch (error) {
            alert((error as Error).message);
        }
    };




    const DisplayListStudent = list_student?.map((student) => {

        return (<IonItem key={nanoid()}  >
            <IonLabel style={{ padding: "10px" }} class="ion-text-wrap" >
                {student.first_name} {" "} {student.last_name}
            </IonLabel>
        </IonItem>)

    })


    const handleRefresh=async (event: CustomEvent<RefresherEventDetail>) =>{
        setTimeout(() => {
          // Any calls to load data go here
          event.detail.complete();
        }, 2000);
        
         location.reload();

      }


      const listGroup  = useRef(null)


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButton fill="clear" slot="start" href="/classes" >
                        <IonIcon size="small" icon={chevronBack}></IonIcon>
                    </IonButton>

                    <IonTitle class="ion-text-wrap" >
                        Group {groupInfo?.group_number} {groupInfo?.group_type}
                    </IonTitle>

                    <IonButton id="open-action-group-option" fill="clear" slot="end"  onClick={() => { setGroupOptionOpened(true) }} >
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
                    {DisplayListStudent}
                </IonItemGroup>
                <IonActionSheet
                    // trigger={"open-action-group-option"}
                    isOpen={groupOptionOpened}
                    ref={listGroup}
                    onIonActionSheetWillDismiss={() => setGroupOptionOpened(false)}
                    header="Actions"
                    buttons={[
                        {   
                           

                            text: 'Delete Group ',
                            role: 'delete',
                            data: {
                                action: 'delete',
                            },
                        },
                        {
                            text: 'create new student',
                            role: 'create',
                            data: {
                                action: 'create-group',
                            },
                        },
                    ]}
                    onDidDismiss={({ detail }) => ActionResult(detail)}
                ></IonActionSheet>
                {ConfirmationAlert}
            </IonContent>

        </IonPage>
    );
};


