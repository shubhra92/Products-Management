const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


const isValidBody = function (x) {
    return Object.keys(x).length > 0;
};


const validation = (arr) => {
    let keys = [];
    Object.keys(arr).forEach( x => { if (!isValid(arr[x])) keys.push(x) } );
    return keys
}


const parsingFunc = function (key) {
    if (typeof key === 'string') {
        try {
            key = JSON.parse(key);
        } catch (err) {
            return { status: false, message: "Provide valid object." }
        }
        return key;
    }
    return key;
}


let nameRegex = /^[a-zA-Z]+$/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
let pinRegex = /^\d{6}$/


module.exports = { isValid, isValidBody, validation, parsingFunc, nameRegex, emailRegex, phoneRegex, passRegex, pinRegex }