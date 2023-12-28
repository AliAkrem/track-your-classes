import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonLoading,
    useIonToast,
    useIonRouter,
    IonAvatar,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ellipsisVertical, logOut } from 'ionicons/icons';
import Cookies from 'js-cookie';
import { getRefreshToken, getUserData, setAccessToken, setRefreshToken, setUserData } from '.';
import { Capacitor } from '@capacitor/core';
import ListOfCommitsModal from '../../components/listOfCommits';

export function AccountPage() {


    const [showLoading, hideLoading] = useIonLoading();
    const [showToast] = useIonToast();

    const [session, setSession] = useState<Session | null>(null);


    const router = useIonRouter();

    const [profile, setProfile] = useState({
        username: '',
        avatar_url: '',
        email: ''
    });

    const [isOffline, setIsOffline] = useState<boolean>(false)

    useEffect(() => {
        if (navigator.onLine) {

            getProfile();

        } else {
            setIsOffline(true)

            const loadUserData = async () => {
                const userData = await getUserData()

                if (userData)
                    setProfile({
                        username: userData.user_metadata.full_name,
                        avatar_url: userData?.user_metadata.picture,
                        email: userData?.user_metadata.email
                    });
            }

            loadUserData()

        }

    }, []);
    const getProfile = async () => {
        console.log('get');
        // await showLoading();


        try {


            const platform = Capacitor.getPlatform();
            if (platform === 'web') {

                let { data, error } = (await supabase.auth.getSession())
                setSession(data.session)

                if (data.session?.user) {

                    setProfile({
                        username: data.session.user.user_metadata.full_name,
                        avatar_url: data.session.user?.user_metadata.picture,
                        email: data.session.user?.user_metadata.email
                    });
                }


                if (error) {
                    console.error(error.message)
                }

                return;
            }



            const userData = await getUserData()
            const refreshToken = await getRefreshToken()



            console.log(JSON.stringify(userData))
            console.log(refreshToken)



            if (userData != null && refreshToken != null) {


                if (userData && refreshToken) {


                    let { data, error } = (await supabase.auth.refreshSession({ refresh_token: refreshToken }))

                    setSession(data.session)

                    if (error) return



                    Cookies.set('user_data', JSON.stringify(data.user))

                    if (data.user && data.session) {
                        await setUserData(data.user)
                        await setRefreshToken(data.session?.refresh_token)
                        await setAccessToken(data.session?.access_token)
                    }



                    // Cookies.set('refresh_token', JSON.stringify(data.session?.refresh_token))





                    setProfile({
                        username: userData.user_metadata.full_name,
                        avatar_url: userData?.user_metadata.picture,
                        email: userData?.user_metadata.email
                    });


                }

            }
            // let s = (await supabase.auth.getSession()).data.session

            // setSession(s)

            // const user = await supabase.auth.getUser();



            await hideLoading();

        } catch (error: any) {
            // showToast({ message: error.message, duration: 5000 });
        } finally {
            await hideLoading();
        }
    };
    const signOut = async () => {
        await supabase.auth.signOut();
        location.reload();
    }




    const selectUserOptionRef = useRef<HTMLIonSelectElement | null>(null)

    const [openCommitsListModal, setOpenCommitsListModal] = useState(false)

    const handleUserOption = (e: any) => {
        if (e.detail.value === "commit") {

            console.log('commit Action')

            
        } else if (e.detail.value === "pull") {

            
            setOpenCommitsListModal(true)

            console.log('pull Action')



        }

        if (selectUserOptionRef.current) {
            selectUserOptionRef.current.value = "OPTIONS";
        }

    }




    return (


        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Account</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>

                <IonItem>
                    <IonAvatar>
                        <img alt="avatar" src={profile.avatar_url} />
                    </IonAvatar>

                    <IonButton slot='end' fill='clear'  >
                        <IonSelect aria-label="user-option"
                            toggleIcon={ellipsisVertical}
                            interface="popover" placeholder="OPTIONS"
                            onIonChange={(e) => { handleUserOption(e) }}
                            ref={selectUserOptionRef}
                        >
                            <IonSelectOption value="commit">commit</IonSelectOption>
                            <IonSelectOption value="pull">pull</IonSelectOption>
                        </IonSelect>
                    </IonButton>

                </IonItem>
                <IonItem>
                    <IonLabel className='ion-text-wrap' >
                        <p>User Name</p>
                        {profile.username}
                    </IonLabel>
                </IonItem>
                <IonItem>
                    <IonLabel className='ion-text-wrap' >
                        <p>Email</p>
                        {profile.email}
                    </IonLabel>
                </IonItem>

                {<ListOfCommitsModal isOpen={openCommitsListModal} close={setOpenCommitsListModal} />
                }

                <div className="ion-margin" style={{ border: "1px solid" }}>

                    <IonButton className='ion-text-wrap' disabled={isOffline} onClick={signOut} style={{ display: 'flex', justifyContent: "space-between", alignItem: "center", gap: '16px' }} fill='default' >
                        <IonLabel>logout</IonLabel>
                        <IonIcon size='large' style={{ marginLeft: "10px" }} icon={logOut} />
                    </IonButton>

                </div>
            </IonContent>
        </IonPage>
    );
}