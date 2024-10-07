import axios from "axios"

const getInstance = () => {
    return axios.create({
        baseURL: "https://bokko.322228.xyz/",
        timeout: 100000
    });
}

export default getInstance;