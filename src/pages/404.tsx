import ErrorPage from '@/components/ErrorPage'
import React from 'react'


const NotFoundPage = () => {

    return (
        <ErrorPage
            title={'404'}
            message={'Página não encontrada'}
            className=".test_error_page"
        />
    )
}

export default NotFoundPage
