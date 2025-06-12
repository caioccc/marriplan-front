import {useState} from 'react';
import {
    Anchor,
    Button,
    CopyButton,
    Group,
    Image,
    Loader,
    Modal,
    PinInput,
    Stack,
    Stepper,
    Text,
    TextInput
} from '@mantine/core';
import {useForm, zodResolver} from '@mantine/form';
import {z} from 'zod';
import {enable2FA, generate2FA} from '@/services/2fa';

const otpSchema = z.object({
    otp: z
        .string()
        .regex(/^\d{6}$/, 'Informe os 6 dígitos numéricos do código'),
});

export function Enable2FAModal({opened, onClose, onEnabled}) {
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [qr, setQr] = useState('');
    const [secret, setSecret] = useState('');
    const [otpUri, setOtpUri] = useState('');
    const [error, setError] = useState('');

    const form = useForm({
        initialValues: {otp: ''},
        validate: zodResolver(otpSchema),
    });

    const fetchQr = async () => {
        setLoading(true);
        try {
            const data = await generate2FA();
            setQr(data.qr_code_base64);
            setSecret(data.otp_secret);
            setOtpUri(data.otp_uri);
            setActive(1);
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async (values: { otp: string }) => {
        setLoading(true);
        setError('');
        try {
            await enable2FA(values.otp);
            onEnabled();
            onClose();
        } catch (e) {
            setError('Código inválido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal size="lg" opened={opened} onClose={onClose} title="Ativar autenticação em duas etapas (2FA)" centered>
            <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step label="Aplicativo" description="Baixe o autenticador">
                    <Group direction="column" gap="md" mt="md">
                        <Text fw={500}>O que é 2FA?</Text>
                        <Text size="sm">
                            A autenticação em duas etapas (2FA) adiciona uma camada extra de segurança à sua conta.
                            Após ativar, além da senha, será necessário informar um código temporário gerado por um
                            aplicativo autenticador.
                        </Text>
                        <Text fw={500}>Como começar?</Text>
                        <Text size="sm">
                            Baixe um dos aplicativos autenticadores abaixo no seu celular:
                        </Text>
                        <Stack gap="md" w="100%">
                            <Group gap="md" justify="center">
                                <Anchor
                                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                                    target="_blank"
                                    style={{textAlign: 'center'}}
                                >
                                    <Text size="sm" ta="center">Google Authenticator</Text>
                                </Anchor>
                                <Anchor
                                    href="https://authy.com/download/"
                                    target="_blank"
                                    style={{textAlign: 'center'}}
                                >
                                    <Text size="sm" ta="center">Authy</Text>
                                </Anchor>
                            </Group>
                            <Group justify="flex-end">
                                <Button onClick={fetchQr}>Próximo</Button>
                            </Group>
                        </Stack>
                    </Group>
                </Stepper.Step>
                <Stepper.Step label="Conectar" description="Escaneie o QR Code">
                    <Group w="100%" direction="column" gap="md" mt="md">
                        <Text fw={500}>Conecte seu aplicativo autenticador</Text>
                        <Text size="sm">
                            Abra o aplicativo autenticador e escaneie o QR Code abaixo, ou insira manualmente o código
                            secreto. Guarde este código em um local seguro.
                        </Text>
                        {loading ? <Loader/> : (
                            <>
                                <Image
                                    src={qr ? `data:image/png;base64,${qr}` : undefined}
                                    alt="QR Code"
                                    w={180}
                                    maw={180}
                                    mx="auto"
                                />
                                <Text ta="center" fw={600} size="lg" mt="sm" mb={0}>
                                    {secret}
                                </Text>
                                <Group justify="center" mt={0} mb={0}>
                                    <CopyButton value={otpUri}>
                                        {({copied, copy}) => (
                                            <Button onClick={copy} variant="light" color="gray" size="sm">
                                                {copied ? 'URI copiado!' : 'Copiar URI'}
                                            </Button>
                                        )}
                                    </CopyButton>
                                </Group>
                                <Text size="xs" c="dimmed" ta="center" mt={2} mb={0}>
                                    Se não conseguir escanear, copie o código acima e adicione manualmente no app.
                                </Text>
                                <Group justify="flex-end" mt="md">
                                    <Button onClick={() => setActive(2)}>
                                        Já escaneei, avançar
                                    </Button>
                                </Group>
                            </>
                        )}
                    </Group>
                </Stepper.Step>
                <Stepper.Step label="Validar" description="Digite o código">
                    <form onSubmit={form.onSubmit(handleEnable)}>
                        <Group direction="column" gap="md" mt="md">
                            <Text fw={500}>Valide a configuração</Text>
                            <Text size="sm">
                                No aplicativo autenticador, será gerado um código de 6 dígitos. Digite-o abaixo para
                                finalizar a ativação do 2FA.
                            </Text>
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <PinInput
                                    length={6}
                                    type="number"
                                    value={form.values.otp}
                                    onChange={value => {
                                        if (/^\d*$/.test(value)) {
                                            form.setFieldValue('otp', value);
                                        }
                                    }}
                                    oneTimeCode
                                    error={!!form.errors.otp || !!error}
                                    inputMode="numeric"
                                    placeholder=""
                                />
                            </div>
                            {(form.errors.otp || error) && (
                                <Text size="xs" color="red" ta="center">
                                    {form.errors.otp || error}
                                </Text>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
                                <Button variant="default" onClick={() => setActive(1)}>
                                    Voltar
                                </Button>
                                <Button type="submit" loading={loading}>
                                    Ativar
                                </Button>
                            </div>
                        </Group>
                    </form>
                </Stepper.Step>
            </Stepper>
        </Modal>
    );
}