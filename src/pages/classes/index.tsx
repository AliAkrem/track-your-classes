import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonList,
  IonModal,
  IonFabButton,
  IonIcon,
  IonFab,
  IonFabList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonActionSheet,
  IonInput,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonText,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import ModuleSelect from "../../components/module_select";
import SpecialtySelect from "../../components/specialty_select";
import { add, addCircleOutline, arrowRedo, chevronDownSharp, ellipsisVertical, trash, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { nanoid } from "nanoid";
import DragDropFile from "../../components/dropExcelFile";



export type Students = {
  student_code: string
  first_name: string;
  last_name: string;

}

export type GroupSQL = {
  group_id: number
  group_number: number,
  group_type: "TP" | 'TD'
}

export interface SpecialtiesSQL {
  specialty_id: number,
  specialty_name: string,
  specialty_name_abv: string,
  specialty_level: string,
  collage_year: number
}

export type SQLModule = {
  module_id: number;
  module_name: string;
  module_name_abv: string;
};

export type SQLClass = {
  class_id: number
  specialty: SpecialtiesSQL
  module: SQLModule
  groups?: GroupSQL[]

}









export const Classes: React.FC = () => {


  const [editItem, setEditItem] = useState<any>();
  const [inputName, setInputName] = useState("");


  const [modules, setModules] = useState<Array<SQLModule>>();
  const [specialties, setSpecialties] = useState<Array<SpecialtiesSQL>>()
  const [classes_list, setListClasses] = useState<Array<SQLClass>>()


  // console.log(classes_list)


  const [selectedModule, setSelectedModule] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);






  // hook for sqlite db
  const { performSQLAction, initialized } = useSQLiteDB();

  // hook for confirmation dialog
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();




  useEffect(() => {

      // await useLoadData({setModules, setSpecialties})
       loadData()
       SELECT_CLASSES()
       SELECT_STUDENTS_GROUP()
        TEST()
      // await CREATE_GROUP(1, 'TP')



  }, [initialized]);

  /**loadData
   * do a select of the database
   */

  const loadData = async () => {
    try {
      // query db
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`SELECT * FROM module`);
        setModules(respSelect?.values);
        const respSelectSpecialties = await db?.query(`SELECT * FROM specialty`);
        setSpecialties(respSelectSpecialties?.values);
      });
    } catch (error) {
      alert((error as Error).message);
      setModules([])
      setSpecialties([])// await CREATE_GROUP(1, 'TP')
    }
  };


  const create_class_modal = useRef<HTMLIonModalElement | null>(null)
  const create_class_modal_create_group = useRef<HTMLIonModalElement | null>(null)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)

  const [selectedClassIDToAddGroup, setSelectedClassIDToAddGroup] = useState(-1)


  const CREATE_CLASS_GROUP = async (classId: number, groupId: number, year: number) => {
    try {
      // Assuming db is already initialized
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        // Assuming there is a 'class_group' table with columns: class_id, group_id, year
        const respInsert = await db?.query(`INSERT INTO class_group ( group_id, year) VALUES (?, ?, ?)`, [classId, groupId, year]);
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const INSERT_NEW_CLASS = async (specialty_id: number, module_id: number) => {

    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(`INSERT INTO class( module_id, specialty_id ) VALUES (?, ?)`, [specialty_id, module_id]);


        // setModules(respSelect?.values);


        const respSelectClasses = await db?.query(`
        SELECT
          class.class_id,
          specialty.specialty_id,
          specialty.specialty_name,
          specialty.specialty_name_abv,
          specialty.specialty_level,
          specialty.collage_year,
          module.module_id,
          module.module_name,
          module.module_name_abv
        FROM class
        JOIN specialty ON class.specialty_id = specialty.specialty_id
        JOIN module ON class.module_id = module.module_id;
      `);


        // Process the result as needed
        const classes_formatted = respSelectClasses?.values?.map((row: any) => ({
          class_id: row.class_id,
          specialty: {
            specialty_id: row.specialty_id,
            specialty_name: row.specialty_name,
            specialty_name_abv: row.specialty_name_abv,
            specialty_level: row.specialty_level,
            collage_year: row.collage_year,
          },
          module: {
            module_id: row.module_id,
            module_name: row.module_name,
            module_name_abv: row.module_name_abv,
          },
        }));



        setListClasses(classes_formatted)



      });



    } catch (error) {
      alert((error as Error).message);




    }
  };


  const DELETE_CLASS = async (classId: number) => {

    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        await db?.query(`DELETE FROM class WHERE class_id = ? `, [classId]);




        const respSelect = await db?.query(`
        SELECT
          class.class_id,
          specialty.specialty_id,
          specialty.specialty_name,
          specialty.specialty_name_abv,
          specialty.specialty_level,
          specialty.collage_year,
          module.module_id,
          module.module_name,
          module.module_name_abv
        FROM class
        JOIN specialty ON class.specialty_id = specialty.specialty_id
        JOIN module ON class.module_id = module.module_id;
      `);


        // Process the result as needed
        const classes_formatted = respSelect?.values?.map((row: any) => ({
          class_id: row.class_id,
          specialty: {
            specialty_id: row.specialty_id,
            specialty_name: row.specialty_name,
            specialty_name_abv: row.specialty_name_abv,
            specialty_level: row.specialty_level,
            collage_year: row.collage_year,
          },
          module: {
            module_id: row.module_id,
            module_name: row.module_name,
            module_name_abv: row.module_name_abv,
          },
        }));



        setListClasses(classes_formatted)


      });


    } catch (error) {
      alert((error as Error).message);




      INSERT_NEW_CLASS(Number(selectedModule[0]), Number(selectedSpecialties[0]))



    }
  };

  const onSubmit = () => {
    console.log({ selectedModule, selectedSpecialties })
    if (selectedModule.length > 0 && selectedSpecialties.length > 0) {
      INSERT_NEW_CLASS(Number(selectedModule[0]), Number(selectedSpecialties[0]))
    }
  }

  const ActionResult = (result: OverlayEventDetail, classPayload: { class_id: number, module_id: number, specialty_id: number }) => {

    if (result.data?.action === "delete") {

      showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also! ", () => {

        DELETE_CLASS(classPayload?.class_id)


      })

    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)

      setSelectedClassIDToAddGroup(classPayload.class_id)

      // console.log('create new group in this class ', classPayload)


    }





  }

  const SELECT_CLASSES = async () => {
    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`
          SELECT
            class.class_id,
            specialty.specialty_id,
            specialty.specialty_name,
            specialty.specialty_name_abv,
            specialty.specialty_level,
            specialty.collage_year,
            module.module_id,
            module.module_name,
            module.module_name_abv,
            Groupp.group_id,
            Groupp.group_number,
            Groupp.group_type
          FROM class
          JOIN specialty ON class.specialty_id = specialty.specialty_id
          JOIN module ON class.module_id = module.module_id
          LEFT JOIN Groupp ON class.class_id = Groupp.class_id;
        `);

        const classesWithGroups = respSelect?.values?.reduce((result: any, row: any) => {
          const classInfo = result[row.class_id] || {
            class_id: row.class_id,
            specialty: {
              specialty_id: row.specialty_id,
              specialty_name: row.specialty_name,
              specialty_name_abv: row.specialty_name_abv,
              specialty_level: row.specialty_level,
              collage_year: row.collage_year,
            },
            module: {
              module_id: row.module_id,
              module_name: row.module_name,
              module_name_abv: row.module_name_abv,
            },
            groups: [],
          };

          if (row.group_id) {
            const groupInfo = {
              group_id: row.group_id,
              group_number: row.group_number,
              group_type: row.group_type,
            };

            classInfo.groups.push(groupInfo);
          }

          result[row.class_id] = classInfo;
          return result;
        }, {});


        if (classesWithGroups) {
          const classes_formatted: any = Object.values(classesWithGroups);
          console.log(classes_formatted)
          setListClasses(classes_formatted);
        }



      });

    } catch (error) {
      alert((error as Error).message);
    }
  };



  const classesGroupRef = useRef<HTMLIonAccordionGroupElement | null >(null)



  const ListClasses = classes_list?.map((classe) => {
    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start"   value={nanoid()}>
          <IonItem slot="header" color="light">
            <IonLabel> {classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv}</IonLabel>
            <IonButton fill="clear"   id={"open-action-sheet" + classe.module.module_id + "" + classe.specialty.specialty_id} >
              <IonIcon  size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonItem>
          
          {classe.groups?.map(group => {
            return (<IonItem slot="content"   key={nanoid()}   >
              <IonLabel>
                group {group.group_number} /{group.group_type}
              </IonLabel>
              <IonButton fill="clear" href={`/classes/${ group.group_id }`} size="large" >
              <IonIcon  size="small"  icon={arrowRedo}></IonIcon>
            </IonButton>
            </IonItem>)
          })
          }


        </IonAccordion>
        <IonActionSheet
          trigger={"open-action-sheet" + classe.module.module_id + "" + classe.specialty.specialty_id}
          header="Actions"
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






  const type_of_group = useRef<HTMLIonSelectElement | null>(null);
  const group_number = useRef<HTMLIonInputElement>(null);


  const [student_list, setStudent_list] = useState<Students[]>()



  const CREATE_GROUP = async (group_number: number, group_type: string, student_list: Students[]) => {

    try {



      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        // Assuming there is a 'class_group' table with columns: class_id, group_id, year
        await db?.query(`INSERT INTO Groupp( group_type, group_number, scholar_year_id, class_id) VALUES ( ?, ?, ?, ?)`, [group_type, group_number, 1, selectedClassIDToAddGroup]);

        const resGroup_id: any = await db?.query(`SELECT group_id as id FROM Groupp WHERE group_id IN (SELECT max(group_id) FROM Groupp) AND class_id = ?   ;`, [selectedClassIDToAddGroup]);

        const group_id = resGroup_id?.values[0]?.id

        console.log({ group_id })

        await Promise.all(student_list.map(async (student) => {


          await db?.query(`INSERT OR IGNORE INTO student( first_name, last_name, student_code) VALUES (?, ?, ?)`, [student.first_name, student.last_name, student.student_code]);

          const resStudent_id: any = await db?.query(`SELECT student_id as id FROM student WHERE  student_code = ? `, [student.student_code]);


          const student_id = resStudent_id?.values[0]?.id

          console.log({ student_id })

          await db?.query(`INSERT OR IGNORE INTO group_student( group_id, student_id) VALUES (?, ?)`, [group_id, student_id]);



        }))

        location.reload()
        // await db?.query(`INSERT INTO class_group (class_id,  group_id,  scholar_year_id, group_number, group_type) VALUES (?, ?, ?, ? , ? )`, [selectedClassIDToAddGroup, group_id, 1,]);


      });

      


    } catch (error) {
      alert((error as Error).message);
    }


  };




  const onCreateGroup = async () => {

    console.log(type_of_group.current?.value, group_number.current?.value, student_list)

    if (type_of_group.current?.value !== "" && group_number.current?.value !== "" && student_list) {
      // first we should create the group 

      let group_number_formed = Number(group_number.current?.value)
      let type_of_group_formed = String(type_of_group.current?.value)


      await CREATE_GROUP(group_number_formed, type_of_group_formed, student_list)


    }






  }


  const SELECT_STUDENTS_GROUP = async () => {
    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        // Join the student, group, and group_student tables to get the student's group


        const result = await db?.query(`
                SELECT 
                    student.student_id,
                    student.student_code,
                    student.first_name,
                    student.last_name ,
                    group_student.group_id
                    FROM 
                    student 
                    INNER JOIN 
                      group_student ON student.student_id = group_student.student_id
                    INNER JOIN 
                      Groupp ON group_student.group_id = Groupp.group_id
            `);




        // Log the result
        console.log(result?.values);
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };


  const TEST = async () => {
    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`
          SELECT  * FROM class

        `);


        console.log(respSelect?.values)

      });




    } catch (error) {
      alert((error as Error).message);
    }

  };







  return (


    <IonPage>


      <IonHeader>

        <IonToolbar>

          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle size="small" >Manage Classes</IonTitle>
        </IonToolbar>

      </IonHeader>

      <IonContent fullscreen >


     

        <IonFab id="open-create-class" slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        <IonAccordionGroup ref={classesGroupRef} multiple={false} >
          {classes_list ? ListClasses : <IonProgressBar type="indeterminate"  ></IonProgressBar>}
        </IonAccordionGroup>

        <IonModal ref={create_class_modal_create_group} isOpen={modalCreateGroupOpened}     >
          <IonHeader>
            <IonToolbar>
              <IonTitle >create new group</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => { create_class_modal_create_group?.current?.dismiss(); setSelectedClassIDToAddGroup(-1); setModalCreateGroupOpened(false) }}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen  >
            <IonItem className="Ion-padding"   >
              <DragDropFile setStudent_list={setStudent_list} />
            </IonItem    >

            <IonItem className="Ion-padding" >
              <IonSelect

                ref={type_of_group}
                // ref={specialty_level}
                aria-label="type of group"
                interface="popover"
                placeholder="type of group"
              >
                <IonSelectOption value="TD">TD</IonSelectOption>
                <IonSelectOption value="TP">TP</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem className="Ion-padding"   >

              <IonInput
                label="group number"
                labelPlacement="start"
                ref={group_number}
                type="text"
                maxlength={1}
                onIonChange={(e) => {
                  const inputValue = e.detail.value;

                  const numericInput = String(inputValue).replace(/[^0-5]/g, '');

                  if (group_number.current)
                    group_number.current.value = numericInput;
                }}
              />

            </IonItem>

            {student_list ? student_list?.map((student =>

              <IonItem key={student.student_code+student.first_name}>
                <IonText key={nanoid()} >{student.first_name} / {student.last_name} / {student.student_code} </IonText>
              </IonItem>
            )) : null
            }

            <IonItem >
              <IonButton onClick={() => {
                onCreateGroup();
                setModalCreateGroupOpened(false)
                setSelectedClassIDToAddGroup(-1);
                setStudent_list([]) ; 


              }} slot="start" fill="outline" size="default" >
                submit
              </IonButton>
            </IonItem>
          </IonContent>
        </IonModal>

        <IonModal ref={create_class_modal} trigger="open-create-class" >
          <IonHeader>
            <IonToolbar>
              <IonTitle >create new class</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => create_class_modal?.current?.dismiss()}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList >

              {modules ? <ModuleSelect selectedModule={selectedModule} setSelectedModule={setSelectedModule} modules={modules} setModules={setModules} /> : null}
              {specialties ? <SpecialtySelect selectedSpecialties={selectedSpecialties} setSelectedSpecialties={setSelectedSpecialties} specialties={specialties} setSpecialties={setSpecialties} /> : null}

              <IonList inset>
                <IonItem >
                  <IonButton disabled={selectedModule.length == 0 || selectedSpecialties.length == 0} onClick={() => { onSubmit(); create_class_modal?.current?.dismiss() }} slot="end" fill="outline" size="default" >
                    submit
                  </IonButton>
                </IonItem>
              </IonList>

            </IonList>
          </IonContent>
        </IonModal>
        {ConfirmationAlert}

      </IonContent >
    </IonPage >
  );
};

