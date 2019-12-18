
//validate email function
const validateEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
};

//validate password function
const validatePassword = (password) => {
    let response = [];

    if(password.length < 8) response.push('Your password is too short.');
    if(password.length > 20) response.push('Your password is too long.');
    if(password.search(/\d/) === -1) response.push('Your password must contain at least one digit.');
    if(password.search(/[a-z]/i) < 0) response.push('Your password must contain at least one letter.');

    return response;
};

//check if form is valid
const isFormValid = formErrors => {
    let valid = true;
    //iterate through obj props and check if any err is displayed
    Object.values(formErrors).forEach(err => err.length > 0 && (valid = false));

    return valid;
};



export {validateEmail, validatePassword, isFormValid};

