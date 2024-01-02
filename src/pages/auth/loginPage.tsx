import {
    IonButton,
    IonContent,
    IonHeader,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonLoading,
    IonIcon,
    IonButtons,
    IonMenuButton,
    isPlatform,
} from '@ionic/react';
import { Browser } from '@capacitor/browser';

import { supabase } from '../../../supabaseClient'
import {  cloudyOutline, logoGoogle } from 'ionicons/icons';

import { App } from '@capacitor/app';

import { setAccessToken, setRefreshToken, setUserData } from '.';
import { Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { GoogleIcon } from '../../theme/googleIcon';


type Props = {
    setSession: React.Dispatch<React.SetStateAction<Session | null>>
}


export function LoginPage({ setSession }: Props) {





    const [showLoading, hideLoading] = useIonLoading();



    const handleGoogleAuth = async () => {
        const url = 'https://ccssdjblnbxmqtmbwwly.supabase.co/auth/v1/authorize?provider=google';
        await Browser.open({ url });
    };



    App.addListener('appUrlOpen', async (data) => {
        console.log('lister server')
        console.log(data)

        const url = new URL(data.url);


        console.log(JSON.stringify(url))



        if (url.hash) {
            const params = new URLSearchParams(url.hash.slice(1)); // Remove the #

            // Get the values of access_token and refresh_token
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');





            if (refresh_token && access_token) {
                // Exchange the code for an access token

                const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

                console.log(JSON.stringify(data))





                if (data.session?.access_token) {


                    await setAccessToken(data.session?.access_token)
                    await setRefreshToken(data.session?.refresh_token)
                    await setUserData(data.session?.user)
                    setSession(data.session)

                    await Browser.close();
                } else {
                    console.error('Failed to exchange code for token', error);
                }
            }


        }

    });




    const signInWithProvider = async () => {
        const redirectTo = 'http://localhost:8100/auth';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (error) console.error(error);
    };




    const handleLogin = async () => {

        const platform = Capacitor.getPlatform();


        await showLoading();
        try {
            if (isPlatform('android')) {
                await handleGoogleAuth()
                location.reload()
            } else if (platform === 'web') {

                await signInWithProvider()

            } else {
                await signInWithProvider()
                
            }


        } catch (e: any) {
            // await showToast({ message: e.error_description || e.message, duration: 5000 });
        } finally {
            await hideLoading();
        }
    };


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <div className="ion-padding">
                    <h1>Login with your Google Account</h1>
                    <p>Store your data in the Cloud <IonIcon   icon={cloudyOutline} ></IonIcon>{" "}for Free</p>
                </div >

                <div className="ion-margin" style={{ border: "1px solid" }} >
                    <IonButton className='ion-text-wrap' onSubmit={handleLogin} style={{ display: 'flex' , gap: '16px', justifyContent: "space-between", alignItem: "center" }} fill='default' onClick={handleLogin}>
                        <IonLabel style={ { marginRight : '16px' }} >Sign in with Google</IonLabel>

                        <GoogleIcon   />

                    </IonButton>
                </div>

            </IonContent>
        </IonPage>
    );
}