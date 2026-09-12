import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setError, setLoading } from "../state/auth.slice";

export const useAuth = () => {
    const dispatch = useDispatch();

    async function handleRegister ({email, contact, password, fullname, isSeller = false}){
        dispatch(setLoading(true));
        try {
            const data = await register({email, contact, password, fullname, isSeller});
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin ({email, password}){
        dispatch(setLoading(true));
        try {
            const data = await login({email, password});
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe (){
        dispatch(setLoading(true));
        try {
            const data = await getMe();
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            dispatch(setUser(null));
            return null;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogout (){
        try {
            await logout();
        } finally {
            dispatch(setUser(null));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    }
}