import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useSQLiteDB from "../composables/useSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";


// define the types ----------------------------------------

export type Students = {
    student_id: number;
    student_code: string
    first_name: string;
    last_name: string;
}
export type GroupSQL = {
    group_id: number
    group_number: number,
    group_type: "TP" | 'TD'
}

export type SQLClass = {

    class_id: number
    module_name: string;
    specialty_name: string,
    specialty_level: string,
    level_year: number
    collage_year: string
    groups?: GroupSQL[]

}


export type Scholar_years = {
    collage_year: string
}


export type Session_date = {

    session_date: string

}


// END define the types ----------------------------------------


// Global state --------------------------------

export interface GlobalState {
    year: string
    setYear: React.Dispatch<React.SetStateAction<string>>
    revalidate: number
    setRevalidate: React.Dispatch<React.SetStateAction<number>>
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    counter: number
    setCounter: React.Dispatch<React.SetStateAction<number>>
    years: Scholar_years[]
    setYears: React.Dispatch<React.SetStateAction<Scholar_years[]>>
    classesList: SQLClass[] | [],
    setClassesList: React.Dispatch<React.SetStateAction<[] | SQLClass[]>>
    DBOpened: boolean
    setDBOpened: React.Dispatch<React.SetStateAction<boolean>>

    session_dates: [] | Session_date[]
    setSession_dates: React.Dispatch<React.SetStateAction<[] | Session_date[]>>

}
// END  Global state --------------------------------




export const GlobalContext = createContext<GlobalState | undefined>(undefined);



export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { initialized, performSQLAction } = useSQLiteDB()





    const [classesList, setClassesList] = useState<Array<SQLClass> | []>([])

    const [year, setYear] = useState<string>('')
    const [years, setYears] = useState<Scholar_years[]>([])

    const [revalidate, setRevalidate] = useState(0)

    const [isLoading, setIsLoading] = useState(true)

    const [counter, setCounter] = useState(0)


    const [DBOpened, setDBOpened] = useState<boolean>(initialized)



    const [session_dates, setSession_dates] = useState<Session_date[] | []>([])




    const loadData = async () => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(`SELECT DISTINCT collage_year FROM class`).then((res) => {
                    setYears(res?.values as Scholar_years[])
                }).then(async () => {







                }).then(async () => {





                    // Process the result (assuming 'result' is an array of rows)

                }).catch(err => {
                    console.log(err)
                })










                await db?.query(`SELECT * FROM keys`).then(async (res) => {

                    if (res?.values && res?.values.length > 0) {

                        setYear(res.values[0].selected_year)

                    } else {
                        // if there are ne selected collage_year select latest collage_year
                        await db?.query(`SELECT MAX(collage_year) as collage_year  FROM class WHERE collage_year `).then(async (res) => {


                            if (res?.values) {
                                console.log(res?.values[0]?.collage_year)

                                await db?.query(`
                                    INSERT OR IGNORE INTO keys (selected_year) values (?) ;        
                                    `,
                                    [res?.values[0]?.collage_year])

                            }

                        })
                    }
                })


                await db?.query(`SELECT  class.class_id,  class.module_name, class.specialty_name, class.specialty_level,  class.level_year, class.collage_year, Groupp.group_id, Groupp.group_number,  Groupp.group_type FROM class LEFT JOIN Groupp ON class.class_id = Groupp.class_id WHERE class.collage_year = (SELECT selected_year FROM keys LIMIT 1 )`).then(res => {
                    const classesWithGroups = res.values?.reduce((result: any, row: any) => {
                        const classInfo = result[row.class_id]
                            || {
                            class_id: row.class_id,
                            specialty_name: row.specialty_name,
                            specialty_level: row.specialty_level,
                            level_year: row.level_year,
                            collage_year: row.collage_year,
                            module_name: row.module_name,
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


                    const classes_formatted = Object.values(classesWithGroups);
                    setClassesList(classes_formatted as SQLClass[]);

                });




                await db?.query(`SELECT DISTINCT session_date FROM session_presence`).then((res) => {
                    if (res) {
                        setSession_dates(res.values as Session_date[])
                    }

                })



            });


            setIsLoading(false)





        } catch (error) {
            setIsLoading(false)
            alert((error as Error).message);
        }
    };


    useEffect(() => {
        console.log('this should be the first')
        if (initialized) {
            // loadData()
            loadData()
        }
    }, [initialized, revalidate])


    const value = {
        year, setYear,
        revalidate, setRevalidate,
        isLoading, setIsLoading,
        counter, setCounter,
        years, setYears,
        classesList, setClassesList,
        DBOpened, setDBOpened,
        session_dates, setSession_dates
    };




    return <GlobalContext.Provider value={value}>{children} </GlobalContext.Provider>;

}

export const useGlobalContext = (): GlobalState => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        // alert("Global context is undefined")
        // throw new Error("Global context is undefined");
    }
    return context!;
};

