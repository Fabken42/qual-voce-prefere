import { toast } from 'react-toastify';

export const handleError = (message, duracao = 2000) => {
    toast.error(message, {
        autoClose: duracao,
    });
};
export const handleSuccess = (message, duracao = 2000) => {
    toast.success(message, {
        autoClose: duracao,
    });
};