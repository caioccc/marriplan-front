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

export const privacyLastUpdated = "27 de Maio de 2026";

export const privacyIntro = [
  "O Marriplan respeita a privacidade dos usuários e está comprometido com a proteção dos dados pessoais tratados em sua plataforma.",
  "Esta Política de Privacidade explica como coletamos, utilizamos, armazenamos e protegemos as informações dos usuários do Marriplan.",
  "Ao utilizar a plataforma, o usuário concorda com os termos desta Política.",
];

export const privacySections: LegalSectionData[] = [
  {
    id: "quem-somos",
    title: "1. Quem Somos",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan é uma plataforma digital destinada ao planejamento e organização de casamentos, oferecendo funcionalidades como:",
      },
      {
        type: "list",
        items: [
          "gerenciamento de convidados;",
          "listas de presentes;",
          "organização de tarefas;",
          "inspirações;",
          "fornecedores;",
          "recursos personalizados relacionados a eventos.",
        ],
      },
    ],
  },
  {
    id: "dados-coletados",
    title: "2. Dados Coletados",
    blocks: [
      {
        type: "paragraph",
        text: "Podemos coletar os seguintes dados:",
      },
      {
        type: "paragraph",
        text: "Dados fornecidos pelo usuário:",
      },
      {
        type: "list",
        items: [
          "nome;",
          "e-mail;",
          "telefone;",
          "senha criptografada;",
          "informações do casamento/evento;",
          "listas de convidados;",
          "listas de presentes;",
          "imagens e conteúdos enviados;",
          "preferências e configurações.",
        ],
      },
      {
        type: "paragraph",
        text: "Dados coletados automaticamente:",
      },
      {
        type: "list",
        items: [
          "endereço IP;",
          "navegador e dispositivo;",
          "páginas acessadas;",
          "data e horário de acesso;",
          "cookies e identificadores de sessão;",
          "logs de utilização.",
        ],
      },
    ],
  },
  {
    id: "como-utilizamos-os-dados",
    title: "3. Como Utilizamos os Dados",
    blocks: [
      {
        type: "paragraph",
        text: "Os dados podem ser utilizados para:",
      },
      {
        type: "list",
        items: [
          "permitir acesso à plataforma;",
          "personalizar a experiência do usuário;",
          "organizar funcionalidades do evento;",
          "melhorar a plataforma;",
          "fornecer suporte;",
          "enviar comunicações relacionadas ao serviço;",
          "proteger a segurança da plataforma;",
          "cumprir obrigações legais.",
        ],
      },
    ],
  },
  {
    id: "compartilhamento-de-dados",
    title: "4. Compartilhamento de Dados",
    blocks: [
      {
        type: "paragraph",
        text: "O Marriplan não vende dados pessoais.",
      },
      {
        type: "paragraph",
        text: "Os dados poderão ser compartilhados apenas:",
      },
      {
        type: "list",
        items: [
          "com provedores de infraestrutura e hospedagem;",
          "com serviços necessários ao funcionamento da plataforma;",
          "mediante obrigação legal;",
          "com consentimento do usuário;",
          "em integrações autorizadas pelo usuário.",
        ],
      },
    ],
  },
  {
    id: "terceiros",
    title: "5. Produtos e Serviços de Terceiros",
    blocks: [
      {
        type: "paragraph",
        text: "A plataforma poderá exibir links, produtos e conteúdos provenientes de lojas, fornecedores ou plataformas terceiras.",
      },
      {
        type: "paragraph",
        text: "O Marriplan não é responsável pelas políticas, práticas ou conteúdos de terceiros.",
      },
      {
        type: "paragraph",
        text: "Compras e contratações realizadas fora da plataforma são de responsabilidade exclusiva do usuário e do fornecedor externo.",
      },
    ],
  },
  {
    id: "cookies-e-tecnologias-semelhantes",
    title: "6. Cookies e Tecnologias Semelhantes",
    blocks: [
      {
        type: "paragraph",
        text: "Utilizamos cookies e tecnologias semelhantes para:",
      },
      {
        type: "list",
        items: [
          "autenticação;",
          "manutenção de sessão;",
          "preferências do usuário;",
          "métricas e análise de uso;",
          "segurança da plataforma.",
        ],
      },
      {
        type: "paragraph",
        text: "O usuário pode gerenciar cookies diretamente em seu navegador.",
      },
    ],
  },
  {
    id: "armazenamento-e-seguranca",
    title: "7. Armazenamento e Segurança",
    blocks: [
      {
        type: "paragraph",
        text: "Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais contra:",
      },
      {
        type: "list",
        items: [
          "acesso não autorizado;",
          "perda;",
          "alteração;",
          "divulgação indevida.",
        ],
      },
      {
        type: "paragraph",
        text: "Apesar dos esforços de segurança, nenhum sistema é completamente invulnerável.",
      },
    ],
  },
  {
    id: "retencao-dos-dados",
    title: "8. Retenção dos Dados",
    blocks: [
      {
        type: "paragraph",
        text: "Os dados poderão ser armazenados enquanto:",
      },
      {
        type: "list",
        items: [
          "a conta permanecer ativa;",
          "forem necessários para prestação do serviço;",
          "houver obrigação legal ou regulatória;",
          "forem necessários para proteção jurídica da plataforma.",
        ],
      },
    ],
  },
  {
    id: "direitos-do-usuario",
    title: "9. Direitos do Usuário",
    blocks: [
      {
        type: "paragraph",
        text: "Nos termos da LGPD, o usuário poderá solicitar:",
      },
      {
        type: "list",
        items: [
          "confirmação do tratamento;",
          "acesso aos dados;",
          "correção de dados incompletos;",
          "anonimização ou exclusão;",
          "portabilidade;",
          "revogação do consentimento.",
        ],
      },
      {
        type: "paragraph",
        text: "As solicitações podem ser realizadas através do e-mail de contato.",
      },
    ],
  },
  {
    id: "exclusao-de-conta",
    title: "10. Exclusão de Conta",
    blocks: [
      {
        type: "paragraph",
        text: "O usuário poderá solicitar exclusão da conta e de seus dados pessoais.",
      },
      {
        type: "paragraph",
        text: "Algumas informações poderão ser mantidas quando necessário para:",
      },
      {
        type: "list",
        items: [
          "cumprimento legal;",
          "prevenção de fraudes;",
          "exercício regular de direitos.",
        ],
      },
    ],
  },
  {
    id: "alteracoes-desta-politica",
    title: "11. Alterações desta Política",
    blocks: [
      {
        type: "paragraph",
        text: "Esta Política poderá ser atualizada periodicamente.",
      },
      {
        type: "paragraph",
        text: "Recomendamos que o usuário revise este documento regularmente.",
      },
      {
        type: "paragraph",
        text: "O uso contínuo da plataforma após alterações representa concordância com a versão atualizada.",
      },
    ],
  },
  {
    id: "contato",
    title: "12. Contato",
    blocks: [
      {
        type: "paragraph",
        text: "Em caso de dúvidas, solicitações ou questões relacionadas à privacidade e proteção de dados:",
      },
      {
        type: "paragraph",
        text: "E-mail: app.noreply.ai.model@gmail.com",
      },
    ],
  },
  {
    id: "legislacao-aplicavel",
    title: "13. Legislação Aplicável",
    blocks: [
      {
        type: "paragraph",
        text: "Esta Política é regida pelas leis da República Federativa do Brasil, incluindo a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
      },
    ],
  },
];
