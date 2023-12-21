import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useSQLiteDB from "../composables/useSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";


// define the types ----------------------------------------

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

export type SQLYearScholar = {
    scholar_year_id: number,
    year: string
}

// END define the types ----------------------------------------


// Global state --------------------------------

export interface GlobalState {
    modules: SQLModule[] | [];
    setModules: React.Dispatch<React.SetStateAction<SQLModule[] | []>>
    specialties: SpecialtiesSQL[] | [];
    setSpecialties: React.Dispatch<React.SetStateAction<[] | SpecialtiesSQL[]>>
    classes_list: SQLClass[] | []
    setListClasses: React.Dispatch<React.SetStateAction<SQLClass[] | []>>
    selectedModule: string[]
    setSelectedModule: React.Dispatch<React.SetStateAction<string[]>>
    selectedSpecialties: string[]
    setSelectedSpecialties: React.Dispatch<React.SetStateAction<string[]>>

    year: Number
    setYear: React.Dispatch<React.SetStateAction<Number>>

    years: [] | SQLYearScholar[]
    setYears: React.Dispatch<React.SetStateAction<[] | SQLYearScholar[]>>
    revalidate: number
    setRevalidate: React.Dispatch<React.SetStateAction<number>>

    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}
// END  Global state --------------------------------




export const GlobalContext = createContext<GlobalState | undefined>(undefined);



export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { initialized, performSQLAction } = useSQLiteDB()

    const [modules, setModules] = useState<Array<SQLModule> | []>([]);
    const [specialties, setSpecialties] = useState<Array<SpecialtiesSQL> | []>([])
    const [classes_list, setListClasses] = useState<Array<SQLClass> | []>([])

    const [selectedModule, setSelectedModule] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [year, setYear] = useState<Number>(1)
    const [years, setYears] = useState<SQLYearScholar[] | []>([])
    const [revalidate, setRevalidate] = useState(0)

    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
        loadData()
    }, [initialized, year])


    const loadData = async () => {
        console.log(initialized)
        console.log('a')



        try {

            setIsLoading(true)
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                const respSelect = await db?.query(`SELECT * FROM module`);
                setModules(respSelect?.values as SQLModule[]);
                const respSelectSpecialties = await db?.query(`SELECT * FROM specialty`);
                setSpecialties(respSelectSpecialties?.values as SpecialtiesSQL[]);



                await db?.query(`INSERT OR IGNORE INTO scholar_year (year) VALUES ('2023/2024')`); // insert year




                const resp = await db?.query(`SELECT * FROM scholar_year`)
                setYears(resp?.values as SQLYearScholar[])



                let respSELECTED_YEAR = await db?.query(`SELECT selected_year_id FROM keys`)

                if (!respSELECTED_YEAR?.values) {

                    // IF THERE ARE NO SELECTED_YEAR YET GET THE LATEST YEAR 
                    const respLATEST_YEAR_ID = await db?.query(`
                SELECT scholar_year_id FROM scholar_year WHERE year IN 
                (SELECT MAX(year) FROM scholar_year );
                `)

                    if (respLATEST_YEAR_ID?.values && respLATEST_YEAR_ID?.values[0].scholar_year_id) {


                        await db?.query(`
                            INSERT OR IGNORE INTO keys (selected_year_id) values (?) ;

                    `, [respLATEST_YEAR_ID?.values[0]?.scholar_year_id])


                        setYear(respLATEST_YEAR_ID?.values[0].selected_year_id)


                    }

                } else {
                    setYear(respSELECTED_YEAR?.values[0].selected_year_id)
                }



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
                module.module_name_abv,
                Groupp.group_id,
                Groupp.group_number,
                Groupp.group_type
                FROM class 
                JOIN specialty ON class.specialty_id = specialty.specialty_id
                JOIN module ON class.module_id = module.module_id
                LEFT JOIN Groupp ON class.class_id = Groupp.class_id
                WHERE class.scholar_year_id = (SELECT selected_year_id FROM keys ORDER BY selected_year_id LIMIT 1) ; 

              `);


                const classesWithGroups = respSelectClasses?.values?.reduce((result: any, row: any) => {
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
                    setListClasses(classes_formatted);
                }



            });

            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)
            alert((error as Error).message);
            // setModules([])
            // setSpecialties([])// await CREATE_GROUP(1, 'TP')
            // setListClasses([])


        }
    };


    const value = useMemo(() => {
        return {
            modules, setModules,
            specialties, setSpecialties,
            classes_list, setListClasses,
            selectedModule, setSelectedModule,
            selectedSpecialties, setSelectedSpecialties,
            year, setYear,
            years, setYears,
            revalidate, setRevalidate,
            isLoading, setIsLoading
        };
    }, [modules, setModules,
        specialties, setSpecialties,
        classes_list, setListClasses,
        selectedModule, setSelectedModule,
        selectedSpecialties, setSelectedSpecialties,
        year, setYear,
        years, setYears,
        revalidate, setRevalidate,
        isLoading, setIsLoading
    ]);

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

