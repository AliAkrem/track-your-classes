import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonFabButton,
  IonIcon,
  IonFab,
  IonItem,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonActionSheet,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  IonText,
  IonChip,

} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { add, calendar, create, ellipsisVertical, trash, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { SQLClass, useGlobalContext } from "../../context/globalContext";
import { CreateClassModal } from "../../components/createClassModal";
import CreateGroupModal from "../../components/createGroupModal";
import { nanoid } from "nanoid";
import { Group } from "../groups";
import { UpdateClass } from "../../components/updateClassModal";

import ConfirmDeleteClass from '../classes/confirmDeleteClass'

export const Classes: React.FC = () => {

  const {
    year,
    setRevalidate,
    isLoading,
    counter,
    classesList,
    setClassesList

  } = useGlobalContext()



  const [openedCreateClassModel, setopenedCreateClassModel] = useState(false)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)

  const [modalUpdateClassOpened, setModalUpdateClassOpened] = useState(false)




  const classesGroupRef = useRef<HTMLIonAccordionGroupElement | null>(null)

  const [selectedClassIDToAddGroup, setSelectedClassIDToAddGroup] = useState(-1)
  const [selectedClass, setSelectedClass] = useState<SQLClass | undefined>()





  // hook for sqlite db
  const { performSQLAction, initialized } = useSQLiteDB();

  // hook for confirmation dialogperformSQLAction
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();



  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false)

  // const handleConfirmDeleteClass = (classe: SQLClass) => {

  //   console.log('handler called', classe.class_id)

  //   setConfirmDeleteOpened(true)




  // }


  // related to display classes list
  const ActionResult = async (result: OverlayEventDetail, classPayload: { classe: SQLClass }) => {

    if (result.data?.action === "delete") {

      console.log('DELETE bLOCK')


      // if (classPayload?.classe.class_id)
      //   showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also!", () => {

      //     DELETE_CLASS(Number(classPayload?.classe.class_id))


      //   })



    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)
      setSelectedClassIDToAddGroup(classPayload.classe.class_id)

    }

    if (result.data?.action === "edit-class") {

      setModalUpdateClassOpened(!modalUpdateClassOpened)
      setSelectedClass(classPayload.classe)

    }



  }











  const [selectedGroup, setSelectedGroup] = useState<number | undefined>()






  const ListClasses = classesList?.map((classe) => {
    const trigger = nanoid()


    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start" value={nanoid()}  >
          <IonItem slot="header" color="light">
            <IonLabel class="ion-text-wrap" > {classe.module_name + " / " + classe.specialty_name + " / " + classe.specialty_level + classe.level_year}</IonLabel>
            <IonButton fill="clear" id={trigger} >
              <IonIcon size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>
            {/* <IonButton fill="clear" onClick={() => { DELETE_CLASS(classe.class_id) }}  >
              <IonIcon size="small" icon={trash}></IonIcon>
            </IonButton> */}
          </IonItem>

          {classe.groups?.map(group => {
            return (<IonItem slot="content" key={group.group_id}   >
              <IonText style={{ cursor: 'pointer' }} onClick={() => { setSelectedGroup(group.group_id) }} color={'primary'} >

                group {group.group_number} / {group.group_type}

              </IonText>

            </IonItem>)
          })
          }

        </IonAccordion>
        <IonActionSheet
          trigger={trigger}
          // id="trigger"
          // isOpen={true}
          header={classe.module_name + " / " + classe.specialty_name + " / " + classe.specialty_level + classe.level_year}
          buttons={[
            {

              icon: create,
              id: 'update-class-modal' + classe.class_id,
              text: 'edit',
              role: 'edit-class',
              data: {
                action: 'edit-class',
              },
            },
            {
              icon: add,
              text: 'create new group',
              role: 'create',
              data: {
                action: 'create-group',
              },
            },

            {
              id: 'delete-class',
              icon: trash,
              text: 'Delete',
              data: {
                action: 'delete',
                class_id: classe.class_id
              },


              handler: () => { setConfirmDeleteOpened(true); setSelectedClass(classe) }
            },
          ]}
          onIonActionSheetDidDismiss={({ detail }) => ActionResult(detail, { classe: classe })}
        ></IonActionSheet>
      </div>
    )
  })










  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000);
    setRevalidate(Math.random());
  }



  if (isLoading) return null;


  return (

    <>
      <IonPage  >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle size="small" >
              <IonChip color={"success"} >
                <IonIcon icon={calendar}></IonIcon>
                <IonLabel>{String(year)}</IonLabel>
              </IonChip>

            </IonTitle>



          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen >


          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>


          <IonFab slot="fixed" vertical="bottom" horizontal="end">
            <IonFabButton id="create-class-modal" onClick={() => { setopenedCreateClassModel(!openedCreateClassModel) }}  >
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
          </IonFab>



          {
            classesList && classesList?.length > 0 ?
              <IonAccordionGroup ref={classesGroupRef} multiple={false} >
                {ListClasses}
              </IonAccordionGroup> :
              <div style={{ display: 'flex', alignItems: 'center', height: "80vh", justifyContent: 'center' }}  >
                <IonCard >
                  <IonCardContent  >no classes here yet!. Click (+) to add one </IonCardContent>
                </IonCard>
              </div>

          }

          <pre>
            {JSON.stringify(classesList!, null, 2)}
          </pre>


          {openedCreateClassModel == true ? <CreateClassModal isOpen={openedCreateClassModel} close={setopenedCreateClassModel} /> : null}



          {selectedClass && modalUpdateClassOpened ? <UpdateClass isOpen={modalUpdateClassOpened} classe={selectedClass} setSelectedClass={setSelectedClass} close={setModalUpdateClassOpened} /> : null}


          {selectedClassIDToAddGroup && modalCreateGroupOpened ? <CreateGroupModal selectedClassIDToAddGroup={selectedClassIDToAddGroup} setSelectedClassIDToAddGroup={setSelectedClassIDToAddGroup} isOpen={modalCreateGroupOpened} setToClose={setModalCreateGroupOpened} /> : null}



          {selectedGroup ? <Group group_id={selectedGroup} setSelectedGroup={setSelectedGroup} /> : null}


          {confirmDeleteOpened == true && selectedClass ? <ConfirmDeleteClass selectedClass_id={selectedClass?.class_id} close={setConfirmDeleteOpened} isOpen={confirmDeleteOpened} message="Are You Sure You Want To Delete this class? the information related to this class will deleted also!" /> : null}




        </IonContent >
      </IonPage >
    </>
  );
};

