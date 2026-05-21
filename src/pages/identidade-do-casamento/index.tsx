import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/identidade-do-casamento/visao-geral',
    permanent: false,
  },
});

export default function IdentidadeDoCasamentoIndexPage() {
  return null;
}
