import { IonDatetime } from "@ionic/react";
import { useGlobalContext } from "../../context/globalContext";
import { useEffect, useRef, useState } from "react";


type Props = {
    selectedDate: string
    setSelectedDate: React.Dispatch<React.SetStateAction<string>>
}



export default function Calendar({ selectedDate, setSelectedDate }: Props) {


    const { session_dates } = useGlobalContext()



    const highlightedDates = session_dates.map(date => {


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
            color={'dark'}
            highlightedDates={highlightedDates}

            ref={calendarRef}

            onIonChange={(e) => { setSelectedDate(String(calendarRef.current?.value)) }}

        > <span slot="title"></span></IonDatetime >
    )
}
