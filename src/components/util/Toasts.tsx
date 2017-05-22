import * as React from "react";

export const toastUpdateSuccess = () => {
    return (<div><h3>Update successful</h3></div>);
};

export const toastUpdateError = (error: Error) => {
    return (<div><h3>Update failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};

export const toastDeleteSuccess = () => {
    return (<div><h3>Delete successful</h3></div>);
};

export const toastDeleteError = (error: Error) => {
    return (<div><h3>Delete failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};
