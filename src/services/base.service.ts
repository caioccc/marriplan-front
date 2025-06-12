import { AxiosInstance } from 'axios'
import api from './api'

const http: AxiosInstance = api
/**
 * Constructor.
 */

/**
 * HTTP Method GET.
 *
 * @param {string} url
 * @returns {Promise<any>}
 */
export const get = async (url: string) => {
    const response = await http
        .get(url)
        .then((res) => res.data)
        .catch((err) => {
            throw err
        })
    return response
}

/**
 * HTTP Method POST.
 *
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<any>}
 */
export const post = async (url: string, body = {}) => {
    const response = await http
        .post(url, body)
        .then((res) => res.data)
        .catch((err) => {
            throw err
        })
    return response
}

/**
 * HTTP Method PUT.
 *
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<any>}
 */
export const put = async (url: string, body = {}) => {
    const response = await http
        .put(url, body)
        .then((res) => res.data)
        .catch((err) => {
            return err
        })
    return response
}

/**
 * HTTP Method PATCH.
 *
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<any>}
 */
export const patch = async (url: string, body = {}) => {
    const response = await http
        .patch(url, body)
        .then((res) => res.data)
        .catch((err) => {
            return err
        })
    return response
}

/**
 * HTTP Method DELETE.
 *
 * @param {string} url
 * @returns {Promise<any>}
 */
export const deleteMethod = async (url: string) => {
    const response = await http
        .delete(url)
        .then((res) => res.data)
        .catch((err) => {
            return err
        })
    return response
}
