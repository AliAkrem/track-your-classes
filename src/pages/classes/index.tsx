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
import { add, addCircleOutline, chevronDownSharp, ellipsisVertical, trash, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { nanoid } from "nanoid";
import DragDropFile from "../../components/dropExcelFile";


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

}


export type Students = {
  student_code: string
  first_name: string;
  last_name: string;

}



const classes: SQLClass[] = [{

  class_id: 1,
  module: {
    module_id: 1,
    module_name: "change",
    module_name_abv: "new change"
  },
  specialty: {
    specialty_name: 'network and distributed systems',
    specialty_name_abv: "RSD",
    specialty_level: "M",
    collage_year: 1,
    specialty_id: 1
  }

},
{
  class_id: 2,
  module: {
    module_id: 2,
    module_name: "distributed systems",
    module_name_abv: "DS"
  },
  specialty: {
    specialty_name: 'network and distributed systems',
    specialty_name_abv: "RSD",
    specialty_level: "M",
    collage_year: 1,
    specialty_id: 1
  }
}



]






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
    loadData()
    SELECT_CLASSES()
    SELECT_STUDENTS_GROUP()
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
        // loadData
        setSpecialties(respSelectSpecialties?.values);






      });
    } catch (error) {
      alert((error as Error).message);
      setModules([])
      setSpecialties([])
    }
  };


  

  /**
   * do a select of the database
   */







  // const updateItem = async () => {
  //   try {
  //     // add test record to db
  //     performSQLAction(
  //       async (db: SQLiteDBConnection | undefined) => {
  //         await db?.query(`UPDATE test2 SET name=? WHERE id=?`, [
  //           inputName,
  //           editItem?.id,
  //         ]);

  //         // update ui
  //         const respSelect = await db?.query(`SELECT * FROM test2;`);
  //         setModules(respSelect?.values);
  //       },
  //       async () => {
  //         setInputName("");
  //         setEditItem(undefined);
  //       }
  //     );
  //   } catch (error) {
  //     alert((error as Error).message);
  //   }
  // };
  // const addItem = async () => {
  //   try {
  //     // add test record to db
  //     performSQLAction(
  //       async (db: SQLiteDBConnection | undefined) => {
  //         await db?.query(`INSERT INTO test2 (id,name) values (?,?);`, [
  //           Date.now(),
  //           inputName,
  //         ]);

  //         // update ui
  //         const respSelect = await db?.query(`SELECT * FROM test2;`);
  //         setModules(respSelect?.values);
  //       },
  //       async () => {
  //         setInputName("");
  //       }
  //     );
  //   } catch (error) {
  //     alert((error as Error).message);
  //   }
  // };
  // const confirmDelete = (itemId: number) => {
  //   showConfirmationAlert("Are You Sure You Want To Delete This Item?", () => {
  //     deleteItem(itemId);
  //   });
  // };
  // const deleteItem = async (itemId: number) => {
  //   try {
  //     // add test record to db
  //     performSQLAction(
  //       async (db: SQLiteDBConnection | undefined) => {
  //         await db?.query(`DELETE FROM test2 WHERE id=?;`, [itemId]);

  //         // update ui
  //         const respSelect = await db?.query(`SELECT * FROM test2;`);
  //         setModules(respSelect?.values);
  //       },
  //       async () => {
  //         setInputName("");
  //       }
  //     );
  //   } catch (error) {
  //     alert((error as Error).message);
  //   }
  // };
  // const doEditItem = (item: SQLModule | undefined) => {
  //   if (item) {
  //     setEditItem(item);
  //     setInputName(item.module_name);
  //   } else {
  //     setEditItem(undefined);
  //     setInputName("");
  //   }
  // };






  const create_class_modal = useRef<HTMLIonModalElement | null>(null)
  const create_class_modal_create_group = useRef<HTMLIonModalElement | null>(null)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)


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




    }
  };


  // useRef





  const onSubmit = () => {
    console.log({ selectedModule, selectedSpecialties })
    if (selectedModule.length > 0 && selectedSpecialties.length > 0) {
      INSERT_NEW_CLASS(Number(selectedModule[0]), Number(selectedSpecialties[0]))
    }
  }











  const ActionResult = (result: OverlayEventDetail, classPayload: { class_id: number, module_id: number, specialty_id: number }) => {



    console.log(classPayload.class_id)


    if (result.data?.action === "delete") {

      showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also! ", () => {

        DELETE_CLASS(classPayload?.class_id)


      })

    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)
      console.log('create new group in this class ', classPayload)
    }





  }


  const SELECT_CLASSES = async () => {
    try {
      // query db
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


        // Use the 'classes' array as needed.
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };


  // console.log(classes_list)





  const ListClasses = classes_list?.map((classe) => {
    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start" value={classe.module.module_id + "" + classe.specialty.specialty_id}>
          <IonItem slot="header" color="light">
            <IonLabel> {classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv} </IonLabel>
            <IonButton fill="clear" id={"open-action-sheet" + classe.module.module_id + "" + classe.specialty.specialty_id} >
              <IonIcon onClick={() => { console.log('clicked') }} size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>

          </IonItem>

          <IonItem slot="content">
            group 1
          </IonItem>

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




  const CREATE_STUDENT = async (first_name: string , last_name: string , code : string) => {
    let student_id = -1 

    try {

      
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        await db?.query(`INSERT INTO student( first_name, last_name, student_code) VALUES (?, ?, ?)`, [first_name, last_name, code]);

        const class_id = await db?.query(`SELECT last_insert_rowid()`);
        console.log(` ${JSON.stringify(class_id?.values)}`)

        const res: any = await db?.query(`SELECT last_insert_rowid() AS id `);
        
        student_id = res?.values[0]?.id 


      });
    } catch (error) {
      alert((error as Error).message);
    }

    return student_id
  };


  const CREATE_GROUP = async (group_number : number , group_type: string ) => {
    let group_id = -1 

    try {
      // Assuming db is already initialized

      
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        // Assuming there is a 'class_group' table with columns: class_id, group_id, year
        await db?.query(`INSERT INTO group( group_number, group_type) VALUES (?, ?)`, [group_number, group_type]);

        const res: any = await db?.query(`SELECT last_insert_rowid() AS id `);
        
        group_id = res?.values[0]?.id 


      });

      

    } catch (error) {
      alert((error as Error).message);
    }

    return group_id

  };


  const CREATE_STUDENT_GROUP = async (student_id : number , group_id: number ) => {
    try {
      // Assuming db is already initialized
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        // Assuming there is a 'class_group' table with columns: class_id, group_id, year
        await db?.query(`INSERT INTO group_student( group_id, student_id) VALUES (?, ?)`, [group_id, student_id]);

      });
    } catch (error) {
      alert((error as Error).message);
    }
  };





  const onCreateGroup = async () => { 

    console.log(type_of_group.current?.value, group_number.current?.value, student_list)

    if(type_of_group.current?.value !== "" && group_number.current?.value !== "" &&  student_list   ){} 
      // first we should create the group 

      
     const group_id = await  CREATE_GROUP(Number(group_number.current?.value), String(type_of_group.current?.value))


     student_list?.map(async(student)=>{

      let student_id = await CREATE_STUDENT(student.first_name, student.last_name, student.student_code)


      await CREATE_STUDENT_GROUP(student_id,group_id)


     })


  }


  const SELECT_STUDENTS_GROUP = async () => {
    try {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        // Join the student, group, and group_student tables to get the student's group
        const result = await db?.query(`
          SELECT s.student_id, s.first_name, s.last_name, g.group_number
          FROM student s, group g 
          JOIN group_student gs ON s.student_id = gs.student_id
          JOIN group g ON gs.group_id = g.group_id
        `);
   
        // Log the result
        console.log(result?.values);
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
        <IonAccordionGroup>

          {classes_list ? ListClasses : <IonProgressBar type="indeterminate"  ></IonProgressBar>}
        </IonAccordionGroup>





        <IonModal ref={create_class_modal_create_group} isOpen={modalCreateGroupOpened}   >
          <IonHeader>
            <IonToolbar>
              <IonTitle >create new group</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => { create_class_modal_create_group?.current?.dismiss(); setModalCreateGroupOpened(false) }}>Close</IonButton>
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

              {student_list ?  student_list?.map((student =>

            <IonItem >
                <IonText key={nanoid()} >{student.first_name} / {student.last_name} / {student.student_code} </IonText>
            </IonItem>
              ))  : null 
             }

            <IonItem >
              <IonButton onClick={() => {
                onCreateGroup()
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

