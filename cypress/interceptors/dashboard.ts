export const defaultInterceptors = () => {
    cy.intercept(
        'POST',
        'http://localhost:8000/api/auth/login/',
        (req) => {
            req.reply({
                statusCode: 200,
                fixture: 'login/get_auth.json'
            })
        }
    ).as('login')

    cy.intercept(
        'POST',
        'http://localhost:8000/api/auth/register/',
        (req) => {
            req.reply({
                statusCode: 200,
                fixture: 'register/get_user.json'
            })
        }
    ).as('register')

    cy.intercept(
        'POST',
        'http://localhost:8000/api/task/',
        (req) => {
            req.reply({
                statusCode: 200,
                fixture: 'system/create_task.json'
            })
        }
    ).as('create_task')

    cy.intercept(
        'POST',
        'http://localhost:8000/api/category/',
        (req) => {
            req.reply({
                statusCode: 200,
                fixture: 'system/create_category.json'
            })
        }
    ).as('create_category')

    cy.intercept(
        'GET',
        'http://localhost:8000/api/task/?page=1',
        (req) => {
            req.reply({
                statusCode: 200,
                fixture: 'system/list_tasks.json'
            })
        }
    ).as('list_tasks')

}


