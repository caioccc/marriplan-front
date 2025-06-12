import ErrorPage from '@/components/ErrorPage'
import React from 'react'


const UnexpectedErrorPage = () => {

    return (
        <ErrorPage
            title={'500'}
            message={'Ocorreu um erro inesperado'}
        />
    )
}

export default UnexpectedErrorPage
