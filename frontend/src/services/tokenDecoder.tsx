import {jwtDecode} from "jwt-decode";

interface DecodedToken {
    user_id: string,
    email: string,
}

export const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.user_id;
    } catch (error) {
        console.error("Token-ul nu a putut fi decodat.", error);
        return null;
    }
};

export const getUserIdWithGivenToken = (token) => {
    if (!token) return null;

    try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.user_id;
    } catch (error) {
        console.error("Token-ul nu a putut fi decodat.", error);
        return null;
    }
};
export const getUserRole = () => {
    const role = localStorage.getItem("role");
    if (!role) return null;
    return role;
}

export const getUserEmail = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.email;
    } catch (error) {
        console.error("Token-ul nu a putut fi decodat.", error);
        return null;
    }
}