import ErrorPage from '@/components/ErrorPage'


const NotAuthorized = () => {

    return (
        <ErrorPage
            title={'403'}
            message={'Você não tem permissão para acessar esta página'}
        />
    )
}

export default NotAuthorized
