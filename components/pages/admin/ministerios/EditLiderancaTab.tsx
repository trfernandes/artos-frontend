import LiderancaEAcessosTab from './LiderancaEAcessosTab';

export default function EditLiderancaTab(props: { ministerioId: string }) {
  return <LiderancaEAcessosTab mode='edit' ministerioId={props.ministerioId} />;
}
