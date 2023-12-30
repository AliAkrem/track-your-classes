import { IonDatetime } from "@ionic/react";

export default function Calendar() {
    return (
        <IonDatetime
            size="cover"
            presentation="date"
            title={undefined}
            showDefaultTitle={true}
            showDefaultTimeLabel={true}
            color={'dark'}
            highlightedDates={[
                {
                    date: '2023-12-30',
                    textColor: '#fff',
                    backgroundColor: 'var(--ion-color-secondary)'
                },
                {
                    date: '2023-12-20',
                    textColor: '#fff',
                    backgroundColor: 'var(--ion-color-secondary)'
                },
                {
                    date: '2023-12-12',
                    textColor: '#fff',
                    backgroundColor: 'var(--ion-color-secondary)'
                }
            ]}

        > <span slot="title"></span></IonDatetime >
    )
}
