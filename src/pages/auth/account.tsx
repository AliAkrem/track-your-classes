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
    IonIcon
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { logOut } from 'ionicons/icons';

export function AccountPage() {
    const [showLoading, hideLoading] = useIonLoading();
    const [showToast] = useIonToast();

    const [session, setSession] = useState<Session | null>(null);


    const router = useIonRouter();
    const [profile, setProfile] = useState({
        username: '',
        avatar_url: '',
    });
    useEffect(() => {
        getProfile();
    }, []);
    const getProfile = async () => {
        console.log('get');
        // await showLoading();


        try {

            let s = (await supabase.auth.getSession()).data.session

            setSession(s)

            const user = await supabase.auth.getUser();

            if (user) {
                setProfile({
                    username: user.data.user?.user_metadata.full_name,
                    avatar_url: user.data.user?.user_metadata.picture
                });
            }

            await hideLoading();

        } catch (error: any) {
            // showToast({ message: error.message, duration: 5000 });
        } finally {
            await hideLoading();
        }
    };
    const signOut = async () => {
        await supabase.auth.signOut();
        // router.push('/auth', 'forward', 'replace');
        location.reload();
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
                    <IonAvatar  >
                        <img alt="avatar" src={session?.user.user_metadata.picture} />
                    </IonAvatar>
                </IonItem>
                <IonItem>
                    <IonLabel className='ion-text-wrap' >
                        <p>User Name</p>
                        {session?.user.user_metadata.full_name}
                    </IonLabel>
                </IonItem>
                <IonItem>
                    <IonLabel className='ion-text-wrap' >
                        <p>Email</p>
                        {session?.user?.email}
                    </IonLabel>
                </IonItem>

                    <div className="ion-margin"  style={{ border: "1px solid" }}>

                        <IonButton className='ion-text-wrap'   onClick={signOut} style={{ display: 'flex', justifyContent: "space-between", alignItem: "center", gap: '16px' }} fill='default' >
                            <IonLabel  >logout</IonLabel>
                            <IonIcon size='large' style={{ marginLeft: "10px" }} icon={logOut} />
                        </IonButton>

                    </div>
            </IonContent>
        </IonPage>
    );
}