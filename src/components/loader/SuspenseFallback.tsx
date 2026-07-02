import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { handleProgressLoader } from '../../store/slices/generalSlice';
import ProgressLoader from './ProgressLoader';

const SuspenseFallback: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(handleProgressLoader(true));
        return () => {
            dispatch(handleProgressLoader(false));
        };
    }, [dispatch]);

    return <ProgressLoader />;
};

export default SuspenseFallback;
