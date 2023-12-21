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
} from "@ionic/react";
import React, { useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { add, arrowRedo, ellipsisVertical, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { nanoid } from "nanoid";
import { Students, useGlobalContext } from "../../context/globalContext";
import { CreateClassModal } from "../../components/createClassModal";
import CreateGroupModal from "../../components/createGroupModal";








export const Classes: React.FC = () => {

  const { classes_list, setListClasses,
    selectedModule,
    selectedSpecialties,
    year, setYear,
    years,
    setRevalidate, 
    isLoading
  } = useGlobalContext()



  const [openedCreateClassModel, setopenedCreateClassModel] = useState(false)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)


  const classesGroupRef = useRef<HTMLIonAccordionGroupElement | null>(null)

  const [selectedClassIDToAddGroup, setSelectedClassIDToAddGroup] = useState(-1)





  // hook for sqlite db
  const { performSQLAction } = useSQLiteDB();

  // hook for confirmation dialog
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();



  // related to create class modal 
  const INSERT_NEW_CLASS = async (specialty_id: number, module_id: number) => {

    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        const respSELECTED_YEAR = await db?.query(`
        SELECT selected_year_id FROM keys LIMIT 1  
        `)

        console.log(respSELECTED_YEAR?.values)
        if (respSELECTED_YEAR?.values)
          setYear(Number(respSELECTED_YEAR?.values[0].selected_year_id))



        await db?.query(`INSERT INTO class( module_id, specialty_id, scholar_year_id ) VALUES (?, ?, ?)`, [specialty_id, module_id, respSELECTED_YEAR?.values ? Number(respSELECTED_YEAR?.values[0].selected_year_id) : year]);



      });

      setRevalidate(module_id + specialty_id)


    } catch (error) {
      alert((error as Error).message);




    }
  };

  // related to display classes 
  const DELETE_CLASS = async (classId: number) => {

    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        await db?.query(`DELETE FROM class WHERE class_id = ? `, [classId]);

        setRevalidate(classId)

      });
    } catch (error) {
      alert((error as Error).message);




      INSERT_NEW_CLASS(Number(selectedModule[0]), Number(selectedSpecialties[0]))



    }
  };






  // related to display classes list
  const ActionResult = (result: OverlayEventDetail, classPayload: { class_id: number, module_id: number, specialty_id: number }) => {

    if (result.data?.action === "delete") {

      showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also! ", () => {
        DELETE_CLASS(classPayload?.class_id)

      })

    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)
      setSelectedClassIDToAddGroup(classPayload.class_id)

    }



  }


  const ListClasses = classes_list?.map((classe) => {

    const trigger = nanoid()



    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start" value={nanoid()} >
          <IonItem slot="header" color="light">
            <IonLabel> {classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv + " / " + classe.specialty.specialty_level + classe.specialty.collage_year}</IonLabel>
            <IonButton fill="clear" id={trigger} >
              <IonIcon size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonItem>

          {classe.groups?.map(group => {
            return (<IonItem slot="content" key={nanoid()}   >
              <IonLabel>
                group {group.group_number} /{group.group_type}
              </IonLabel>
              <IonButton fill="clear" href={`/classes/${group.group_id}`} size="large" >
                <IonIcon size="small" icon={arrowRedo}></IonIcon>
              </IonButton>
            </IonItem>)
          })
          }


        </IonAccordion>
        <IonActionSheet
          trigger={trigger}
          header={classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv + " / " + classe.specialty.specialty_level + classe.specialty.collage_year}
          buttons={[
            {
              text: 'Delete',
              role: 'delete',
              data: {
                action: 'delete',
              },
            },
            {

              text: 'create new group',
              role: 'create',
              data: {
                action: 'create-group',
              },
            },
          ]}
          onDidDismiss={({ detail }) => ActionResult(detail, { class_id: classe.class_id, module_id: classe.module.module_id, specialty_id: classe.specialty.specialty_id })}
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



  if (isLoading) return null ; 

  
  return (


    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle size="small" >Manage Classes {String(year)}</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen >


        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>


        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => { setopenedCreateClassModel(true) }}  >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>





        {
          classes_list?.length > 0 ?
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
          {JSON.stringify(years, null, 2)}
        </pre>




        <CreateGroupModal selectedClassIDToAddGroup={selectedClassIDToAddGroup} setSelectedClassIDToAddGroup={setSelectedClassIDToAddGroup} isOpen={modalCreateGroupOpened} setToClose={setModalCreateGroupOpened} />

        <CreateClassModal isOpen={openedCreateClassModel} close={setopenedCreateClassModel} />


        {ConfirmationAlert}

      </IonContent >
    </IonPage >
  );
};

