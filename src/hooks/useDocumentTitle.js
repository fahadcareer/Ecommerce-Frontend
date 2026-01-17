import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useDocumentTitle = (title) => {
    const location = useLocation();

    useEffect(() => {
        // You could also append the site name here if available in a global context
        // But for now, we'll just set the title provided.
        // If we want "Shop | SiteName", we might need access to SiteName.
        // For simplicity:
        document.title = title;
    }, [title, location]);
};

export default useDocumentTitle;
