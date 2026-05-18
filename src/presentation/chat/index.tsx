import {
    Box,
    Button,
    Divider,
    Group,
    Loader,
    Paper,
    ScrollArea, Select,
    Stack,
    Text,
    TextInput,
    Title,
    useComputedColorScheme,
    useMantineTheme,
} from '@mantine/core';
import {IconPencil, IconRobot, IconSend, IconTrash, IconUser} from '@tabler/icons-react';
import {useEffect, useRef, useState} from 'react';
import {z} from 'zod';
import {useForm, zodResolver} from '@mantine/form';
import type {NextPage} from "next";
import {getTotalSessions} from "@/services/dashboard";
import BaseLayout from "@/components/Layout/_BaseLayout";
import {useToast} from "@/hooks/use-toast";
import {useMediaQuery} from '@mantine/hooks';
import {createSession, deleteSession, streamMessage, updateMessage, updateSession} from "@/services/chat";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Ou outro tema de sua preferência
import SessionDeleteModal from '@/components/SessionDeleteModal';
import SessionEditModal from "@/components/SessionEditModal";
import MessageEditModal from '@/components/MessageEditModal';
import {useTranslation} from "react-i18next";
import {isAfter, isThisMonth, isToday, isYesterday, parseISO, subDays} from 'date-fns'
import {ThinkingBubble} from '@/components/ThinkingBubble';


interface Message {
    id: number;
    session: number;
    is_user: boolean;
    content: string;
    created_at: string;
    thinking_content?: string;
    thinking?: string;
    isThinking?: boolean;
}

interface Session {
    id: number;
    user: string;
    title: string;
    session_id: string;
    created_at: string;
    messages: Message[];
    updated_at: string;
}


function groupSessions(sessions: Session[]) {
    const now = new Date()
    const groups: Record<string, Session[]> = {
        today: [],
        yesterday: [],
        last7: [],
        last30: [],
        month: [],
    }

    sessions.forEach(session => {
        const date = parseISO(session.updated_at)
        if (isToday(date)) {
            groups.today.push(session)
        } else if (isYesterday(date)) {
            groups.yesterday.push(session)
        } else if (isAfter(date, subDays(now, 7))) {
            groups.last7.push(session)
        } else if (isAfter(date, subDays(now, 30))) {
            groups.last30.push(session)
        } else if (isThisMonth(date)) {
            groups.month.push(session)
        }
    })

    return groups
}

