import axios from "axios"

const getInstance = () => {
    return axios.create({
        baseURL: "https://bokko.322228.xyz/",
        timeout: 10000
    });
}

export default getInstance;