import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { download, gitBranch, gitCommit, gitCompare, gitNetwork } from "ionicons/icons";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { supabase, useSupabaseNative } from "../../../supabaseClient";
import { getAccessToken, getUserData } from "../../pages/auth";
import { Capacitor } from "@capacitor/core";
import useSQLiteDB from "../../composables/useSQLiteDB";


type Props = {
    isOpen: boolean,
    close: React.Dispatch<React.SetStateAction<boolean>>
    // close
}

type Commit = {
    commit_id: string
    created_at: string
    readable_format: string
}



export default function ListOfCommitsModal({ isOpen, close }: Props) {


    const modal = useRef<HTMLIonModalElement>()

    const { importDBfromJson } = useSQLiteDB()

    const [commitsList, setCommitList] = useState<Commit[] | []>([])





    useEffect(() => {

        const loadCommits = async () => {



            const platform = Capacitor.getPlatform();


            if (platform === 'android') {

                const user_data = await getUserData()
                const access_token = await getAccessToken()

                if (access_token && user_data) {

                    const { data: usersCommits, error } = await useSupabaseNative(access_token, user_data.id)
                        .from('users_commits')
                        .select('commit_id , created_at')
                        .order('created_at', { ascending: false })

                    if (usersCommits) {

                        const readable_format: Commit[] = usersCommits.map((commit) => {

                            // Convert the string to a Date object
                            const dateObj = new Date(commit.created_at);


                            return {
                                created_at: commit.created_at, readable_format: dateObj.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    // minute: 'numeric',
                                    // second: '2-digit',
                                    fractionalSecondDigits: 3,
                                    // timeZoneName: 'short'
                                }),
                                commit_id: commit.commit_id

                            }


                        })

                        setCommitList(readable_format)

                    }

                    else if (error) {
                        console.log(error)
                        alert(error)

                    }

                }


            } else if (platform === 'web') {

                let { data: usersCommits, error } = await supabase
                    .from('users_commits')
                    .select('commit_id , created_at')
                    .order('created_at', { ascending: false })

                if (usersCommits) {
                    // setCommitList(usersCommits)

                    const readable_format: Commit[] = usersCommits.map((commit) => {

                        // Convert the string to a Date object
                        const dateObj = new Date(commit.created_at);


                        return {
                            created_at: commit.created_at, readable_format: dateObj.toLocaleString('fr-AL', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: 'numeric',
                                // second: '2-digit',
                                // fractionalSecondDigits: 3,
                                // timeZoneName: 'short'
                            }),
                            commit_id: commit.commit_id
                        }


                    })

                    setCommitList(readable_format)

                }

                else if (error) {
                    console.log(error)
                    alert(error)

                }


            }





        }

        loadCommits()







    }, [isOpen])



    const handleDownloadCommit = async (commit_id: string) => {



        const platform = Capacitor.getPlatform()


        if (platform === 'android') {


            const accessToken = await getAccessToken()
            const user_data = await getUserData();

            if (accessToken && user_data) {

                const { data, error } = await useSupabaseNative(accessToken, user_data.id)
                    .from('users_commits')
                    .select('db_snapshot')
                    .eq('commit_id', commit_id)
                    .single()

                if (error) {
                    alert('error occurred try again later')
                    return
                }

                if (data) {
                    const jsonDB: string  = data?.db_snapshot

     
    
                    importDBfromJson(jsonDB)

                }




            }

        } else if (platform === 'web') {


            const { data, error } = await supabase
                .from('users_commits')
                .select('db_snapshot')
                .eq('commit_id', commit_id)
                .single()


            if (error) {
                alert('error occurred try again later')
                return
            }

            if (data) {


                const jsonDB: string  = data?.db_snapshot

                importDBfromJson(jsonDB)

            }





        }



    }


    const commitList = commitsList ? commitsList?.map((commit =>

        <IonItem key={nanoid()}    >
            <IonIcon slot="start" icon={gitCommit} ></IonIcon>
            <IonLabel className="ion-text-wrap"   >
                <h2 >   {commit.readable_format} </h2>
            </IonLabel>
            <IonButton onClick={() => handleDownloadCommit(commit.commit_id)} size="default" fill="default" slot="end" >
                <IonIcon icon={download} />
            </IonButton>
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

                        {commitsList.length > 0 ? commitList : <div style={{ display: 'flex', alignItems: 'center', height: "80vh", justifyContent: 'center' }}  >
                            <IonCard >
                                <IonCardContent  >no commit here yet!. Click (commit) to add one </IonCardContent>
                            </IonCard>
                        </div>}


                    </IonList>
                </IonContent>
            </IonModal >
        </>
    )
}
