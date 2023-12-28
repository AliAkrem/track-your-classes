import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { gitCommit } from "ionicons/icons";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../supabaseClient";


type Props = {
    isOpen: boolean,
    close: React.Dispatch<React.SetStateAction<boolean>>
    // close
}

type Commit = {
    created_at: string
}



export default function ListOfCommitsModal({ isOpen, close }: Props) {


    const modal = useRef<HTMLIonModalElement>()

    const [commitsList, setCommitList] = useState<Commit[] | []>([])

    useEffect(() => {

        const loadCommits = async () => {

            let { data: usersCommits, error } = await supabase

                .from('users_commits')
                .select('created_at').order('created_at', { ascending: true })

            if (usersCommits) {
                // setCommitList(usersCommits)

                console.log(usersCommits)
            }

            else if (error) {
                console.log(error)
            }


        }

        loadCommits()







    }, [])


    const commitList = commitsList ? commitsList?.map((commit =>

        <IonItem key={nanoid()}  >
            <IonAvatar slot="start">
                <IonIcon size="large" icon={gitCommit} ></IonIcon>
            </IonAvatar>
            <IonLabel class="ion-text-wrap" >
                <h2 >   {commit.created_at} </h2>
            </IonLabel>
        </IonItem>


    )) : null





    return (
        <>
            <IonModal isOpen={isOpen} >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle >Commits</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => {
                                modal?.current?.dismiss();
                                close(false)
                            }}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonList inset>

                        {commitList}
                    </IonList>
                </IonContent>
            </IonModal >
        </>
    )
}
