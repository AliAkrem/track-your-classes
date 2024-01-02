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



import React, { useRef, useState, Suspense, lazy } from "react";

import "./classes.css";

import { add, calendar, create, ellipsisVertical, trash, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { SQLClass, useGlobalContext } from "../../context/globalContext";
import { nanoid } from "nanoid";




const CreateClassModal = lazy(() => import("../../components/createClassModal"));


const CreateGroupModal = lazy(() => import("../../components/createGroupModal"))

const Group = lazy(() => import('../groups'));


const UpdateClass = lazy(() => import("../../components/updateClassModal"));


const ConfirmDeleteClass = lazy(() => import('../classes/confirmDeleteClass'))



export const Classes: React.FC = () => {

  const {
    year,
    setRevalidate,
    isLoading,
    classesList,

  } = useGlobalContext()



  const [openedCreateClassModel, setopenedCreateClassModel] = useState(false)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)

  const [modalUpdateClassOpened, setModalUpdateClassOpened] = useState(false)




  const classesGroupRef = useRef<HTMLIonAccordionGroupElement | null>(null)

  const [selectedClassIDToAddGroup, setSelectedClassIDToAddGroup] = useState(-1)
  const [selectedClass, setSelectedClass] = useState<SQLClass | undefined>()








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











  const [selectedGroup, setSelectedGroup] = useState<number | undefined>(undefined)
  const [isGroupModalOpened, setIsGroupModalOpened] = useState(false)





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
              <IonText id={"open-selected-group-modal" + group.group_id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedGroup(group.group_id); setIsGroupModalOpened(true) }} color={'primary'} >

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
              {year &&
                <IonChip color={"success"} >

                  <IonIcon icon={calendar}></IonIcon>
                  <IonLabel>{String(year)}</IonLabel>

                </IonChip>
              }
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


          <Suspense>

            {openedCreateClassModel == true ? <CreateClassModal isOpen={openedCreateClassModel} close={setopenedCreateClassModel} /> : null}

          </Suspense>

          <Suspense>

            {selectedClass && modalUpdateClassOpened ? <UpdateClass isOpen={modalUpdateClassOpened} classe={selectedClass} setSelectedClass={setSelectedClass} close={setModalUpdateClassOpened} /> : null}

          </Suspense>



          {selectedClassIDToAddGroup && modalCreateGroupOpened ? <CreateGroupModal selectedClassIDToAddGroup={selectedClassIDToAddGroup} setSelectedClassIDToAddGroup={setSelectedClassIDToAddGroup} isOpen={modalCreateGroupOpened} setToClose={setModalCreateGroupOpened} /> : null}





          <Suspense>
            {selectedGroup != undefined && isGroupModalOpened == true ? <Group isOpen={isGroupModalOpened} close={setIsGroupModalOpened} group_id={selectedGroup} setSelectedGroup={setSelectedGroup} /> : null}
          </Suspense>




          <Suspense>
            {confirmDeleteOpened == true && selectedClass ? <ConfirmDeleteClass selectedClass_id={selectedClass?.class_id} close={setConfirmDeleteOpened} isOpen={confirmDeleteOpened} message="Are You Sure You Want To Delete this class? the information related to this class will deleted also!" /> : null}
          </Suspense>



        </IonContent >
      </IonPage >
    </>
  );
};

