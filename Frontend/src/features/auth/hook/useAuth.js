import { useDispatch } from "react-redux";
import { register } from "../service/auth.api";
import { setUser, setError, setLoading } from "../state/auth.slice";

export const useAuth = () => {
    const dispatch = useDispatch();

    async function handleRegister ({email, contact, password, fullname, isSeller = false}){
        const data = await register({email, contact, password, fullname, isSeller});

        dispatch(setUser(data.user));
    }

    return {
        handleRegister
    }
}