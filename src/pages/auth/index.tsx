import {
    useIonLoading,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase, useSupabaseNative } from '../../../supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { AccountPage } from './account';
import { LoginPage } from './loginPage';

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import useSQLiteDB from '../../composables/useSQLiteDB';

export const setUserData = async (UserData: User) => {
    if (UserData) {
        await Preferences.set({
            key: 'userData',
            value: JSON.stringify(UserData),
        });
    }
};

export const getUserData = async () => {

    const { value } = await Preferences.get({ key: 'userData' });
    console.log(`userData ${value}!`);

    if (value)
        return JSON.parse(value) as User
            ;

    return null

};

export const setAccessToken = async (access_token: string) => {

    await Preferences.set({
        key: 'access_token',
        value: access_token,
    })


}

export const getAccessToken = async () => {
    const { value } = await Preferences.get({ key: 'access_token' });
    console.log(`userData ${value}!`);
    return value;
}

export const setRefreshToken = async (refresh_token: string) => {
    await Preferences.set({
        key: 'refresh_token',
        value: refresh_token,
    })
}

export const getRefreshToken = async () => {

    const { value } = await Preferences.get({ key: 'refresh_token' });
    console.log(`userData ${value}!`);
    return value;

}





export default function Auth() {


    const [showLoading, hideLoading] = useIonLoading();

    const [isLoading, setIsLoading] = useState(true)

    const [session, setSession] = useState<Session | null>(null);

    const [isOffline, setIsOffline] = useState<boolean>(false)

    const [userDataExist, setUserDataExist] = useState<boolean>(false)


    useEffect(() => {

        if (navigator.onLine) {

            getProfile();

        } else {
            setIsOffline(true)

            const loadUserData = async () => {
                const userData = await getUserData()

                if (userData) {
                    setUserDataExist(true)
                }

            }

            loadUserData()

        }


    }, []);


    const handleExportDBAndroid = async () => {

        await exportDB().then((res) => {
            getUserData().then((user_data) => {
                getAccessToken().then(async (access_token) => {

                    if (access_token && user_data) {

                        const { error } = await useSupabaseNative(access_token, user_data.id)
                            .from('users_commits')
                            .insert([
                                { user_id: user_data?.id, db_snapshot: res?.export },
                            ])

                        if (error) {
                            if (error.code === "23505") {
                                alert('you have been already committed changes');
                            } else {

                                console.log(JSON.stringify(error))
                                alert('operation failed reopen the app and try again ');
                            }
                        } else {
                            alert('operation succeed');
                        }

                    } else {
                        alert('operation failed reopen the app and try again ');

                    }

                })

            })

        }).catch(err => {
        })


    }




    const getProfile = async () => {


        try {

            const platform = Capacitor.getPlatform();
            if (platform === 'web') {

                let { data, error } = (await supabase.auth.getSession())
                setSession(data.session)




                setIsLoading(false)


                return;
            }

            const userData = await getUserData()
            const refreshToken = await getRefreshToken()


            if (userData != null && refreshToken != null) {

                let { data, error } = (await supabase.auth.refreshSession({ refresh_token: refreshToken }))

                if (error) {
                    setIsLoading(false)
                    return
                }

                setSession(data.session)



                if (data.user && data.session?.refresh_token && data.session.access_token) {

                    await setUserData(data.user)
                    await setRefreshToken(data.session?.refresh_token)
                    await setAccessToken(data.session?.access_token)


                }


                setIsLoading(false)


            }







        } catch (error: any) {
            await hideLoading();
            setIsLoading(false)

            // showToast({ message: error.message, duration: 5000 });
        } finally {
            await hideLoading();
            setIsLoading(false)

        }
    };


    const { exportDB } = useSQLiteDB()

    if (isLoading) return <div>loading...</div>

    if (session?.user || (isOffline && userDataExist)) return <AccountPage handleExportDBAndroid={handleExportDBAndroid} exportDB={exportDB} />
    else {
        return <LoginPage setSession={setSession} />
    }


}

