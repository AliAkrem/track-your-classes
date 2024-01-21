import { IonDatetime } from "@ionic/react";
import { useGlobalContext } from "../../context/globalContext";
import { useEffect, useRef } from "react";


type Props = {
    setSelectedDate: React.Dispatch<React.SetStateAction<string>>
}



export default function Calendar({ setSelectedDate }: Props) {


    const { session_dates, year, revalidate } = useGlobalContext()




    let highlightedDates;


    highlightedDates = session_dates.map(date => {

        const new_date = new Date(date.session_date)
        const day = new_date.getDate().toString().padStart(2, '0');
        const month = (new_date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = new_date.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;


        return {

            date: formattedDate,
            textColor: '#fff',
            backgroundColor: 'var(--ion-color-secondary)'
        }


    })








    const calendarRef = useRef<HTMLIonDatetimeElement | null>(null)






    return (
        <IonDatetime
            size="cover"
            presentation="date"
            title={undefined}
            showDefaultTitle={true}
            showDefaultTimeLabel={true}
            color={'primary'}
            highlightedDates={highlightedDates}
            min={year.slice(0, 4) + "-08-01"}
            max={year.slice(5, 9) + "-07-01"}
            ref={calendarRef}
            onIonChange={(e) => { setSelectedDate(String(calendarRef.current?.value)) }}

        > <span slot="title"></span></IonDatetime >
    )
}