const ChatContent: NextPage = () => {

    const isMobile = useMediaQuery('(max-width: 768px)');

    const [sessions, setSessions] = useState<Session[]>([]);
    const [groupedSessions, setGroupedSessions] = useState<Record<string, Session[]>>({});
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingSession, setLoadingSession] = useState(false);
    const {toast} = useToast();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [editModal, setEditModal] = useState<{ open: boolean, message: Message | null }>({
        open: false,
        message: null
    });
    const [editMessageLoading, setEditMessageLoading] = useState(false);
    const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
    const openEditModal = (msg: Message) => setEditModal({open: true, message: msg});
    const editForm = useForm({
        initialValues: {content: ''},
        validate: {
            content: (value) => value.trim().length === 0 ? 'Mensagem não pode ser vazia' : null,
        },
    });


    useEffect(() => {
        if (editModal.open && editModal.message) {
            editForm.setValues({content: editModal.message.content});
        }
    }, [editModal.open, editModal.message]);

    const handleEditMessage = async (content: string) => {
        if (!editModal.message || !selectedSessionId) return;
        setEditMessageLoading(true);
        try {
            // Apagar as mensagens da editada para frente (ver pelo created_at)
            setMessages(
                (prev) => prev.filter((msg) => msg.created_at < editModal.message.created_at)
            );

            await updateMessage(editModal.message.id, {content: content});

            handleSendMessage({input: content});
        } catch (error) {
            toast({
                description: <p>Erro ao editar mensagem: {(error as Record<string, unknown>)?.response?.data?.detail || (error as Record<string, unknown>).message}</p>
            });
        } finally {
            setEditModal({open: false, message: null});
            setEditMessageLoading(false);
        }
    };

    const formSchema = z.object({
        input: z.string().min(1, 'Digite uma mensagem'),
    });

    const form = useForm({
        initialValues: {input: ''},
        validate: zodResolver(formSchema),
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const {t} = useTranslation();
    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light', {getInitialValueInEffect: true});
    const isLight = computedColorScheme === 'light';
    const userBg = computedColorScheme ? theme.colors.blue[0] : theme.colors.blue[9];
    const aiBg = isLight ? theme.colors.gray[1] : theme.colors.dark[6];


    const groupOrder = [
        {key: 'today', label: t('Hoje')},
        {key: 'yesterday', label: t('Ontem')},
        {key: 'last7', label: t('Últimos 7 dias')},
        {key: 'last30', label: t('Últimos 30 dias')},
        {key: 'month', label: t('Este mês')},
    ]

    useEffect(() => {
        setGroupedSessions(
            groupSessions(
                sessions
                    .slice()
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            )
        );
    }, [sessions]);


    useEffect(() => {
        async function fetchSessions() {
            setLoadingSession(true);
            const response = await getTotalSessions();
            const data = response.data.results || [];
            console.log(data)
            setSessions(data);
            if (data.length > 0) {
                // seleciona a primeira sessão ordenada por data (updated_at) da mais atual para a mais antiga
                const sortedSessions = data.sort((a: Session, b: Session) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                setSelectedSessionId(sortedSessions[0].session_id);
                setMessages(sortedSessions[0].messages);
                setLoadingSession(false);
            }
            setLoadingSession(false);
        }

        try {
            fetchSessions();
        } catch (error) {
            console.error('Erro ao buscar sessões:', error);
            toast({
                description: <p>Erro ao carregar sessões: {(error as Record<string, unknown>)?.response?.data?.detail || (error as Record<string, unknown>).message}</p>
            });
            setLoadingSession(false);
        }

    }, []);

    useEffect(() => {
        if (!selectedSessionId) return;
        const session = sessions.find(s => s.session_id === selectedSessionId);
        setMessages(session?.messages ?? []);
    }, [selectedSessionId, sessions]);

    // Scroll apenas na inicialização quando as mensagens são carregadas pela primeira vez
    useEffect(() => {
        if (selectedSessionId && messages.length > 0) {
            // Pequeno delay para garantir que o DOM foi renderizado
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
            }, 100);
        }
    }, [selectedSessionId]); // Só executa quando muda a sessão selecionada

    // Após o carregamento das sessões e seleção da sessão inicial
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
                inputRef.current.value.length,
                inputRef.current.value.length
            );
        }
    }, [selectedSessionId]);

    const handleCreateSession = async () => {
        setLoading(true);
        setLoadingSession(true);
        try {
            const response = await createSession();
            const newSession = response.data;
            // Atualiza as sessões
            const sessionsResponse = await getTotalSessions();
            const data = sessionsResponse.data.results || [];
            setSessions(data);
            setSelectedSessionId(newSession.session_id);
            setMessages(newSession.messages ?? []);
            toast({
                description: <p>Nova sessão criada!</p>,
            });
        } catch (error) {
            toast({
                description: (
                    <>
                        <p>Erro ao criar nova sessão</p>
                        <p>{(error as Record<string, unknown>)?.response?.data?.detail || (error as Record<string, unknown>).message}</p>
                    </>
                ),
            });
        } finally {
            setLoading(false);
            setLoadingSession(false);
        }
    };


    // Função para enviar mensagem e processar o streaming
    const handleSendMessage = async (values: { input: string }) => {
        if (!selectedSessionId) return;
        setLoading(true);

        const userMsg: Message = {
            id: Date.now(),
            session: Number(selectedSessionId),
            is_user: true,
            content: values.input,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        form.reset();

        const aiMsgId = Date.now() + 1;
        setMessages((prev) => [
            ...prev,
            {
                id: aiMsgId,
                session: Number(selectedSessionId),
                is_user: false,
                content: "",
                created_at: new Date().toISOString(),
                isThinking: true,
            },
        ]);

        try {
            const reader = await streamMessage(values.input, selectedSessionId);
            let aiContent = '';
            let thinkingContent = '';
            const done = false;

            while (!done) {
                const {value, done: streamDone} = await reader.read();
                if (streamDone) break;
                const chunk = new TextDecoder().decode(value);
                chunk.split('\n').forEach((line) => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace('data: ', ''));
                            if (data.type === 'thinking') {
                                thinkingContent = data.content;
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === aiMsgId
                                            ? {...msg, thinking: thinkingContent, isThinking: true}
                                            : msg
                                    )
                                );
                            } else if (data.type === 'chunk') {
                                aiContent += data.content;
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === aiMsgId
                                            ? {...msg, content: aiContent, isThinking: false}
                                            : msg
                                    )
                                );
                            } else if (data.type === 'error') {
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === aiMsgId
                                            ? {...msg, content: `Erro: ${data.detail}`, isThinking: false}
                                            : msg
                                    )
                                );
                            } else if (data.type === 'done' && data.metrics) {
                                console.log('Métricas recebidas:', data.metrics); // <-- log das métricas
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === aiMsgId
                                            ? {
                                                ...msg,
                                                content: aiContent,
                                                isThinking: false,
                                                thinking_content: thinkingContent || msg.thinking
                                              }
                                            : msg
                                    )
                                );
                            }
                        } catch { /* ignora linhas inválidas */
                        }
                    }
                });
            }
        } catch (error) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMsgId
                        ? {...msg, content: `Erro ao conectar ao backend.`, isThinking: false}
                        : msg
                )
            );
            toast({
                title: 'Erro ao enviar mensagem',
                description: <p>{error.message}</p>,
            });
        } finally {
            setLoading(false);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 0);

            getTotalSessions().then(response => {
                const data = response.data.results || [];
                setSessions(data);
            });
        }
    };

    return (
        <BaseLayout title={"Chat"}>
            <Box style={{display: 'flex'}}>
                {/* Menu lateral de sessões */}
                {!isMobile && (
                    <>
                        <Box
                            w={260}
                            p="sm"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                height: 'calc(100dvh - 60px)', // altura dinâmica
                            }}
                        >
                            {/* Header fixo */}
                            <Box
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                    paddingBottom: 8,
                                }}
                            >
                                <Group justify="space-between">
                                    <Title order={4} mb={0}>
                                        Sessões
                                    </Title>
                                    <Button size="xs" onClick={handleCreateSession} disabled={loading}>
                                        Novo chat
                                    </Button>
                                </Group>
                            </Box>
                            <ScrollArea style={{flex: 1, minHeight: 0, marginTop: 8}}>
                                <Stack spacing="xs">
                                    {loadingSession && (
                                        <Group justify="center" py="md">
                                            <Loader/>
                                        </Group>
                                    )}
                                    {sessions.length === 0 ? (
                                        <></>
                                    ) : (
                                        groupOrder.map(({key, label}) =>
                                                groupedSessions[key].length > 0 && (
                                                    <Box key={key}>
                                                        <Text size="xs" c="dimmed" mb={4} mt={8}>
                                                            {label}
                                                        </Text>
                                                        {groupedSessions[key].map(session => (
                                                            <Paper
                                                                key={session.session_id}
                                                                p="sm"
                                                                withBorder
                                                                radius="md"
                                                                mb={8}
                                                                bg={
                                                                    session.session_id === selectedSessionId
                                                                        ? isLight ? userBg : theme.colors.blue[8]
                                                                        : isLight ? 'white' : theme.colors.dark[7]
                                                                }
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                                onClick={() => setSelectedSessionId(session.session_id)}
                                                            >
                                                                <Group justify="space-between">
                                                                    <Text size="sm">
                                                                        {session.title.length > 0
                                                                            ? session.title?.slice(0, 22) + (session.title?.length > 22 ? '...' : '')
                                                                            : `Sessão em ${new Date(session.updated_at).toLocaleString()}`}
                                                                    </Text>
                                                                    <Group gap={2}>
                                                                        <Button
                                                                            variant="subtle"
                                                                            color="gray"
                                                                            size="xs"
                                                                            px={4}
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setSessionToEdit(session.session_id);
                                                                                setEditTitle(session.title ?? '');
                                                                                setEditModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <IconPencil size={16}/>
                                                                        </Button>
                                                                        <Button
                                                                            variant="subtle"
                                                                            color="red"
                                                                            size="xs"
                                                                            px={4}
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setSessionToDelete(session.session_id);
                                                                                setDeleteModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <IconTrash size={16}/>
                                                                        </Button>
                                                                    </Group>
                                                                </Group>
                                                            </Paper>
                                                        ))}
                                                    </Box>
                                                )
                                        )

                                    )}
                                </Stack>
                            </ScrollArea>
                        </Box>

                        <Divider orientation="vertical" mx="xs"/>
                    </>

                )}


                {/* Área principal do chat */}
                <Box
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0, // importante para o ScrollArea funcionar corretamente
                        alignItems: 'center',
                    }}
                    p="sm"
                >
                    <Box
                        style={{
                            width: '100%',
                            maxWidth: isMobile ? '100%' : '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                        }}
                    >
                        {isMobile && (
                            <Group mb="sm" justify="space-between" style={{position: 'sticky', top: 0, zIndex: 10}}>
                                <Select
                                    data={sessions.map(s => ({
                                        value: s.session_id,
                                        label: s.title.length > 0
                                            ? s.title.slice(0, 22) + (s.title.length > 22 ? '...' : '')
                                            : `Sessão em ${new Date(s.updated_at).toLocaleString()}`
                                    }))}
                                    value={selectedSessionId}
                                    onChange={setSelectedSessionId}
                                    placeholder="Selecione uma sessão"
                                    style={{flex: 1}}
                                    searchable
                                    disabled={loadingSession}
                                />
                                <Button size="xs" ml="sm" onClick={handleCreateSession} disabled={loading}>
                                    Novo chat
                                </Button>
                            </Group>
                        )}

                        <ScrollArea style={{flexGrow: 1, height: '100%'}} px="sm">
                            <Stack spacing="sm">
                                {messages.map((msg) => (
                                    <div key={msg.id} style={{width: '100%'}}>
                                        {/* Renderizar ThinkingBubble para mensagens da IA com pensamento */}
                                        {!msg.is_user && (msg.thinking || msg.thinking_content || msg.isThinking) && (
                                            <Group justify="flex-start" style={{width: '100%', marginBottom: 8}}>
                                                <div style={{maxWidth: 480}}>
                                                    <ThinkingBubble
                                                        content={msg.thinking || msg.thinking_content || ''}
                                                        isThinking={msg.isThinking || false}
                                                    />
                                                </div>
                                            </Group>
                                        )}
                                        <Group
                                            justify={msg.is_user ? 'flex-end' : 'flex-start'}
                                            style={{width: '100%'}}
                                        >
                                            <Paper
                                                p="md"
                                                radius="md"
                                                shadow="xs"
                                                style={{maxWidth: 480, position: 'relative'}}
                                                bg={
                                                    isLight ? (msg.is_user ? userBg : aiBg) : (msg.is_user ? theme.colors.blue[8] : theme.colors.dark[6])
                                                }
                                                onMouseEnter={() => setHoveredMsgId(msg.id)}
                                                onMouseLeave={() => setHoveredMsgId(null)}
                                            >
                                                {
                                                    isMobile && msg.is_user && (
                                                        <Button
                                                            variant="subtle"
                                                            size="xs"
                                                            bg={{
                                                                backgroundColor: isLight ? userBg : theme.colors.blue[8],
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: 8,
                                                                right: 8,
                                                                zIndex: 2,
                                                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', // leve sombra
                                                                padding: 4,
                                                                borderRadius: 6,
                                                            }}
                                                            onClick={() => openEditModal(msg)}
                                                        >
                                                            <IconPencil size={14} color="#228be6" style={{opacity: 1}}/>
                                                        </Button>
                                                    )
                                                }

                                                {
                                                    !isMobile && msg.is_user && hoveredMsgId === msg.id && (
                                                        <Button
                                                            variant="subtle"
                                                            size="xs"
                                                            bg={{
                                                                backgroundColor: isLight ? userBg : theme.colors.blue[8],
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: 8,
                                                                right: 8,
                                                                zIndex: 2,
                                                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', // leve sombra
                                                                padding: 4,
                                                                borderRadius: 6,
                                                            }}
                                                            onClick={() => openEditModal(msg)}
                                                        >
                                                            <IconPencil size={14} color="#228be6" style={{opacity: 1}}/>
                                                        </Button>
                                                    )
                                                }
                                                <Group justify="space-between" align="center" mb={4}>
                                                    <Group gap={6} align="center">
                                                        {msg.is_user ? (
                                                            <>
                                                                <IconUser size={16} color="#228be6"/>
                                                                <Text size="xs" c="blue.7" fw={500}>
                                                                    Você
                                                                </Text>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IconRobot size={16} color="#868e96"/>
                                                                <Text size="xs" c="gray.7" fw={500}>
                                                                    IA
                                                                </Text>
                                                            </>
                                                        )}
                                                    </Group>
                                                    <Text size="xs" c="dimmed">
                                                        {new Date(msg.created_at).toLocaleString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: '2-digit',
                                                        })}
                                                    </Text>
                                                </Group>
                                                {msg.is_user ? (
                                                    <Text>{msg.content}</Text>
                                                ) : (
                                                    msg.isThinking && !msg.content ? (
                                                        <Text size="sm" c="dimmed" fs="italic">Preparando
                                                            resposta...</Text>
                                                    ) : (
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            rehypePlugins={[rehypeHighlight]}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    )
                                                )}
                                            </Paper>
                                        </Group>
                                    </div>
                                ))}
                                <div ref={messagesEndRef}/>
                            </Stack>
                        </ScrollArea>
                        {/* Campo de digitar mensagem fixo no rodapé */}
                        <Box mt="sm" px="sm">
                            {
                                selectedSessionId && (
                                    <form onSubmit={form.onSubmit(handleSendMessage)}>
                                        <Group>
                                            <TextInput
                                                ref={inputRef}
                                                id="chat-input"
                                                placeholder="Digite sua mensagem..."
                                                {...form.getInputProps('input')}
                                                style={{flexGrow: 1}}
                                                disabled={loading}
                                            />
                                            <Button
                                                loading={loading}
                                                disabled={!form.isValid() || loading}
                                                type="submit"
                                                leftSection={<IconSend size={16}/>}
                                            >
                                                Enviar
                                            </Button>
                                        </Group>
                                    </form>
                                )
                            }
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/*Modal de edição de mensagem*/}
            <MessageEditModal
                opened={editModal.open}
                initialValue={editModal.message?.content ?? ''}
                loading={editMessageLoading}
                onClose={() => setEditModal({open: false, message: null})}
                onConfirm={handleEditMessage}
            />

            {/*Modal de edição de sessão*/}
            <SessionEditModal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                value={editTitle}
                loading={loadingSession}
                onConfirm={async (newTitle) => {
                    if (!sessionToEdit) return;
                    setLoadingSession(true);
                    try {
                        await updateSession(sessionToEdit, {title: newTitle});
                        setSessions(prev =>
                            prev.map(s =>
                                s.session_id === sessionToEdit ? {...s, title: newTitle} : s
                            )
                        );
                        toast({description: <p>Título atualizado com sucesso!</p>});
                    } catch (error) {
                        toast({
                            description: <p>Erro ao editar sessão: {(error as Record<string, unknown>)?.response?.data?.detail || (error as Record<string, unknown>).message}</p>
                        });
                    } finally {
                        setEditModalOpen(false);
                        setLoadingSession(false);
                    }
                }}
            />

            {/*Modal de exclusão de sessão*/}
            <SessionDeleteModal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={async () => {
                    if (!sessionToDelete) return;
                    setLoadingSession(true);
                    try {
                        await deleteSession(sessionToDelete);
                        setSessions((prev) => prev.filter(s => s.session_id !== sessionToDelete));
                        if (selectedSessionId === sessionToDelete) {
                            setSelectedSessionId(
                                sessions.length > 1
                                    ? sessions.find(s => s.session_id !== sessionToDelete)?.session_id ?? null
                                    : null
                            );
                            setMessages([]);
                        }
                        toast({description: <p>Sessão excluída com sucesso!</p>});
                    } catch (error: any) {
                        toast({
                            description: <p>Erro ao excluir sessão: {error?.response?.data?.detail || error.message}</p>
                        });
                    } finally {
                        setDeleteModalOpen(false);
                        setLoadingSession(false);
                    }
                }}
                loading={loadingSession}
            />
        </BaseLayout>
    );
}

export default ChatContent;