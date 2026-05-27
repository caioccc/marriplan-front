export type LegalBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

export type LegalSectionData = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export const termsLastUpdated = "27 de Maio de 2026";

export const termsIntro = [
  "Bem-vindo ao Marriplan.",
  "Estes Termos de Uso regulam o acesso e utilização da plataforma Marriplan, disponível em Marriplan.com, destinada à organização e planejamento de casamentos, gerenciamento de convidados, lista de presentes, fornecedores, inspirações e funcionalidades relacionadas.",
  "Ao acessar ou utilizar a plataforma, o usuário declara ter lido, compreendido e concordado com estes Termos.",
];

export const termsSections: LegalSectionData[] = [
  {
    id: "sobre-a-plataforma",
    title: "1. Sobre a Plataforma",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan é uma plataforma digital voltada ao planejamento de casamentos, permitindo aos usuários organizar eventos, convidados, tarefas, listas de presentes, inspirações e demais recursos relacionados.",
      },
      {
        type: "paragraph",
        text: "Algumas funcionalidades podem depender de serviços terceiros, integrações externas ou futuras funcionalidades premium.",
      },
    ],
  },
  {
    id: "cadastro-e-conta",
    title: "2. Cadastro e Conta",
    blocks: [
      {
        type: "paragraph",
        text: "Para utilizar determinadas funcionalidades, o usuário deverá criar uma conta.",
      },
      {
        type: "paragraph",
        text: "O usuário compromete-se a:",
      },
      {
        type: "list",
        items: [
          "fornecer informações verdadeiras e atualizadas;",
          "manter a confidencialidade de suas credenciais;",
          "não compartilhar acesso indevidamente;",
          "responsabilizar-se pelas atividades realizadas em sua conta.",
        ],
      },
      {
        type: "paragraph",
        text: "O Marriplan poderá suspender ou remover contas que violem estes Termos.",
      },
    ],
  },
  {
    id: "uso-permitido",
    title: "3. Uso Permitido",
    blocks: [
      {
        type: "paragraph",
        text: "O usuário concorda em utilizar a plataforma apenas para fins legais e legítimos, sendo proibido:",
      },
      {
        type: "list",
        items: [
          "utilizar a plataforma para atividades ilícitas;",
          "tentar acessar áreas restritas sem autorização;",
          "realizar engenharia reversa, scraping abusivo ou ataques;",
          "inserir conteúdos ofensivos, fraudulentos ou maliciosos;",
          "violar direitos de terceiros.",
        ],
      },
    ],
  },
  {
    id: "lista-de-presentes-e-produtos",
    title: "4. Lista de Presentes e Produtos",
    blocks: [
      {
        type: "paragraph",
        text: "A plataforma poderá exibir produtos, preços, imagens e links provenientes de lojas terceiras.",
      },
      {
        type: "paragraph",
        text: "O Marriplan:",
      },
      {
        type: "list",
        items: [
          "não garante disponibilidade, estoque ou preço atualizado;",
          "não realiza venda direta dos produtos;",
          "não se responsabiliza por compras realizadas em sites terceiros;",
          "poderá utilizar integrações, scraping ou APIs públicas para exibição de produtos.",
        ],
      },
      {
        type: "paragraph",
        text: "Os links externos direcionam para plataformas independentes, sujeitas aos próprios termos e políticas.",
      },
    ],
  },
  {
    id: "conteudo-do-usuario",
    title: "5. Conteúdo do Usuário",
    blocks: [
      {
        type: "paragraph",
        text: "O usuário mantém a propriedade sobre conteúdos enviados à plataforma, incluindo:",
      },
      {
        type: "list",
        items: [
          "imagens;",
          "textos;",
          "listas;",
          "inspirações;",
          "informações do evento.",
        ],
      },
      {
        type: "paragraph",
        text: "Ao enviar conteúdo, o usuário concede ao Marriplan licença limitada para armazenamento, processamento e exibição dentro da plataforma.",
      },
      {
        type: "paragraph",
        text: "O usuário é responsável pelos conteúdos que publicar.",
      },
    ],
  },
  {
    id: "disponibilidade-da-plataforma",
    title: "6. Disponibilidade da Plataforma",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan busca manter a plataforma disponível continuamente, mas não garante funcionamento ininterrupto.",
      },
      {
        type: "paragraph",
        text: "A plataforma poderá:",
      },
      {
        type: "list",
        items: [
          "passar por manutenção;",
          "sofrer indisponibilidades temporárias;",
          "modificar funcionalidades;",
          "adicionar ou remover recursos.",
        ],
      },
    ],
  },
  {
    id: "funcionalidades-futuras",
    title: "7. Funcionalidades Futuras",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan poderá futuramente oferecer:",
      },
      {
        type: "list",
        items: [
          "planos pagos;",
          "marketplace de fornecedores;",
          "pagamentos online;",
          "contratação de serviços;",
          "ferramentas de inteligência artificial;",
          "integrações externas.",
        ],
      },
      {
        type: "paragraph",
        text: "Novos recursos poderão possuir regras específicas complementares.",
      },
    ],
  },
  {
    id: "limitacao-de-responsabilidade",
    title: "8. Limitação de Responsabilidade",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan não se responsabiliza por:",
      },
      {
        type: "list",
        items: [
          "perdas indiretas;",
          "danos decorrentes do uso inadequado da plataforma;",
          "falhas de terceiros;",
          "indisponibilidade temporária;",
          "negociações entre usuários e fornecedores;",
          "conteúdos enviados por usuários.",
        ],
      },
    ],
  },
  {
    id: "privacidade-e-dados",
    title: "9. Privacidade e Dados",
    blocks: [
      {
        type: "paragraph",
        text: "O tratamento de dados pessoais é realizado conforme a Política de Privacidade da plataforma e em conformidade com a legislação aplicável, incluindo a LGPD.",
      },
    ],
  },
  {
    id: "encerramento-de-conta",
    title: "10. Encerramento de Conta",
    blocks: [
      {
        type: "paragraph",
        text: "O usuário poderá solicitar exclusão da conta a qualquer momento.",
      },
      {
        type: "paragraph",
        text: "O Marriplan poderá suspender ou encerrar contas em caso de:",
      },
      {
        type: "list",
        items: [
          "violação destes Termos;",
          "uso abusivo;",
          "atividades suspeitas ou ilegais.",
        ],
      },
    ],
  },
  {
    id: "alteracoes-destes-termos",
    title: "11. Alterações destes Termos",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan poderá atualizar estes Termos periodicamente.",
      },
      {
        type: "paragraph",
        text: "A continuidade de uso da plataforma após alterações representa concordância com os novos Termos.",
      },
    ],
  },
  {
    id: "contato",
    title: "12. Contato",
    blocks: [
      {
        type: "paragraph",
        text: "Em caso de dúvidas, solicitações ou questões relacionadas a estes Termos:",
      },
      {
        type: "paragraph",
        text: "E-mail: app.noreply.ai.model@gmail.com",
      },
    ],
  },
  {
    id: "foro-e-legislacao",
    title: "13. Foro e Legislação",
    blocks: [
      {
        type: "paragraph",
        text: "Estes Termos são regidos pelas leis da República Federativa do Brasil.",
      },
      {
        type: "paragraph",
        text: "Fica eleito o foro da comarca do usuário, conforme legislação aplicável, para dirimir eventuais controvérsias.",
      },
    ],
  },
];
