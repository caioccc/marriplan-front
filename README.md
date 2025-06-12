# Frontend 

Frontend para aplicação de Todo List App, desenvolvido em React com NextJS Framework, utilizando:
- React 19
- NextJS 15
- Typescript 5
- Axios
- ShadCN UI
- Cypress
- Eslint


## 📝 Descrição

- React 19
- NextJS 15
- Typescript 5
- NPM 10.5.0
- Node 18.20.2

## 🚀 Instalação

Para rodar a aplicação você deverá se certificar que está utilizando a versão 18.20.2 do Node e a versão 10.5.0 do NPM.

### 1. Instale o Node e o NPM na sua máquina

Se estiver no Windows:

- Baixe e instale o NodeJS: https://nodejs.org/en/download/

### 2. Instale as dependencias do projeto

Instale todas as dependencias do projeto:

```sh
$ npm install
```

## 📦 Execução em development

Para executar a aplicação, basta rodar o comando abaixo:

```sh
$ npm run dev
```

Finalmente, acesse http://localhost:3000 (frontend app).

OBS: Para rodar a aplicação, é necessário que o backend esteja rodando. Para isto, deve-se observar em enviroments/.env.dev o endereço do backend. Você pode alterar o endereço do backend para o endereço local, caso esteja rodando o backend localmente.

```ts
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

## Testes

Todos os testes criados são testes de end-to-end (e2e), construídos com a biblioteca Cypress. Nestes testes temos a
verificação dos componentes presentes na tela de acordo com requisitos pré-definidos, além da verificação de fluxos de
navegação e de interação com o usuário.

Para rodar os testes implementados, é necessário que o BACKEND esteja ligado, para que as funcionalidades implementadas
possam requisitar a API corretamente. Para isto, basta executar o comando abaixo:

```bash
  npm run cypress
```

Uma suíte com os testes irá rodar. Você pode verificar o resultado no terminal.

Se você tiver conhecimento de Cypress, é possível acessar a GUI do Cypress para visualizar os testes e rodá-los
individualmente.


## Docker

Além da instalação manual, o projeto também pode ser executado em um container Docker. Para isso, temos dois caminhos
bem fáceis. Assim, basta seguir os passos abaixo:

### Primeiro caminho

Com o docker e docker-compose instalados, basta rodar o comando abaixo na raiz do projeto frontend:

```bash
  docker-compose up -d --build
```

A aplicação já estará rodando em http://localhost:3000

### Segundo caminho

Com o docker instalado, basta rodar o comando abaixo na raiz do projeto frontend:

```bash
  docker build -t frontend .
```

Após a construção da imagem, basta rodar o comando abaixo para executar o container:

```bash
  docker run docker-next -p 3000:3000 -v /app/node_modules -v .:/app
```

A aplicação já estará rodando em http://localhost:3000


## Autor

<a href="#">
 <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/7137962?v=4" width="100px;" alt=""/>
</a>
 <br />
 <sub><b>Caio Marinho</b></sub>
 <a href="#" title="Caio Marinho">🚀</a>

[![Linkedin Badge](https://img.shields.io/badge/-Caio%20Marinho-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/caiomarinho/)](https://www.linkedin.com/in/caiomarinho/)
[![Gmail Badge](https://img.shields.io/badge/-caiomarinho8@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:caiomarinho8@gmail.com)](mailto:caiomarinho8@gmail.com)

Made with ❤️ by [Caio Marinho!](https://www.linkedin.com/in/caiomarinho/) 👋🏽 [Get in Touch!](https://www.linkedin.com/in/caiomarinho/)

