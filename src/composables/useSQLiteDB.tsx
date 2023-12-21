import { useEffect, useRef, useState } from "react";
import {
  SQLiteDBConnection,
  SQLiteConnection,
  CapacitorSQLite,
} from "@capacitor-community/sqlite";
import { useGlobalContext } from "../context/globalContext";

const useSQLiteDB = () => {

  const db = useRef<SQLiteDBConnection>();
  const sqlite = useRef<SQLiteConnection>();


  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeDB = async () => {
      if (sqlite.current) return;

      sqlite.current = new SQLiteConnection(CapacitorSQLite);
      const ret = await sqlite.current.checkConnectionsConsistency();
      const isConn = (await sqlite.current.isConnection("db_vite_1", false))
        .result;

      if (ret.result && isConn) {
        db.current = await sqlite.current.retrieveConnection("db_vite_1", false);
      } else {
        db.current = await sqlite.current.createConnection(
          "db_vite_1",
          false,
          "no-encryption",
          1,
          false
        );
      }
    };

    initializeDB().then(async () => {
      await initializeTables()
        .then(
          () => {
            setInitialized(true);
          }
        );


    });
  }, []);



  const performSQLAction = async (
    action: (db: SQLiteDBConnection | undefined) => Promise<void>,
    cleanup?: () => Promise<void>
  ) => {
    try {
      await db.current?.open().then(async () => {
        await action(db.current);
      });
    } catch (error) {
      alert((error as Error).message);
    } finally {
      try {
        (await db.current?.isDBOpen())?.result && (await db.current?.close());
        cleanup && (await cleanup());
      } catch { }
    }



  };

  /**
   * here is where you cna check and update table
   * structure
   */

  const initializeTables = async () => {


    const queryCreateTable = `
    CREATE TABLE IF NOT EXISTS module( module_id INTEGER PRIMARY KEY NOT NULL,
       module_name  varchar(30) NOT NULL ,
      module_name_abv  varchar(10) NOT NULL   ) ; 
  `;

    const createSpecialtyTable = `CREATE TABLE IF NOT EXISTS specialty(
      specialty_id INTEGER PRIMARY KEY NOT NULL,
      specialty_name VARCHAR(30) NOT NULL ,
      specialty_name_abv VARCHAR(10) NOT NULL ,
      specialty_level VARCHAR(1) CHECK (specialty_level IN ('L', 'M')),
      collage_year INTEGER
  );`;


    const createStudentGroupTable = ` 
    CREATE TABLE IF NOT EXISTS  group_student (
        group_id INTEGER ,
        student_id  INTEGER  ,
        FOREIGN KEY (group_id) REFERENCES Groupp(group_id) ON DELETE  CASCADE ,
        FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE  CASCADE,
        UNIQUE (group_id, student_id)
      );  
      `;

    const createClassTable = ` 
    CREATE TABLE IF NOT EXISTS class(
        class_id INTEGER PRIMARY KEY NOT NULL,
        module_id INTEGER,
        specialty_id INTEGER,
        scholar_year_id INTEGER,
        FOREIGN KEY (module_id) REFERENCES module(module_id) ON DELETE  NO ACTION,
        FOREIGN KEY (specialty_id) REFERENCES specialty(specialty_id) ON DELETE  NO ACTION,
      FOREIGN KEY (scholar_year_id) REFERENCES scholar_year(scholar_year_id) ON DELETE NO ACTION

      );
    `


    const createStudentTable = ` 
    CREATE TABLE IF NOT EXISTS student(
        student_id INTEGER PRIMARY KEY NOT NULL,
        student_code varchar(30) NOT NULL UNIQUE ,
        first_name varchar(30) NOT NULL ,
        last_name varchar(30) NOT NULL 
      );
    `

    const createTableYearScholar = `CREATE TABLE IF NOT EXISTS 
      scholar_year(
        scholar_year_id INTEGER PRIMARY KEY NOT NULL, 
        year VARCHAR(9) UNIQUE NOT NULL CHECK(year LIKE '____/____')
       ) ; 

       INSERT OR IGNORE INTO scholar_year (year) VALUES ('2022/2023'); 
    `

    const keyValue = `CREATE TABLE IF NOT EXISTS 
      keys(
        selected_year_id INTEGER NOT NULL UNIQUE
       ); 

       
    `


    const insertYear = `INSERT OR IGNORE INTO scholar_year (year) VALUES ('2022/2023')`


    const createGroupTable = `

    CREATE TABLE IF NOT EXISTS Groupp(
      group_id INTEGER PRIMARY KEY NOT NULL , 
      class_id INTEGER NOT NULL,
      group_type VARCHAR(2) CHECK (group_type IN ('TD', 'TP')), 
      group_number  INTEGER NOT NULL,
      FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE NO ACTION,
      UNIQUE (class_id, group_number, group_type ) 
      
      );
      `;




    await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

      await db?.query(queryCreateTable); // MODULE 

      await db?.query(createSpecialtyTable);// SPECIALTY


      await db?.query(createClassTable); // CLASS 


      await db?.query(createStudentTable); // STUDENT


      await db?.query(createTableYearScholar); // YEAR_SCHOLAR

      await db?.query(insertYear); // insert year

      await db?.query(keyValue);


      let respSELECTED_YEAR = await db?.query(`SELECT selected_year_id FROM keys`)

      if (respSELECTED_YEAR?.values) {

        const respLATES_YEAR_ID = await db?.query(`
    SELECT scholar_year_id FROM scholar_year WHERE year IN 
    (SELECT MAX(year) FROM scholar_year );
    `)

        if (respSELECTED_YEAR?.values?.length == 0) {
          console.log(respLATES_YEAR_ID?.values)
          if (respLATES_YEAR_ID?.values) {
            await db?.query(`INSERT OR IGNORE INTO keys (selected_year_id) values (?) ;
          `, [Number(respLATES_YEAR_ID?.values[0]?.scholar_year_id)])



          }


        }
      }

      // const respSELECTED_YEAR = await db?.query(`
      // SELECT selected_year_id
      // FROM keys  `)
      // if (respSELECTED_YEAR?.values?.length == 0) {


      //     const respLATES_YEAR_ID = await db?.query(`
      //   SELECT scholar_year_id FROM scholar_year WHERE year IN 
      //   (SELECT MAX(year) FROM scholar_year );
      //   `)

      //   console.log(respLATES_YEAR_ID?.values)


      //   if (respLATES_YEAR_ID?.values) {
      //     await db?.query(`
      //     INSERT OR IGNORE INTO keys (selected_year_id) values (?) ;
      //     `, [Number(respLATES_YEAR_ID?.values[0]?.scholar_year_id)])
      //   }


      // }

      await db?.query(createGroupTable); // GROUP 

      await db?.query(createStudentGroupTable); // ASSIGN STUDENT TO CLASSES


      // console.log(`res: ${JSON.stringify(respCTM)}`);
    });
  };


  return { performSQLAction, initialized };
};

export default useSQLiteDB;
