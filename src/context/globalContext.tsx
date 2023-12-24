import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useSQLiteDB from "../composables/useSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";


// define the types ----------------------------------------

export type Students = {
    student_id : number ;  
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
}
// END  Global state --------------------------------




export const GlobalContext = createContext<GlobalState | undefined>(undefined);



export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { initialized, performSQLAction } = useSQLiteDB()



    const [year, setYear] = useState<string>('')
    const [years, setYears] = useState<Scholar_years[]>([])

    const [revalidate, setRevalidate] = useState(0)

    const [isLoading, setIsLoading] = useState(true)

    const [counter, setCounter] = useState(0)


    const loadData = async () => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                // await db?.query(`INSERT OR IGNORE INTO scholar_year (year) VALUES ('2023/2024')`); // insert year


                // ? fix me  select list of years grouping from classes  

                const resp = await db?.query(`SELECT DISTINCT collage_year FROM class`)

                setYears(resp?.values as Scholar_years[])



                const respSELECTED_YEAR = await db?.query(`SELECT * FROM keys`)

                console.log(respSELECTED_YEAR?.values)


                if (respSELECTED_YEAR?.values && respSELECTED_YEAR?.values.length > 0) {

                    setYear(respSELECTED_YEAR.values[0].selected_year)
                   
                } else {
                    // if there are ne selected collage_year select latest collage_year
                    const respLATEST_YEAR_ID = await db?.query(`
                        SELECT MAX(collage_year) as collage_year  FROM class WHERE collage_year 
                     `)
                    if (respLATEST_YEAR_ID?.values) {
                        console.log(respLATEST_YEAR_ID?.values[0]?.collage_year)

                        await db?.query(`
                            INSERT OR IGNORE INTO keys (selected_year) values (?) ;        
                            `, 
                            [respLATEST_YEAR_ID?.values[0]?.collage_year])




                    }

                }




                // if (respSELECTED_YEAR?.values && respSELECTED_YEAR?.values.length == 0) {

                //     // IF THERE ARE NO SELECTED_YEAR YET GET THE LATEST YEAR 

                //     // ? fix me select max from  year grouping from class table
                //    

                //     console.log(respLATEST_YEAR_ID?.values)

                //     if (respLATEST_YEAR_ID?.values && respLATEST_YEAR_ID?.values[0].collage_year) {


                //         await db?.query(`
                //             INSERT OR IGNORE INTO keys (selected_year) values (?) ;

                //     `, [respLATEST_YEAR_ID?.values[0]?.collage_year])


                //         setYear(respLATEST_YEAR_ID?.values[0].collage_year)


                //     }

                // } else {

                //     if (respSELECTED_YEAR?.values )
                //         setYear(respSELECTED_YEAR?.values[0].selected_year)

                // }
            }


            );



            setIsLoading(false)




        } catch (error) {
            setIsLoading(false)
            alert((error as Error).message);
        }
    };


    useEffect(() => {
        console.log('this should be the first')
        if (initialized) {
            loadData()
            loadData()
        }
    }, [initialized, revalidate])


    const value = {
        year, setYear,
        revalidate, setRevalidate,
        isLoading, setIsLoading,
        counter, setCounter,
        years, setYears
    };


    return <GlobalContext.Provider value={value}>{children} </GlobalContext.Provider>;

}

export const useGlobalContext = (): GlobalState => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        alert("Global context is undefined")
        throw new Error("Global context is undefined");
    }
    return context;
};

