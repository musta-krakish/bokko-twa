import axios from "axios"

const getInstance = () => {
    return axios.create({
        baseURL: "http://http://hoenir.hopto.org/",
        timeout: 100000
    });
}

export default getInstance;