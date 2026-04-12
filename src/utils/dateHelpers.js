export const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getToday = () => formatDate(new Date());

export const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
};
