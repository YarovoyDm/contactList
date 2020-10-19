import axios from 'axios'

export const API = (size) => {
    return axios.get(`https://randomuser.me/api/?results=${size}`)
}